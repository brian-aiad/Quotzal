'use client';

import { useState, useCallback } from 'react';

type SnippetTab = 'inline' | 'floating';

interface EmbedSnippetSectionProps {
  slug: string;
  baseUrl: string;
}

function CodeBracketIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  );
}

function CursorArrowRaysIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

export default function EmbedSnippetSection({ slug, baseUrl }: EmbedSnippetSectionProps) {
  const [activeTab, setActiveTab] = useState<SnippetTab>('inline');
  const [copied, setCopied] = useState(false);

  const inlineSnippet = `<!-- Quotzal Insurance Form -->
<iframe
  src="${baseUrl}/f/${slug}"
  width="100%"
  height="720"
  frameborder="0"
  allow="clipboard-write"
  loading="lazy"
  title="Insurance Quote Request"
  style="border-radius:12px;border:1px solid #e5e7eb;"
></iframe>`;

  const floatingSnippet = `<!-- Quotzal Get a Quote Button -->
<script
  src="${baseUrl}/widget.js"
  data-slug="${slug}"
  data-label="Get a Quote"
  data-color="#059669"
  async
></script>`;

  const snippet = activeTab === 'inline' ? inlineSnippet : floatingSnippet;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [snippet]);

  const description =
    activeTab === 'inline'
      ? 'Embeds the full quote request form directly on your page. Works on Wix, Squarespace, WordPress, and plain HTML.'
      : 'Adds a persistent "Get a Quote" button to the bottom-right corner that opens your form in a modal overlay. Works on Wix, Squarespace, WordPress, and plain HTML.';

  const tip =
    activeTab === 'inline'
      ? 'Adjust the height attribute if the form is taller or shorter on your site.'
      : 'Customize data-label and data-color to match your brand.';

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Website Embed</h2>
      <p className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
        Paste a snippet into your website so visitors can request a quote without leaving your site.
      </p>

      {/* Tab toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => { setActiveTab('inline'); setCopied(false); }}
          className={`flex items-center gap-2 px-4 h-11 text-sm font-medium rounded-xl border transition-colors ${
            activeTab === 'inline'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CodeBracketIcon className="w-4 h-4" />
          Inline Form
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('floating'); setCopied(false); }}
          className={`flex items-center gap-2 px-4 h-11 text-sm font-medium rounded-xl border transition-colors ${
            activeTab === 'floating'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CursorArrowRaysIcon className="w-4 h-4" />
          Floating Button
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{description}</p>

      {/* Code block */}
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className={`absolute top-2 right-2 flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg transition-colors ${
            copied
              ? 'text-emerald-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5" />
              Copied
            </>
          ) : (
            <>
              <ClipboardIcon className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
        <pre className="bg-gray-950 text-gray-100 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap pr-24">
          {snippet}
        </pre>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 mt-2">{tip}</p>
    </section>
  );
}
