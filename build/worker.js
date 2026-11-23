const pyodideURL = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/';
const dataDirectory = '/stockpilot-demo-data';
const filenames = ['warehouse.sqlite3', 'operations.sqlite3'];

const opened = new Promise((resolve, reject) => {
  const request = indexedDB.open('stockpilot-complete-demo-20261123-v2', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('snapshots');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function snapshot(value, key = 'current') {
  const db = await opened;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('snapshots', value ? 'readwrite' : 'readonly');
    const store = transaction.objectStore('snapshots');
    const request = value ? store.put(value, 'current') : store.get(key);
    if (value) store.put(value.revision, 'revision');
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function bootstrap(base) {
  const started = performance.now();
  const download = async name => {
    const response = await fetch(new URL('runtime/' + name, base));
    if (!response.ok) throw new Error('展示資料下載失敗');
    return response.arrayBuffer();
  };
  const application = download('python.zip');
  seedArchive = snapshot(undefined, 'revision').then(revision => revision ? null : download('seed.zip'));
  // Attach rejection handlers immediately while the engine is loading.
  application.catch(() => {});
  seedArchive.catch(() => {});
  importScripts(pyodideURL + 'pyodide.js');
  const pyodide = await loadPyodide({ indexURL: pyodideURL });
  await pyodide.loadPackage(['sqlite3', 'tzdata']);
  pyodide.unpackArchive(await application, 'zip', { extractDir: '/stockpilot' });
  pyodide.globals.set('demo_directory', dataDirectory);
  pyodide.globals.set('demo_base', base);
  pyodide.runPython(`
import sys
sys.path.insert(0, '/stockpilot/warehouse')
sys.path.insert(0, '/stockpilot')
from browser_runtime import Runtime
`);
  pyodide.FS.mkdirTree(dataDirectory);
  console.info('StockPilot engine ready', Math.round(performance.now() - started), 'ms');
  return pyodide;
}

let engine;
let seedArchive;
let loadedRevision;
async function run(message) {
  const pyodide = await (engine ||= bootstrap(message.base));
  return navigator.locks.request('stockpilot-demo-sqlite', async () => {
    const revision = await snapshot(undefined, 'revision');
    const current = revision && revision === loadedRevision
      ? { revision }
      : await snapshot();
    let initialized = false;
    if (!loadedRevision || loadedRevision !== current?.revision) {
      for (const [index, filename] of filenames.entries()) {
        const path = dataDirectory + '/' + filename;
        if (current) pyodide.FS.writeFile(path, current.files[index]);
        else if (pyodide.FS.analyzePath(path).exists) pyodide.FS.unlink(path);
      }
      if (!current) {
        const archive = await seedArchive;
        if (!archive) throw new Error('展示初始資料缺失，請重新整理');
        pyodide.unpackArchive(archive, 'zip', { extractDir: dataDirectory });
      }
      if (!current || !loadedRevision) {
        pyodide.runPython('demo = Runtime(demo_directory, demo_base)');
        initialized = true;
      }
      loadedRevision = current?.revision;
    }
    try {
      const demo = pyodide.globals.get('demo');
      let result;
      try {
        result = message.shipment
          ? demo.shipment_route(message.shipment)
          : JSON.parse(demo.request(message.role, message.path, message.method, message.body));
      } finally {
        demo.destroy();
      }
      if (!current || initialized || message.method === 'POST') {
        const revision = crypto.randomUUID();
        const files = filenames.map(name => pyodide.FS.readFile(dataDirectory + '/' + name));
        await snapshot({ revision, files });
        loadedRevision = revision;
      }
      return result;
    } catch (error) {
      loadedRevision = undefined;
      throw error;
    }
  });
}

self.onmessage = async ({ data }) => {
  try {
    if (data.preload) {
      await (engine ||= bootstrap(data.base));
      return;
    }
    self.postMessage({ id: data.id, result: await run(data) });
  } catch (error) {
    self.postMessage({ id: data.id, error: String(error.message || error) });
  }
};
