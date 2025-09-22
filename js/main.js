/* 首页渲染与导航 - 渐进式加载优化 */
(async function() {
  const container = document.getElementById('card-container');
  if (!container) {
    console.error('Container not found!');
    return;
  }
  
  console.log('🚀 开始渐进式加载优化...');
  
  // 第一步：立即显示骨架屏，提升用户体验
  showSkeletonCards(container);
  
  // 第二步：异步获取数据（不阻塞UI）
  let projects;
  try {
    console.log('📡 异步获取项目数据...');
    projects = await window.ApiService.getTestProjects();
    console.log('✅ API成功，项目数量:', projects.length);
  } catch (err) {
    console.warn('⚠️ API失败，使用回退数据', err);
    projects = window.ApiService.getFallbackProjects();
    console.log('🔄 使用回退数据，项目数量:', projects.length);
  }
  
  const tpl = document.getElementById('test-card-template');
  if (!tpl) {
    console.error('❌ 模板未找到!');
    return;
  }

  // 过滤项目
  console.log('🔍 过滤前项目数量:', projects.length);
  console.log('🔍 Utils对象:', typeof Utils, Utils);
  console.log('🔍 filterVisibleProjects方法:', typeof Utils?.filterVisibleProjects);
  
  let filteredProjects;
  if (!Utils || !Utils.filterVisibleProjects) {
    console.error('❌ Utils或filterVisibleProjects方法不存在，使用默认过滤');
    // 临时回退：直接使用所有项目
    filteredProjects = projects;
  } else {
    filteredProjects = Utils.filterVisibleProjects(projects);
  }
  console.log('✅ 过滤后项目数量:', filteredProjects.length);
  console.log('📋 过滤后的项目:', filteredProjects.map(p => p.id));

  if (filteredProjects.length === 0) {
    console.error('❌ 没有项目可显示!');
    container.innerHTML = '<p class="text-center text-gray-500">No test projects available.</p>';
    return;
  }
  
  // 第三步：清除骨架屏，开始分批渲染
  container.innerHTML = '';
  
  // 第四步：分批渲染项目（每批5个）
  renderProjectsInBatches(filteredProjects, tpl, container);
})();

// 显示骨架屏卡片
function showSkeletonCards(container) {
  console.log('🎭 显示骨架屏...');
  container.innerHTML = '';
  
  // 创建8个骨架屏卡片
  for (let i = 0; i < 8; i++) {
    const skeletonCard = document.createElement('article');
    skeletonCard.className = 'rounded-lg overflow-hidden border bg-white shadow-sm flex flex-col relative fade-in';
    skeletonCard.innerHTML = `
      <div class="w-full aspect-video skeleton"></div>
      <div class="p-4 flex flex-col grow">
        <div class="skeleton-text mb-2" style="width: 80%;"></div>
        <div class="skeleton-text mb-2" style="width: 60%;"></div>
        <div class="skeleton-text mb-3" style="width: 40%;"></div>
        <div class="skeleton-button" style="width: 100%;"></div>
      </div>
    `;
    container.appendChild(skeletonCard);
  }
}

// 分批渲染项目
function renderProjectsInBatches(projects, template, container) {
  console.log('📦 开始分批渲染项目...');
  const batchSize = 5; // 每批渲染5个项目
  let currentIndex = 0;
  
  function renderBatch() {
    const endIndex = Math.min(currentIndex + batchSize, projects.length);
    const batch = projects.slice(currentIndex, endIndex);
    
    console.log(`🎨 渲染第 ${Math.floor(currentIndex / batchSize) + 1} 批，项目 ${currentIndex + 1}-${endIndex}`);
    
    batch.forEach((project, index) => {
      setTimeout(() => {
        renderProjectCard(project, template, container, currentIndex + index);
      }, index * 100); // 每个卡片延迟100ms渲染，创造流畅效果
    });
    
    currentIndex = endIndex;
    
    // 如果还有更多项目，继续渲染下一批
    if (currentIndex < projects.length) {
      setTimeout(renderBatch, 300); // 批次间延迟300ms
    } else {
      console.log('✅ 所有项目渲染完成!');
    }
  }
  
  // 开始渲染第一批
  renderBatch();
}

