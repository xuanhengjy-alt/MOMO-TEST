// Simple i18n helper with localStorage persistence
(function(){
  const STORAGE_KEY = 'momo_lang';
  const fallback = 'zh-CN';
  const dict = {
    'zh-CN': {
      brand: 'MOMO TEST',
      home_hot: '热门测试',
      start_test: '开始测试',
      tested_people: '人已经测试',
      likes_people: '人点赞',
      breadcrumb_home: '首页',
      breadcrumb_detail: '详情',
      intro_title: '测试介绍',
      notice_title: '测试须知',
      notice_1: '1、请根据自我情况或感受来选择。',
      notice_2: '2、测试结果仅供参考，不可替代诊断。',
      total_questions: '共有 {q} 个测试问题，预计用时 {m} 分钟',
      test_result: '测试结果',
      result_analysis: '结果分析',
      restart: '重新开始测试'
    },
    'en': {
      brand: 'MOMO TEST',
      home_hot: 'Popular Tests',
      start_test: 'Start Test',
      tested_people: 'people tested',
      likes_people: 'likes',
      breadcrumb_home: 'Home',
      breadcrumb_detail: 'Detail',
      intro_title: 'Introduction',
      notice_title: 'Notes',
      notice_1: '1) Please answer according to your own situation or feelings.',
      notice_2: '2) Results are for reference only and not a diagnosis.',
      total_questions: '{q} questions in total, estimated {m} minutes',
      test_result: 'Result',
      result_analysis: 'Analysis',
      restart: 'Restart'
    }
  };

  function getLang(){
    return localStorage.getItem(STORAGE_KEY) || fallback;
  }
  function setLang(lang){
    localStorage.setItem(STORAGE_KEY, lang);
  }
  function t(key, vars){
    const lang = getLang();
    const table = dict[lang] || dict[fallback];
    let str = table[key] || key;
    if (vars) {
      Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp('\\{'+k+'\\}','g'), vars[k]);
      });
    }
    return str;
  }
  function applyI18n(root=document){
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const q = el.getAttribute('data-i18n-q');
      const m = el.getAttribute('data-i18n-m');
      el.textContent = t(key, { q, m });
    });
  }

  window.I18N = { t, applyI18n, getLang, setLang };
})();


