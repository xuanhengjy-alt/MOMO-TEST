/* 首页渲染与导航 */
(async function() {
  const container = document.getElementById('card-container');
  if (!container) {
    console.error('Container not found!');
    return;
  }
  
  console.log('Starting to load projects...');
  
  // 使用API服务获取数据
  let projects;
  try {
    console.log('Attempting to fetch from API...');
    projects = await window.ApiService.getTestProjects();
    console.log('API success, projects count:', projects.length);
  } catch (err) {
    console.warn('Failed to load test projects from API, using fallback data', err);
    projects = window.ApiService.getFallbackProjects();
    console.log('Using fallback data, projects count:', projects.length);
  }
  
  const tpl = document.getElementById('test-card-template');
  if (!tpl) {
    console.error('Template not found!');
    return;
  }

  // 过滤掉需要隐藏的测试项目
  console.log('Before filtering, projects count:', projects.length);
  const filteredProjects = Utils.filterVisibleProjects(projects);
  console.log('After filtering, projects count:', filteredProjects.length);
  console.log('Filtered projects:', filteredProjects.map(p => p.id));

  if (filteredProjects.length === 0) {
    console.error('No projects to display!');
    container.innerHTML = '<p class="text-center text-gray-500">No test projects available.</p>';
    return;
  }

  filteredProjects.forEach(p => {
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector('img');
    const title = node.querySelector('h3');
    const people = node.querySelector('.people');
    const btn = node.querySelector('.start-btn');
    const pricingLabel = node.querySelector('.pricing-label');

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
      temperament_type_test: 'assets/images/temperament-type-test.png',
      social_anxiety_test: 'assets/images/social-anxiety-level-test.png'
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

    // 显示免费标签
    if (p.pricingType === '免费') {
      pricingLabel.classList.remove('hidden');
    }

    function sanitizeTitleToFilename(title){
      return String(title || '')
        .toLowerCase().trim()
        .replace(/[\s/_.,:：—-]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .slice(0, 60);
    }
    btn.addEventListener('click', () => {
      const slug = sanitizeTitleToFilename(p.nameEn || p.name || p.id);
      location.href = `/test-detail.html/${encodeURIComponent(slug)}`;
    });

    container.appendChild(node);
  });
})();


