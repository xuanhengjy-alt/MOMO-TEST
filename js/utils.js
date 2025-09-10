function getRandomTestedW() {
  const n = Math.round((Math.random() * (19.9 - 1.1) + 1.1) * 10) / 10; // 1.1-19.9, 1位小数
  return n.toFixed(1) + 'W+';
}

function getRandomLikes() {
  return Math.floor(Math.random() * (999 - 100 + 1)) + 100; // 100-999
}

function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function loadLocal(key, defaultValue) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function $(selector, root=document) { return root.querySelector(selector); }
function $all(selector, root=document) { return Array.from(root.querySelectorAll(selector)); }

window.Utils = { getRandomTestedW, getRandomLikes, saveLocal, loadLocal, $, $all };


