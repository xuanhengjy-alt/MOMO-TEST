/* 首页渲染与导航 */
(async function() {
  const container = document.getElementById('card-container');
  if (!container) return;
  
  // 使用API服务获取数据
  let projects;
  try {
    projects = await window.ApiService.getTestProjects();
  } catch (err) {
    console.warn('Failed to load test projects from API, using fallback data', err);
    projects = window.ApiService.getFallbackProjects();
  }
  
  const tpl = document.getElementById('test-card-template');

  // 过滤掉需要隐藏的测试项目
  const filteredProjects = Utils.filterVisibleProjects(projects);

  filteredProjects.forEach(p => {
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector('img');
    const title = node.querySelector('h3');
    const people = node.querySelector('.people');
    const btn = node.querySelector('.start-btn');

    const skeleton = node.querySelector('.skeleton');
    // 统一从 assets/images 取图，并针对常见文件名提供回退
    const imageFallbacks = {
      mbti: 'assets/images/mbti-career-personality-test.png',
      disc40: 'assets/images/disc-personality-test.png',
      mgmt_en: 'assets/images/self-assessment-of-management-skills.png',
      observation: 'assets/images/observation-ability-test.png',
      introversion_en: 'assets/images/professional-test-for-introversion-extraversion-degree.png',
      enneagram_en: 'assets/images/enneagram-personality-test.png',
      eq_test_en: 'assets/images/international-standard-emotional-intelligence-test.png',
      phil_test_en: 'assets/images/phil-personality-test.png',
      four_colors_en: 'assets/images/four-colors-personality-analysis.png',
      pdp_test_en: 'assets/images/professional-dyna-metric-program.png',
      mental_age_test_en: 'assets/images/test-your-mental-age.png',
      holland_test_en: 'assets/images/holland-occupational-interest-test.png',
      kelsey_test_en: 'assets/images/kelsey-temperament-type-test.png',
      temperament_type_test: 'assets/images/temperament-type-test.png'
    };
    const byId = imageFallbacks[p.id] || null;
    img.src = byId || p.image;
    img.alt = p.name;
    img.onerror = function(){
      img.onerror = null;
      // MBTI: 新文件名优先，旧文件名兜底
      if (p.id === 'mbti') {
        img.src = 'assets/images/mbti-career personality-test.png';
        img.onerror = function(){ img.src = 'assets/images/logo.png'; };
        return;
      }
      img.src = byId || 'assets/images/logo.png';
    };
    img.addEventListener('load', () => {
      skeleton.classList.add('hidden');
      img.classList.remove('hidden');
    });
    title.textContent = p.nameEn;

    // 使用API数据或本地存储
    const testedKey = `tested_${p.id}`;
    const likeKey = `likes_${p.id}`;
    
    // 显示测试人数
    if (p.testedCount) {
      people.textContent = Utils.formatNumber(p.testedCount);
    } else {
      let tested = Utils.loadLocal(testedKey, null);
      if (!tested) {
        tested = Utils.getRandomTestedW();
        Utils.saveLocal(testedKey, tested);
      }
      people.textContent = tested;
    }

    // 初始化点赞数
    if (p.likes) {
      Utils.saveLocal(likeKey, p.likes);
    } else if (Utils.loadLocal(likeKey, null) == null) {
      Utils.saveLocal(likeKey, Utils.getRandomLikes());
    }

    btn.addEventListener('click', () => {
      const url = new URL('test-detail.html', location.href);
      url.searchParams.set('id', p.id);
      location.href = url.toString();
    });

    container.appendChild(node);
  });
})();


