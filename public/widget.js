(function () {
  'use strict';

  var scriptTag = document.currentScript;
  if (!scriptTag) return;

  var slug = scriptTag.getAttribute('data-slug');
  if (!slug) return;

  var label = scriptTag.getAttribute('data-label') || 'Get a Quote';
  var color = scriptTag.getAttribute('data-color') || '#059669';
  var srcBase = scriptTag.src.split('/widget.js')[0];
  var formUrl = srcBase + '/f/' + slug + '?embed=1';

  function init() {
    // Inject styles
    var style = document.createElement('style');
    style.textContent = [
      '.qz-fab{position:fixed;bottom:24px;right:24px;z-index:99998;display:flex;align-items:center;gap:8px;padding:12px 20px;border:none;border-radius:999px;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.18);transition:transform 0.2s ease,box-shadow 0.2s ease;line-height:1;}',
      '.qz-fab:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.22);}',
      '.qz-fab svg{width:20px;height:20px;fill:currentColor;flex-shrink:0;}',
      '.qz-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}',
      '.qz-overlay.qz-open{display:flex;}',
      '.qz-modal{position:relative;background:#fff;width:100%;max-width:640px;height:90vh;max-height:820px;border-radius:16px;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.2);}',
      '.qz-modal iframe{width:100%;height:100%;border:none;display:block;}',
      '.qz-close{position:absolute;top:12px;right:12px;z-index:1;width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);color:#374151;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s ease;}',
      '.qz-close:hover{background:rgba(0,0,0,0.12);}',
      '@media(max-width:480px){',
      '  .qz-overlay.qz-open{align-items:flex-end;}',
      '  .qz-modal{max-width:100%;height:96vh;max-height:none;border-radius:16px 16px 0 0;animation:qz-slide-up 0.3s ease;}',
      '}',
      '@keyframes qz-slide-up{from{transform:translateY(100%);}to{transform:translateY(0);}}'
    ].join('\n');
    document.head.appendChild(style);

    // Create floating button
    var fab = document.createElement('button');
    fab.className = 'qz-fab';
    fab.setAttribute('aria-label', label);
    fab.style.backgroundColor = color;
    fab.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>' +
      '<span>' + label + '</span>';
    document.body.appendChild(fab);

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'qz-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Insurance Quote Request');

    var modal = document.createElement('div');
    modal.className = 'qz-modal';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'qz-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00d7';

    var iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Insurance Quote Request');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'clipboard-write');

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var iframeLoaded = false;

    function open() {
      if (!iframeLoaded) {
        iframe.src = formUrl;
        iframeLoaded = true;
      }
      overlay.classList.add('qz-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('qz-open');
      document.body.style.overflow = '';
      fab.focus();
    }

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('qz-open')) {
        close();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
