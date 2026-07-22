/* 雙發 ERP 10.0.4：全系統鍵盤操作 */
(function () {
  'use strict';

  const FOCUS_SELECTOR = [
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[role="button"]',
    '[onclick]',
    'tbody tr'
  ].join(',');

  function visible(el) {
    if (!el || el.hidden) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function activeScope() {
    const openDialog = document.querySelector('dialog[open]');
    if (openDialog) return openDialog;
    const visiblePage = Array.from(document.querySelectorAll('main section, .page, [id^="page-"]'))
      .find(el => visible(el));
    return visiblePage || document.body;
  }

  function focusables(scope) {
    return Array.from((scope || activeScope()).querySelectorAll(FOCUS_SELECTOR))
      .filter(visible)
      .filter((el, index, arr) => arr.indexOf(el) === index)
      .filter(el => !el.closest('[aria-hidden="true"]'));
  }

  function prepareElement(el) {
    if (!el || !visible(el)) return;
    if ((el.matches('[onclick], tbody tr, [role="button"]')) && !el.hasAttribute('tabindex')) {
      el.tabIndex = 0;
    }
    if (el.matches('tbody tr') && !el.hasAttribute('aria-label')) {
      const text = el.innerText.replace(/\s+/g, ' ').trim();
      if (text) el.setAttribute('aria-label', text.slice(0, 160));
    }
  }

  function prepareAll(root) {
    if (root && root.matches && root.matches(FOCUS_SELECTOR)) prepareElement(root);
    if (root && root.querySelectorAll) root.querySelectorAll(FOCUS_SELECTOR).forEach(prepareElement);
  }

  function setFocus(el) {
    if (!el) return;
    prepareElement(el);
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  function moveLinear(delta) {
    const items = focusables(activeScope());
    if (!items.length) return;
    let i = items.indexOf(document.activeElement);
    if (i < 0) i = delta > 0 ? -1 : 0;
    setFocus(items[(i + delta + items.length) % items.length]);
  }

  function moveTableRow(delta) {
    const row = document.activeElement.closest && document.activeElement.closest('tbody tr');
    if (!row) return false;
    const rows = Array.from(row.parentElement.children).filter(visible);
    const index = rows.indexOf(row);
    if (index < 0) return false;
    setFocus(rows[Math.max(0, Math.min(rows.length - 1, index + delta))]);
    return true;
  }

  function moveSpatial(direction) {
    const current = document.activeElement;
    if (!current || current === document.body) {
      const first = focusables(activeScope())[0];
      setFocus(first);
      return;
    }
    const c = current.getBoundingClientRect();
    const cx = c.left + c.width / 2;
    const cy = c.top + c.height / 2;
    let best = null;
    let bestScore = Infinity;

    for (const el of focusables(activeScope())) {
      if (el === current) continue;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      if (direction === 'left' && dx >= -4) continue;
      if (direction === 'right' && dx <= 4) continue;
      if (direction === 'up' && dy >= -4) continue;
      if (direction === 'down' && dy <= 4) continue;
      const primary = (direction === 'left' || direction === 'right') ? Math.abs(dx) : Math.abs(dy);
      const secondary = (direction === 'left' || direction === 'right') ? Math.abs(dy) : Math.abs(dx);
      const score = primary + secondary * 2.3;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
    if (best) setFocus(best);
    else moveLinear(direction === 'left' || direction === 'up' ? -1 : 1);
  }

  function isTypingControl(el) {
    return el && (el.matches('input[type="text"], input[type="search"], input[type="number"], input[type="tel"], input[type="email"], input[type="password"], textarea') || el.isContentEditable);
  }

  function focusFirstResult(input) {
    const container = input.closest('section, .card, .panel, main') || activeScope();
    const row = Array.from(container.querySelectorAll('tbody tr')).find(visible);
    if (row) {
      prepareElement(row);
      setFocus(row);
      return true;
    }
    return false;
  }

  function activate(el) {
    if (!el) return;
    if (el.matches('tbody tr, button, a[href], [onclick], [role="button"]')) {
      el.click();
      return;
    }
    if (el.matches('input[type="checkbox"], input[type="radio"]')) {
      el.click();
      return;
    }
    if (el.matches('input, select, textarea')) {
      el.dispatchEvent(new Event('change', { bubbles: true }));
      if ((el.type === 'search' || /search|query|keyword|查詢|搜尋/i.test(`${el.id} ${el.name} ${el.placeholder}`)) && focusFirstResult(el)) return;
      moveLinear(1);
    }
  }

  document.addEventListener('keydown', function (e) {
    const el = document.activeElement;

    if (e.key === 'Escape') {
      const d = document.querySelector('dialog[open]');
      if (d) {
        e.preventDefault();
        d.close();
      }
      return;
    }

    if (e.key === 'Enter') {
      if (e.shiftKey && isTypingControl(el)) return;
      if (el && el.tagName === 'TEXTAREA' && !e.ctrlKey) return;
      e.preventDefault();
      activate(el);
      return;
    }

    if (e.key === 'Tab') return; // 保留瀏覽器原生 Tab / Shift+Tab

    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    // 文字輸入時，左右鍵仍用來移動游標；上下鍵移動到前後欄位。
    if (isTypingControl(el) && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
    // 下拉選單保留上下鍵選項操作。
    if (el && el.tagName === 'SELECT') return;
    // 數字欄位保留上下調整數值；Alt+方向鍵才移動。
    if (el && el.matches('input[type="number"]') && !e.altKey) return;

    e.preventDefault();
    if (e.key === 'ArrowUp' && moveTableRow(-1)) return;
    if (e.key === 'ArrowDown' && moveTableRow(1)) return;
    moveSpatial(e.key.replace('Arrow', '').toLowerCase());
  }, true);

  document.addEventListener('focusin', function (e) {
    prepareElement(e.target);
  });

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) m.addedNodes.forEach(node => {
      if (node.nodeType === 1) prepareAll(node);
    });
  });

  function addHelpBar() {
    if (document.getElementById('keyboardHelpBar')) return;
    const bar = document.createElement('div');
    bar.id = 'keyboardHelpBar';
    bar.className = 'keyboard-help no-print';
    bar.innerHTML = '<b>⌨ 鍵盤操作：</b>方向鍵移動　Enter確認／開啟　Tab下一欄　Shift＋Tab上一欄　Esc關閉視窗';
    const header = document.querySelector('header');
    if (header) header.insertAdjacentElement('afterend', bar);
    else document.body.insertAdjacentElement('afterbegin', bar);
  }

  function init() {
    prepareAll(document);
    addHelpBar();
    observer.observe(document.body, { childList: true, subtree: true });
    document.body.classList.add('keyboard-enabled');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
