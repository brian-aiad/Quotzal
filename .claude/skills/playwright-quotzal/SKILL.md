# Playwright Testing Skill

Use when: running tests, fixing test failures, or adding new test coverage.

## Test Files
- tests/intake-form.spec.ts — main intake form flow
- tests/full-form-stress-test.spec.ts — full end-to-end stress test
- tests/customer-form-field-*.ts — field-level tests
- tests/form-config.spec.ts — form configuration tests
- tests/preview-reactivity.spec.ts — live preview tests

## Commands
npx playwright test                    # run all tests
npx playwright test intake-form        # run one file
npx playwright test --ui               # visual mode
npx playwright show-report             # view last results

## Rules
- NEVER edit test-results/ or test-screenshots/ manually
- Always run tests after any changes to widget.js or intake form components
- The embed widget is customer-facing — zero regressions allowed

## When Tests Fail
1. Run npx playwright test --ui to see visually what broke
2. Check if it's a timing issue (add waitForSelector)
3. Check if a component class name changed (most common cause)
