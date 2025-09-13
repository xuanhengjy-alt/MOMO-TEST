// Simple text helper - English only
(function(){
  const dict = {
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
  };

  function t(key, vars){
    let str = dict[key] || key;
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

  window.I18N = { t, applyI18n };
})();


