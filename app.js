const base = new URL('./interactive/', location.href);
const worker = new Worker(new URL('runtime/worker.js', base));
worker.postMessage({ preload: true, base: base.href });
let sequence = 0;
const pending = new Map();
worker.onmessage = ({data}) => {
  const request = pending.get(data.id);
  if (!request) return;
  pending.delete(data.id);
  if (data.error) request.reject(new Error(data.error));
  else request.resolve(data.result);
};
worker.onerror = () => {
  for (const request of pending.values()) request.reject(new Error('展示載入失敗，請重新整理'));
  pending.clear();
};
window.stockpilotRequest = message => new Promise((resolve,reject) => {
  const id = ++sequence;
  pending.set(id,{resolve,reject});
  worker.postMessage({...message,id,base:base.href});
});
const routes = {shop:'store/',operations:'operations/',warehouse:'warehouse/#shipping'};
const mode = new URLSearchParams(location.search).get('mode') || 'operations';
const frame = document.createElement('iframe');
frame.title = 'StockPilot 操作工作區';
frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#f5f7f5';
frame.src = new URL(routes[mode] || routes.operations,base);
const requested = new URLSearchParams(location.search).get('view');
if (requested) {
  const target = new URL(requested, location.origin);
  if (target.origin === location.origin && target.pathname.startsWith(base.pathname)) frame.src = target;
}
document.body.replaceChildren(frame);