// 渲染单个项目卡片
function renderProjectCard(p, tpl, container, index) {
  // 检查参数有效性
  if (!p || !tpl || !container) {
    console.error('❌ renderProjectCard: 无效参数', { p, tpl, container });
    return;
  }

  const node = tpl.content.cloneNode(true);
  if (!node) {
    console.error('❌ renderProjectCard: 无法克隆模板');
    return;
  }

  const img = node.querySelector('img');
  const title = node.querySelector('h3');
  const people = node.querySelector('.people');
  const btn = node.querySelector('.start-btn');
  const pricingLabel = node.querySelector('.pricing-label');
  const skeleton = node.querySelector('.skeleton');

  // 检查关键DOM元素
  if (!img || !title || !people || !btn || !skeleton) {
    console.error('❌ renderProjectCard: DOM元素缺失', { 
      img: !!img, 
      title: !!title, 
      people: !!people, 
      btn: !!btn, 
      skeleton: !!skeleton,
      projectId: p.id 
    });
    return;
  }

  // 图片路径映射
  const imageFallbacks = {
    mbti: 'assets/images/mbti-career-personality-test.jpg',
    disc40: 'assets/images/disc-personality-test.jpg',
    mgmt_en: 'assets/images/self-assessment-of-management-skills.jpg',
    observation: 'assets/images/observation-ability-test.jpg',
    introversion_en: 'assets/images/professional-test-for-introversion-extraversion-degree.jpg',
    enneagram_en: 'assets/images/enneagram-personality-test.jpg',
    eq_test_en: 'assets/images/international-standard-emotional-intelligence-test.jpg',
    phil_test_en: 'assets/images/phil-personality-test.jpg',
    four_colors_en: 'assets/images/four-colors-personality-analysis.jpg',
    pdp_test_en: 'assets/images/professional-dyna-metric-program.jpg',
    mental_age_test_en: 'assets/images/test-your-creativity.jpg',
    holland_test_en: 'assets/images/holland-occupational-interest-test.jpg',
    kelsey_test_en: 'assets/images/kelsey-temperament-type-test.jpg',
    temperament_type_test: 'assets/images/temperament-type-test.jpg',
    social_anxiety_test: 'assets/images/social-anxiety-level-test.jpg',
    creativity_test: 'assets/images/test-your-creativity.jpg',
    anxiety_depression_test: 'assets/images/anxiety-and-depression-level-test.jpg',
    personality_charm_1min: 'assets/images/find-out-your-personality-charm-level-in-just-1-minute.jpg',
    loneliness_1min: 'assets/images/find-out-just-how-lonely-your-heart-really-is.jpg',
    violence_index: 'assets/images/find-out-how-many-stars-your-violence-index-has.jpg'
  };

  // 获取图片路径
  let imagePath = imageFallbacks[p.id];
  if (!imagePath && p.image) {
    imagePath = p.image.replace(/\s+/g, '-');
  }
  if (!imagePath) {
    imagePath = 'assets/images/logo.png';
  }
  if (!imagePath.startsWith('assets/')) {
    imagePath = 'assets/images/logo.png';
  }

  // 优化图片加载：前6个项目立即加载，其余延迟加载
  const shouldLoadImmediately = index < 6;
  
  if (shouldLoadImmediately) {
    console.log(`🖼️ 立即加载图片 ${p.id}:`, imagePath);
    loadImageOptimized(img, imagePath, skeleton, p.id);
  } else {
    console.log(`⏳ 延迟加载图片 ${p.id}:`, imagePath);
    // 使用Intersection Observer实现懒加载
    setupLazyLoading(img, imagePath, skeleton, p.id);
  }
  // 设置卡片内容
  title.textContent = p.nameEn;

  // 使用API数据或本地存储
  const testedKey = `tested_${p.id}`;
  const likeKey = `likes_${p.id}`;
  // 显示测试人数
  if (p.testedCount) {
    people.textContent = (Utils && Utils.formatNumber) ? Utils.formatNumber(p.testedCount) : p.testedCount;
  } else {
    let tested;
    if (Utils && Utils.loadLocal) {
      tested = Utils.loadLocal(testedKey, null);
      if (!tested && Utils.getRandomTestedW) {
        tested = Utils.getRandomTestedW();
        Utils.saveLocal(testedKey, tested);
      }
    } else {
      tested = '1.1W+'; // 默认值
    }
    people.textContent = tested;
  }

  // 初始化点赞数
  if (Utils && Utils.saveLocal) {
    if (p.likes) {
      Utils.saveLocal(likeKey, p.likes);
    } else if (Utils.loadLocal && Utils.loadLocal(likeKey, null) == null && Utils.getRandomLikes) {
      Utils.saveLocal(likeKey, Utils.getRandomLikes());
    }
  }

  // 显示免费标签
  if (p.pricingType === '免费') {
    pricingLabel.classList.remove('hidden');
  }

  // 设置点击事件
  btn.addEventListener('click', () => {
    location.href = `/test-detail.html/${encodeURIComponent(p.id)}`;
  });

  // 添加卡片到容器，使用淡入动画
  if (node && node.classList) {
    node.classList.add('fade-in');
  }
  if (container) {
    container.appendChild(node);
  } else {
    console.error('❌ renderProjectCard: 容器无效');
  }
}

// 优化的图片加载函数
function loadImageOptimized(img, imagePath, skeleton, projectId) {
  img.src = imagePath;
  img.alt = projectId;
  
  // 快速错误处理
  img.onerror = function() {
    console.warn(`⚠️ 图片加载失败 ${projectId}:`, imagePath);
    img.onerror = null;
    img.src = 'assets/images/logo.png';
  };
  
  // 成功加载
  img.addEventListener('load', () => {
    console.log(`✅ 图片加载成功 ${projectId}`);
    skeleton.classList.add('hidden');
    img.classList.remove('hidden');
  });
  
  // 快速超时（1.5秒）
  setTimeout(() => {
    if (skeleton && !skeleton.classList.contains('hidden')) {
      console.log(`⏰ 图片加载超时 ${projectId}，强制显示`);
      skeleton.classList.add('hidden');
      img.classList.remove('hidden');
    }
  }, 1500);
}

// 懒加载设置
function setupLazyLoading(img, imagePath, skeleton, projectId) {
  // 使用Intersection Observer实现懒加载
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log(`👁️ 图片进入视口，开始加载 ${projectId}`);
        loadImageOptimized(img, imagePath, skeleton, projectId);
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px' // 提前50px开始加载
  });
  
  observer.observe(img);
}


