(() => {
  const base = new URL('../', document.currentScript.src);
  const role = document.body.dataset.demoRole;
  const logicalPath = document.body.dataset.demoPath;
  const nativeFetch = window.fetch.bind(window);
  const worker = new Worker(new URL('runtime/worker.js', base));
  const pending = new Map();
  let sequence = 0;
  let failure;

  function fail(message) {
    failure = new Error(message);
    for (const request of pending.values()) request.reject(failure);
    pending.clear();
    document.querySelector('[data-demo-status]').textContent = '展示資料無法載入。請重新整理再試。';
  }

  worker.addEventListener('error', event => fail(event.message || '展示程式無法啟動'));
  worker.addEventListener('message', ({ data }) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error));
    else request.resolve(data.result);
  });

  function rpc(message) {
    if (failure) return Promise.reject(failure);
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      worker.postMessage({ ...message, id, base: base.href });
    });
  }

  function navigation(value) {
    const url = new URL(value, location.origin);
    if (url.origin !== location.origin) return url;
    let path = url.pathname;
    if (path.startsWith(base.pathname)) path = path.slice(base.pathname.length - 1);
    path = path.replace(/\/$/, '') || '/';
    let target;
    const order = path.match(/^\/(?:operations\/)?orders\/([^/]+)$/);
    if (order) {
      url.searchParams.set('order', decodeURIComponent(order[1]));
      target = 'operations/order/';
    } else if (path === '/orders' || path === '/operations/orders') {
      target = url.searchParams.has('order') ? 'operations/order/' : 'operations/orders/';
    } else if (path === '/operations/order') {
      target = 'operations/order/';
    } else if (path === '/warehouse-workspace' || path === '/warehouse/warehouse-workspace'
        || path === '/warehouse' || path === '/fulfillment' || path === '/warehouse/fulfillment'
        || (path === '/' && role === 'fulfillment')) {
      target = 'warehouse/';
    } else if (path === '/operations' || (path === '/' && role === 'sales')) {
      target = 'operations/';
    } else if (path === '/store' || path === '/') {
      target = 'store/';
    } else if (/^\/(?:store\/)?(?:shop|cart|checkout|confirmation|product\/TIDE-(?:SWIMBAIT|FROG|WORM))$/.test(path)) {
      target = 'store/' + path.replace(/^\/(?:store\/)?/, '') + '/';
    } else if (/^\/(?:operations\/)?(?:sales|pickups|kol)$/.test(path)) {
      target = 'operations/' + path.split('/').at(-1) + '/';
    } else if (path === '/kol-workspace') {
      target = 'kol-workspace/';
    }
    return target ? new URL(target + url.search + url.hash, base) : url;
  }

  window.demoLocation = {
    get pathname() {
      if (logicalPath === '/orders/detail') {
        const order = new URLSearchParams(location.search).get('order') || '';
        return '/orders/' + encodeURIComponent(order);
      }
      return logicalPath;
    },
    get search() { return location.search; },
    get hash() { return location.hash; },
    get origin() { return location.origin; },
    set href(value) { location.href = navigation(value); },
  };
  window.demoHistory = {
    replaceState(state, title, value) { history.replaceState(state, title, navigation(value)); },
  };

  function rewrite(root) {
    if (!(root instanceof Element)) return;
    const anchors = root.matches('a[href]') ? [root] : root.querySelectorAll('a[href]');
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      // Ignore same-document links and dynamically managed download links.
      if (!href || (!href.startsWith('/') && !href.startsWith(base.href))) continue;
      const next = navigation(href);
      if (anchor.href !== next.href) anchor.href = next.href;
    }
  }

  rewrite(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') rewrite(record.target);
      else for (const node of record.addedNodes) rewrite(node);
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });

  window.fetch = async (input, options = {}) => {
    const raw = input instanceof Request ? input.url : input;
    const url = new URL(raw, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return nativeFetch(input, options);
    try {
      const reply = await rpc({ role, path: url.pathname + url.search, method: options.method || 'GET', body: options.body || 'null' });
      const body = reply.binary ? Uint8Array.from(atob(reply.body), char => char.charCodeAt(0)) : reply.body;
      document.querySelector('[data-demo-status]').textContent = '展示資料保存在這個瀏覽器';
      return new Response(body, { status: reply.status, headers: reply.headers });
    } catch (error) {
      console.error('StockPilot browser runtime', error);
      fail('展示資料無法載入');
      return new Response(JSON.stringify({ error: '展示資料無法載入，請重新整理再試' }), {
        status: 503, headers: { 'Content-Type': 'application/json' },
      });
    }
  };

  if (role === 'fulfillment' && new URLSearchParams(location.search).has('order')) {
    const order = new URLSearchParams(location.search).get('order');
    window.demoReady = rpc({ shipment: order }).then(route => {
      history.replaceState(null, '', location.pathname + '#' + route);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }).catch(error => {
      console.error('Unable to open demo shipment', error);
      document.querySelector('[data-demo-status]').textContent = '找不到這張展示訂單，請回營運查詢。';
    });
  }
})();
