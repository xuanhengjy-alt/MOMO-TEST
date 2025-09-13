function getRandomTestedW() {
  const n = Math.round((Math.random() * (19.9 - 1.1) + 1.1) * 10) / 10; // 1.1-19.9, 1位小数
  return n.toFixed(1) + 'W+';
}

function getRandomLikes() {
  return Math.floor(Math.random() * (999 - 100 + 1)) + 100; // 100-999
}

// 格式化大数字显示
function formatNumber(num) {
  if (typeof num === 'string') return num; // 如果已经是格式化字符串，直接返回
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+';
  } else {
    return num.toString();
  }
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

window.Utils = { getRandomTestedW, getRandomLikes, formatNumber, saveLocal, loadLocal, $, $all };


