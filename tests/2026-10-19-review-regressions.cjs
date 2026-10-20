/* eslint-disable @typescript-eslint/no-require-imports -- The isolated Node test loader executes TypeScript with explicit service doubles. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith('@/')) {
      const relativePath = `src/${name.slice(2)}`;
      return load(fs.existsSync(path.resolve(__dirname, '..', `${relativePath}.ts`)) ? `${relativePath}.ts` : `${relativePath}/index.ts`, mocks);
    }
    return require(name);
  };
  new Function('require', 'module', 'exports', source)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

function database(fixtures = {}, user = { id: 'broker-one' }) {
  const calls = [];
  return {
    calls,
    auth: { getUser: async () => ({ data: { user } }) },
    from(table) {
      const query = {};
      for (const method of ['select', 'eq', 'neq', 'in', 'or', 'order', 'range', 'update', 'delete', 'insert', 'is']) {
        query[method] = (...args) => { calls.push([table, method, ...args]); return query; };
      }
      query.single = query.maybeSingle = async () => fixtures[table] ?? { data: null, error: null };
      query.then = (resolve, reject) => Promise.resolve(fixtures[table] ?? { data: [], count: 0, error: null }).then(resolve, reject);
      return query;
    },
  };
}

test('rate limit expires exactly at its reset boundary and reports retry headers', () => {
  const originalNow = Date.now;
  let now = 1000;
  Date.now = () => now;
  try {
    const rate = load('src/lib/rate-limit.ts');
    assert.equal(rate.checkRateLimit('client', 'endpoint', { maxRequests: 1, windowMs: 1000 }).allowed, true);
    const blocked = rate.checkRateLimit('client', 'endpoint', { maxRequests: 1, windowMs: 1000 });
    assert.equal(blocked.allowed, false);
    assert.equal(rate.rateLimitHeaders(blocked)['Retry-After'], '1');
    now = 2000;
    assert.equal(rate.checkRateLimit('client', 'endpoint', { maxRequests: 1, windowMs: 1000 }).allowed, true);
  } finally { Date.now = originalNow; }
});

test('submissions require authentication and reject invalid pagination', async () => {
  const db = database();
  const api = load('src/app/api/dashboard/submissions/route.ts', { '@/lib/supabase/server': { createClient: async () => db } });
  for (const page of ['0', '-1', 'NaN', '1.5', 'Infinity']) {
    assert.equal((await api.GET(new Request(`http://localhost/api?page=${page}`))).status, 400);
  }
  const anonymous = load('src/app/api/dashboard/submissions/route.ts', { '@/lib/supabase/server': { createClient: async () => database({}, null) } });
  assert.equal((await anonymous.GET(new Request('http://localhost/api'))).status, 401);
});

test('submissions return a scoped, paginated API envelope', async () => {
  const db = database({ submissions: { data: [{ id: 'fixture' }], count: 26, error: null } });
  const api = load('src/app/api/dashboard/submissions/route.ts', { '@/lib/supabase/server': { createClient: async () => db } });
  const response = await api.GET(new Request('http://localhost/api?page=2'));
  assert.deepEqual((await response.json()).data.submissions, [{ id: 'fixture' }]);
  assert.ok(db.calls.some((call) => call[1] === 'eq' && call[2] === 'broker_id' && call[3] === 'broker-one'));
  assert.ok(db.calls.some((call) => call[1] === 'range' && call[2] === 20 && call[3] === 39));
});

test('CSV export honors selected IDs and filters, and neutralizes spreadsheet formulas', async () => {
  const id = '00000000-0000-4000-8000-000000000001';
  const db = database({ submissions: { data: [{ first_name: '=1+1', form_data: {}, submitted_at: '2026-10-19' }], error: null } });
  const api = load('src/app/api/dashboard/submissions/export/route.ts', { '@/lib/supabase/server': { createClient: async () => db } });
  const response = await api.GET(new Request(`http://localhost/api?ids=${id}&types=home&status=intake&search=fixture`));
  assert.equal(response.status, 200);
  assert.match(await response.text(), /'=1\+1/);
  for (const expected of [['eq', 'broker_id', 'broker-one'], ['in', 'id', [id]], ['in', 'insurance_type', ['home']], ['eq', 'status', 'intake']]) {
    assert.ok(db.calls.some((call) => JSON.stringify(call.slice(1)) === JSON.stringify(expected)));
  }
  assert.equal((await api.GET(new Request('http://localhost/api?ids=invalid'))).status, 400);
});

function intake(db) {
  return load('src/app/api/submit-form/route.ts', {
    '@/lib/supabase/admin': { createAdminClient: () => db },
    '@/lib/emails': { sendNewSubmissionEmail: async () => {}, sendCustomerConfirmationEmail: async () => {} },
    '@/lib/rate-limit': { checkRateLimit: () => ({ allowed: true }), getClientIp: () => 'fixture', rateLimitHeaders: () => ({}) },
  });
}
const validBody = {
  brokerId: 'broker-one', linkId: 'link-one', insuranceType: 'home',
  personalInfo: { firstName: 'Test', lastName: 'Fixture', email: 'fixture@example.invalid', phone: '', dateOfBirth: '' },
  typeSpecificData: {}, currentInsurance: { hasCurrentInsurance: false },
};
const post = (body) => new Request('http://localhost/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('intake rejects missing nested input with 400, not 500', async () => {
  for (const missing of ['personalInfo', 'currentInsurance', 'typeSpecificData']) {
    const body = { ...validBody };
    delete body[missing];
    assert.equal((await intake(database()).POST(post(body))).status, 400);
  }
});

for (const scenario of ['inactive-link', 'wrong-broker', 'suspended', 'disabled-type']) {
  test(`intake rejects ${scenario} before saving or emailing`, async () => {
    const db = database({
      broker_links: { data: scenario === 'inactive-link' || scenario === 'wrong-broker' ? null : { broker_id: 'broker-one', is_active: true } },
      brokers: { data: { email: 'fixture@example.invalid', brokerage_name: 'Fixture', status: scenario === 'suspended' ? 'suspended' : 'active', insurance_types_enabled: scenario === 'disabled-type' ? ['auto_personal'] : ['home'] } },
      submissions: { data: { id: 'fixture' } },
    });
    const response = await intake(db).POST(post(validBody));
    assert.ok(response.status >= 400 && response.status < 500);
    assert.ok(!db.calls.some((call) => call[1] === 'insert'));
    for (const expected of [['eq', 'id', 'link-one'], ['eq', 'broker_id', 'broker-one'], ['eq', 'is_active', true]]) {
      assert.ok(db.calls.some((call) => call[0] === 'broker_links' && JSON.stringify(call.slice(1)) === JSON.stringify(expected)));
    }
  });
}

test('intake accepts an active owned link and enabled type', async () => {
  const db = database({
    broker_links: { data: { broker_id: 'broker-one', is_active: true } },
    brokers: { data: { email: 'fixture@example.invalid', brokerage_name: 'Fixture', status: 'active', insurance_types_enabled: ['home'] } },
    submissions: { data: { id: 'fixture' } },
  });
  assert.equal((await intake(db).POST(post(validBody))).status, 200);
  assert.ok(db.calls.some((call) => call[0] === 'broker_links' && call[1] === 'eq' && call[2] === 'broker_id' && call[3] === 'broker-one'));
});

for (const success of [true, false]) {
  test(`submissions table handles ${success ? 'the API envelope' : 'failed refresh without replacing rows'}`, async () => {
    const effects = [];
    const states = [];
    const errors = [];
    const parser = { withDefault: (value) => ({ value }) };
    const initial = [];
    const rows = [{ id: 'fixture-row' }];
    const previousFetch = global.fetch;
    global.fetch = async () => Response.json(success ? { success: true, data: { submissions: rows, total: 1 } } : { success: false, error: 'Unavailable' }, { status: success ? 200 : 500 });
    try {
      const component = load('src/app/dashboard/components/submissions-table.tsx', {
        react: {
          useState: (value) => {
            const state = { value };
            states.push(state);
            return [value, (next) => { state.value = typeof next === 'function' ? next(state.value) : next; }];
          },
          useCallback: (callback) => callback,
          useRef: (current) => ({ current }),
          useEffect: (callback) => effects.push(callback),
        },
        nuqs: {
          useQueryState: (key, config) => [key === 'q' ? 'fixture' : config.value, () => {}],
          parseAsInteger: parser, parseAsString: parser, parseAsArrayOf: () => parser,
        },
        sonner: { toast: { error: (message) => errors.push(message) } },
        './insurance-type-pill': { InsuranceTypePill: () => null },
        './status-tag': { StatusTag: () => null },
        './submission-detail-panel': { SubmissionDetailPanel: () => null },
      });
      component.SubmissionsTable({ initialSubmissions: initial, initialTotal: 0, brokerageName: 'Fixture' });
      effects[0]();
      await new Promise((resolve) => setImmediate(resolve));
      assert.deepEqual(states[0].value, success ? rows : initial);
      assert.equal(states[1].value, success ? 1 : 0);
      assert.equal(errors.length, success ? 0 : 1);
    } finally { global.fetch = previousFetch; }
  });
}
