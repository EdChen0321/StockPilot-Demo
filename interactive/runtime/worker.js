const pyodideURL = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/';
const dataDirectory = '/stockpilot-demo-data';
const filenames = ['warehouse.sqlite3', 'operations.sqlite3'];

const opened = new Promise((resolve, reject) => {
  const request = indexedDB.open('stockpilot-complete-demo-20261116', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('snapshots');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function snapshot(value) {
  const db = await opened;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('snapshots', value ? 'readwrite' : 'readonly');
    const store = transaction.objectStore('snapshots');
    const request = value ? store.put(value, 'current') : store.get('current');
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function bootstrap(base) {
  importScripts(pyodideURL + 'pyodide.js');
  const pyodide = await loadPyodide({ indexURL: pyodideURL });
  await pyodide.loadPackage(['sqlite3', 'micropip', 'tzdata']);
  await pyodide.runPythonAsync('import micropip\nawait micropip.install("openpyxl==3.1.5")');
  const response = await fetch(new URL('runtime/python.zip', base));
  if (!response.ok) throw new Error('展示程式下載失敗');
  pyodide.unpackArchive(await response.arrayBuffer(), 'zip', { extractDir: '/stockpilot' });
  pyodide.globals.set('demo_directory', dataDirectory);
  pyodide.globals.set('demo_base', base);
  pyodide.runPython(`
import sys
sys.path.insert(0, '/stockpilot/warehouse')
sys.path.insert(0, '/stockpilot')
from browser_runtime import Runtime
`);
  pyodide.FS.mkdirTree(dataDirectory);
  return pyodide;
}

let engine;
let loadedRevision;
async function run(message) {
  const pyodide = await (engine ||= bootstrap(message.base));
  return navigator.locks.request('stockpilot-demo-sqlite', async () => {
    const current = await snapshot();
    let initialized = false;
    if (!loadedRevision || loadedRevision !== current?.revision) {
      for (const [index, filename] of filenames.entries()) {
        const path = dataDirectory + '/' + filename;
        if (current) pyodide.FS.writeFile(path, current.files[index]);
        else if (pyodide.FS.analyzePath(path).exists) pyodide.FS.unlink(path);
      }
      if (!current) {
        const response = await fetch(new URL('runtime/seed.zip', message.base));
        if (!response.ok) throw new Error('完整展示資料下載失敗');
        pyodide.unpackArchive(await response.arrayBuffer(), 'zip', { extractDir: dataDirectory });
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
    self.postMessage({ id: data.id, result: await run(data) });
  } catch (error) {
    self.postMessage({ id: data.id, error: String(error.message || error) });
  }
};
