const STORAGE_KEY = 'biogestor:data';

export function loadData(defaultData = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultData;
  } catch (e) {
    console.warn('Error loading data from localStorage', e);
    return defaultData;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Error saving data to localStorage', e);
    return false;
  }
}

export function exportJson(data, filename = 'biogestor-export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
