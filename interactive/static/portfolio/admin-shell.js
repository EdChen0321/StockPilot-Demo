'use strict';
(() => {
  const menu = document.getElementById('hub-menu');
  const overlay = document.getElementById('hub-overlay');
  const sidebar = document.getElementById('hub-sidebar');
  if (!menu || !overlay || !sidebar) return;

  function closeMenu() {
    document.body.classList.remove('hub-menu-open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    const open = document.body.classList.toggle('hub-menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('hub-menu-open')) {
      closeMenu(); menu.focus();
    }
  });
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  if (!document.body.dataset.adminWorkspace) return;
  // Keep the original tables keyboard-scrollable without replacing their controls.
  function describeTables() {
    document.querySelectorAll('#main .table-scroll').forEach((region) => {
      if (region.scrollWidth <= region.clientWidth) return;
      region.tabIndex = 0;
      region.setAttribute('role', 'region');
      const title = region.querySelector('caption')?.textContent || '資料表格';
      region.setAttribute('aria-label', `${title}，可左右捲動`);
    });
  }
  new MutationObserver(describeTables).observe(document.getElementById('main'), { childList: true, subtree: true });
  window.addEventListener('resize', describeTables);
  describeTables();
  function updateCurrent() {
    const route = location.hash.slice(1).split('/')[0];
    const current = [...sidebar.querySelectorAll('.admin-nav a')].find((link) => {
      const target = new URL(link.href);
      const samePage = target.pathname === location.pathname ||
        (target.pathname === '/orders' && location.pathname.startsWith('/orders/'));
      return target.origin === location.origin && samePage &&
        target.hash.slice(1).split('/')[0] === route;
    });
    sidebar.querySelectorAll('.admin-nav a[aria-current]').forEach((link) => link.removeAttribute('aria-current'));
    if (current) {
      current.setAttribute('aria-current', 'page');
      current.closest('details')?.setAttribute('open', '');
    }
  }
  updateCurrent();
  window.addEventListener('hashchange', updateCurrent);
})();
