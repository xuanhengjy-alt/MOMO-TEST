(async function() {
  // 全局变量声明
  let cachedQuestions = null;
  let isLoadingQuestions = false;
  let isLiked = false;
  
  // 支持 pretty URL: /test-detail.html/<id-or-slug>
  function extractIdFromUrl(){
    try {
      console.log('🔍 当前URL:', location.href);
      console.log('🔍 当前pathname:', location.pathname);
      
      // 简化逻辑：直接从URL中提取项目ID
      // 支持格式：/test-detail.html/project-id 或 /test-detail.html?project=project-id
      
      // 1) 从路径中提取：/test-detail.html/project-id
      const pathMatch = location.pathname.match(/\/test-detail\.html\/([^\/\?]+)/);
      if (pathMatch && pathMatch[1]) {
        const id = decodeURIComponent(pathMatch[1]);
        console.log('✅ 从路径解析到ID:', id);
        if (id && id !== 'index.html' && id !== 'test-detail.html') {
          return id;
        }
      }
      
      // 2) 从查询参数提取：/test-detail.html?project=project-id
      const params = new URLSearchParams(location.search);
      const projectParam = params.get('project') || params.get('id');
      if (projectParam) {
        console.log('✅ 从查询参数解析到ID:', projectParam);
        return projectParam;
      }
      
      // 3) 如果是直接访问test-detail.html，返回null
      if (location.pathname === '/test-detail.html' || location.pathname.endsWith('/test-detail.html')) {
        console.log('❌ 直接访问test-detail.html，没有项目ID');
        return null;
      }
      
      console.log('❌ 没有找到项目ID');
      return null;
    } catch(error) {
      console.error('❌ URL解析错误:', error);
      return null;
    }
  }
  let id = extractIdFromUrl();
  if (!id) { 
    // 如果没有项目ID，重定向到主页
    console.log('No project ID in URL, redirecting to index');
    location.replace('index.html');
    return;
  }

  // 若 URL 传入的是 name_en 生成的 slug，需要映射回项目 id
  async function resolveProjectId(input){
    console.log('🔍 解析项目ID:', input);
    
    // 先尝试从回退数据中查找，避免不必要的API调用
    try {
      const fallbackData = window.ApiService.fallbackData || [];
      const hit = fallbackData.find(p => p.id === input);
      if (hit) {
        console.log('✅ 在回退数据中精确匹配找到项目:', hit.id);
        return hit.id;
      }
    } catch(error) {
      console.log('❌ 检查回退数据失败:', error);
    }
    
    // 如果直接调用失败，尝试从项目列表中查找
    try {
      const projects = await window.ApiService.getTestProjects();
      console.log('📋 获取到项目列表，数量:', projects.length);
      
      // 尝试精确匹配ID
      let hit = projects.find(p => p.id === input);
      if (hit) {
        console.log('✅ 精确匹配找到项目:', hit.id);
        return hit.id;
      }
      
      // 尝试匹配nameEn（处理slug情况）
      const sanitize = (s) => String(s||'').toLowerCase().trim().replace(/[\s/_.,:：—-]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-');
      const inputSlug = sanitize(input);
      
      hit = projects.find(p => {
        const projectSlug = sanitize(p.nameEn || p.name);
        return projectSlug === inputSlug;
      });
      
      if (hit) {
        console.log('✅ slug匹配找到项目:', hit.id);
        return hit.id;
      }
      
    } catch(error) {
      console.error('❌ 获取项目列表失败:', error);
    }
    
    console.log('❌ 无法解析项目ID，返回原值:', input);
    return input; // 返回原值作为fallback
  }

  console.log('🔍 开始解析项目ID:', id);
  id = await resolveProjectId(id);
  console.log('✅ 解析后的项目ID:', id);

  // 检查是否找到了有效的项目ID
  if (!id) {
    console.error('❌ No valid project ID found, redirecting to index');
    location.replace('index.html');
    return;
  }

  // 简化API请求策略：优先使用缓存，快速显示
  let project;
  console.log('🔍 开始简化API请求策略，项目ID:', id);
  
  // 第一步：优先从缓存获取项目数据
  const cachedProjects = window.ApiService.getFromCache('test_projects');
  if (cachedProjects && cachedProjects.length > 0) {
    const cachedProject = cachedProjects.find(p => p.id === id);
    if (cachedProject) {
      console.log('✅ 从缓存获取项目数据');
      project = cachedProject;
    }
  }
  
  // 第二步：如果缓存没有数据，才发起API请求
  if (!project) {
    try {
      console.log('⚠️ 缓存无数据，发起API请求');
    project = await window.ApiService.getTestProject(id);
      console.log('✅ API请求获取项目数据成功');
    } catch (error) {
      console.warn('⚠️ API请求失败，使用回退数据:', error);
      const fallbackProjects = window.ApiService.getFallbackProjects();
      project = fallbackProjects.find(p => p.id === id);
      if (project) {
        console.log('✅ 回退数据获取项目成功');
      }
    }
  }
  
  // 第三步：后台获取题目数据（不阻塞显示）
  setTimeout(async () => {
    try {
      const questions = await window.ApiService.getTestQuestions(id);
      if (questions) {
        cachedQuestions = questions;
        console.log('✅ 后台获取题目数据成功，数量:', questions.length);
      }
    } catch (error) {
      console.log('⚠️ 后台获取题目数据失败:', error);
    }
  }, 50); // 减少延迟
  
  // 第四步：后台获取点赞状态（不阻塞显示）
  setTimeout(async () => {
    try {
      const likeStatus = await window.ApiService.checkLikeStatus(id);
      if (likeStatus) {
        isLiked = likeStatus.liked || false;
        console.log('✅ 后台获取点赞状态成功');
      }
    } catch (error) {
      console.log('⚠️ 后台获取点赞状态失败:', error);
    }
  }, 100); // 减少延迟
  
  if (!project) { 
    console.error('❌ 无法获取项目数据，重定向到主页');
    location.replace('index.html'); 
    return; 
  }
  
  console.log('Final project data:', project);
  console.log('Project ID:', project.id);
  console.log('Project introEn:', project.introEn);
  console.log('Project intro:', project.intro);
  
  // 立即开始渲染，不等待其他数据
  console.log('🚀 开始立即渲染项目内容...');
  
  // 检查是否为隐藏的测试项目
  if (Utils.isProjectHidden(project.id)) {
    location.replace('index.html');
    return;
  }

  const { $, $all, loadLocal, saveLocal, getRandomLikes } = window.Utils;

  // MBTI分析格式化函数
  function formatMbtiAnalysis(rawAnalysis, mbtiType) {
    if (!rawAnalysis) return '<p class="text-gray-500">No analysis available.</p>';
    
    // 清理和分割内容
    const lines = rawAnalysis.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let html = '';
    let currentSection = '';
    let inBulletList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 检测标题
      if (line.match(/^(A brief description|Their best|Personality traits|Other.*opinions?|Potential areas|General|Specific|Suitable|Contribution|Preferred|Development)/i)) {
        if (inBulletList) {
          html += '</ul>';
          inBulletList = false;
        }
        currentSection = line;
        html += `<div class="mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200">${line}</h3>`;
      }
      // 检测子标题
      else if (line.match(/^(People of the|The opinions|For .* types?|Under .* pressure|This type|Such people|Your characteristics|Your best|Strengths|Potential flaws|Development)/i)) {
        if (inBulletList) {
          html += '</ul>';
          inBulletList = false;
        }
        html += `<h4 class="text-lg font-semibold text-gray-700 mt-6 mb-3">${line}</h4>`;
      }
      // 检测列表项
      else if (line.match(/^[•▪▫▪▫\u2713\u2714\u2022\u25CF\u25CB\u25A0\u25A1]/) || line.match(/^[A-Za-z]\u2022/)) {
        if (!inBulletList) {
          html += '<ul class="space-y-3 ml-6">';
          inBulletList = true;
        }
        const cleanLine = line.replace(/^[•▪▫▪▫\u2713\u2714\u2022\u25CF\u25CB\u25A0\u25A1\s]+/, '').trim();
        html += `<li class="flex items-start">
          <span class="text-blue-500 mr-3 mt-1 flex-shrink-0">•</span>
          <span class="text-gray-700">${cleanLine}</span>
        </li>`;
      }
      // 检测段落结束
      else if (line === '' || line.match(/^[A-Z][a-z]+ [a-z]+ [a-z]+ type$/)) {
        if (inBulletList) {
          html += '</ul>';
          inBulletList = false;
        }
        if (currentSection && line === '') {
          html += '</div>';
          currentSection = '';
        }
      }
      // 普通段落
      else {
        if (inBulletList) {
          html += '</ul>';
          inBulletList = false;
        }
        
        // 高亮MBTI类型代码
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-rose-600">$1</strong>');
        processedLine = processedLine.replace(new RegExp(`\\b${mbtiType}\\b`, 'g'), `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-semibold">${mbtiType}</span>`);
        
        html += `<p class="text-gray-700 leading-relaxed mb-4">${processedLine}</p>`;
      }
    }
    
    // 关闭未关闭的标签
    if (inBulletList) {
      html += '</ul>';
    }
    if (currentSection) {
      html += '</div>';
    }
    
    return html;
  }

  // 规范化 Markdown 粗体语法，修复类似 "**Label: **" 中粗体内尾随空格导致不生效的问题
  function normalizeStrong(md) {
    if (!md) return '';
    let s = String(md);
    // 1) 规范化 ** 加粗：去除内部多余空格
    s = s.replace(/\*\*\s*([^*][^*]*?)\s*\*\*/g, function(_, inner){
      return '**' + inner.replace(/^\s+|\s+$/g, '') + '**';
    });
    // 2) 兼容数据中写成 “Strengths:* / Weaknesses:*” 的写法，转换为标准加粗
    s = s.replace(/\b(Strengths|Weaknesses)\s*:\s*\*/gi, function(_, label){
      return `**${label}:**`;
    });
    return s;
  }

  // 将原始 MBTI 文本粗加工为 Markdown：按常见关键词插入多级标题与列表符号
  function toMarkdownWithHeadings(raw) {
    if (!raw) return '';
    const lines = String(raw).split('\n');
    const out = [];
    const headingRules = [
      // 通用标题规则 - 处理已有的Markdown标题
      { re: /^#{1,6}\s+(.+)$/, h: (match) => match[0] }, // 保持已有的Markdown标题
      
      // MBTI 相关标题
      { re: /^(A\s*brief\s*description|Brief\s*Description)\b/i, h: '# A Brief Description' },
      { re: /^(Personality\s*traits)\b/i, h: '## Personality Traits' },
      { re: /^(Their\s*best)\b/i, h: '## Their Best' },
      { re: /^(Strengths)\b/i, h: '## Strengths' },
      { re: /^(Potential\s*(areas|flaws).*)\b/i, h: '## Potential Areas' },
      { re: /^(Suitable\s*(occupations|jobs)?)\b/i, h: '## Suitable Occupations' },
      { re: /^(Contribution)\b/i, h: '## Contribution' },
      { re: /^(Preferred\s*(work|environment))\b/i, h: '## Preferred Work Environment' },
      { re: /^(Development\s*(suggestions?|advice))\b/i, h: '## Development Suggestions' },
      
      // DISC 相关标题
      { re: /^(Dominance|Influence|Steadiness|Compliance)\b/i, h: '## $1' },
      
      // 九型人格相关标题
      { re: /^(The\s+(Perfectionist|Helper|Achiever|Individualist|Investigator|Loyalist|Enthusiast|Challenger|Peacemaker).*)$/i, h: '## $1' },
      { re: /^(Desire\s*Trait|Basic\s*Thought|Main\s*Characteristics|Main\s*Traits|Suitable\s*Careers)$/i, h: '### $1' },
      
      // 社交焦虑和抑郁相关标题
      { re: /^(Low|Mild|Moderate|High|Severe)\s+(Social\s*Anxiety|Anxiety\s*&\s*Depression)$/i, h: '## $1 $2' },
      { re: /^(Key\s*characteristics|Recommendations|Areas\s*for\s*(improvement|development))$/i, h: '### $1' },
      
      // 内外向相关标题
      { re: /^(Introverted|Extroverted|Ambivert)\s+Personality$/i, h: '## $1 Personality' },
      
      // 情商相关标题
      { re: /^(High|Good|Average|Low)\s+Emotional\s+Intelligence$/i, h: '## $1 Emotional Intelligence' },
      
      // 创造力相关标题
      { re: /^(Creativity|Creative)\s*:?\s*\*{1,5}$/i, h: '## $1' },
      { re: /^(Strengths|Weaknesses)$/i, h: '### $1' },
      
      // 通用标题模式
      { re: /^(Key\s*characteristics|Strengths|Weaknesses|Recommendations|Areas\s*for\s*(improvement|development))$/i, h: '### $1' },
      { re: /^(Overview|Summary|Analysis|Description)$/i, h: '## $1' },
      
      // 中文标题
      { re: /^(在情感方面|在情感上)\b/i, h: '### Emotional Aspects' },
      { re: /^(在工作方面|在工作上)\b/i, h: '### Work Aspects' },
      { re: /^(在人际关系方面|在人际关系上)\b/i, h: '### Interpersonal Relationships' },
      { re: /^(描述性词语|特点|特征)\b/i, h: '### Key Characteristics' },
      { re: /^(高.*型.*特质.*人|高.*型.*人)\b/i, h: '## $1' }
    ];
    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) { out.push(''); continue; }
      const rule = headingRules.find(r => r.re.test(line));
      if (rule) { 
        if (typeof rule.h === 'function') {
          out.push(rule.h(line.match(rule.re)));
        } else {
          out.push(rule.h);
        }
        continue; 
      }
      // 列表符号归一化
      if (/^[•▪▫\u2713\u2714\u2022\u25CF\u25CB\u25A0\u25A1\-\*]/.test(line)) {
        out.push('- ' + line.replace(/^[•▪▫\u2713\u2714\u2022\u25CF\u25CB\u25A0\u25A1\-\*]\s*/, ''));
        continue;
      }
      out.push(line);
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  // 元素
  const breadcrumbProject = document.getElementById('breadcrumb-project');
  const breadcrumbSubview = document.getElementById('breadcrumb-subview');
  const breadcrumbBar = document.getElementById('breadcrumb-bar');
  const viewDetail = document.getElementById('view-detail');
  const viewStart = document.getElementById('view-start');
  const viewResult = document.getElementById('view-result');

  // 详情视图元素
  const projectImage = document.getElementById('project-image');
  const projectTitle = document.getElementById('project-title');
  const testedCount = document.getElementById('tested-count');
  const likeBtn = document.getElementById('like-btn');
  const likeCount = document.getElementById('like-count');
  const gotoStart = document.getElementById('goto-start');
  const projectIntro = document.getElementById('project-intro');

  // 开始视图元素
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const questionTitle = document.getElementById('question-title');
  const options = document.getElementById('options');
  const restartBtn = document.getElementById('restart-btn');

  // 结果视图元素
  const resultTitle = document.getElementById('result-title');
  const resultImage = document.getElementById('result-image');
  const resultSummary = document.getElementById('result-summary');
  const resultAnalysis = document.getElementById('result-analysis');
  const resultRestart = document.getElementById('result-restart');
  const infoLine = document.getElementById('info-line');

  // 动态计算中提示
  let calcNoticeEl = null;
  let calcProgressBar = null;
  let progressInterval = null;
  let progressRafId = null;
  let progressStartTs = 0;
  
  function showCalculatingNotice(show) {
    try {
      if (!calcNoticeEl) {
        calcNoticeEl = document.createElement('div');
        calcNoticeEl.id = 'calc-notice';
        calcNoticeEl.className = 'calculating-container';
        calcNoticeEl.innerHTML = `
          <div class="calculating-spinner"></div>
          <div class="calculating-text">Your answer is being analyzed.</div>
          <div class="calculating-subtitle">Please wait for a moment<span class="calculating-dots"></span></div>
          <div class="calculating-progress">
            <div class="calculating-progress-bar"></div>
          </div>
        `;
        calcProgressBar = calcNoticeEl.querySelector('.calculating-progress-bar');
      }
      
      if (show) {
        if (!calcNoticeEl.parentElement) {
          // 插入到选项区域下方（题目框底部）
          const insertTarget = options && options.parentElement ? options.parentElement : document.body;
          insertTarget.appendChild(calcNoticeEl);
        }
        calcNoticeEl.style.display = 'flex';
        calcNoticeEl.classList.remove('calculating-complete');
        
        // 重置进度条
        if (calcProgressBar) {
          calcProgressBar.style.width = '0%';
        }
        
        // 添加淡入效果
        calcNoticeEl.style.opacity = '0';
        calcNoticeEl.style.transform = 'translateY(20px)';
        calcNoticeEl.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        
        setTimeout(() => {
          calcNoticeEl.style.opacity = '1';
          calcNoticeEl.style.transform = 'translateY(0)';
          
          // 开始真实进度条动画
          startProgressAnimation();
        }, 50);
        
      } else {
        if (calcNoticeEl && calcNoticeEl.parentElement) {
          // 停止进度条动画
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
          
          // 确保进度条到达100%
          if (calcProgressBar) {
            calcProgressBar.style.width = '100%';
          }
          
          // 延迟一下再隐藏，让用户看到进度条完成
          setTimeout(() => {
            // 添加完成动画
            calcNoticeEl.classList.add('calculating-complete');
            
            // 动画完成后隐藏
            setTimeout(() => {
              if (calcNoticeEl && calcNoticeEl.parentElement) {
                calcNoticeEl.style.display = 'none';
                calcNoticeEl.classList.remove('calculating-complete');
              }
            }, 600);
          }, 300);
        }
      }
    } catch (e) {
      console.error('Error showing calculating notice:', e);
    }
  }
  
  // 真实进度条动画
  function startProgressAnimation() {
    if (!calcProgressBar) return;
    // 采用近似匀速的缓动曲线，避免前快后慢的突兀感
    // 目标在 ~5.5s 内达到 88%~90%
    const target = 90;
    const duration = 5500; // ms
    const easeInOut = (t) => (1 - Math.cos(Math.PI * t)) / 2; // 0..1 → 0..1

    // 清理旧动画
    if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
    if (progressRafId) { cancelAnimationFrame(progressRafId); progressRafId = null; }
    progressStartTs = performance.now();

    const step = (nowTs) => {
      const elapsed = nowTs - progressStartTs;
      const t = Math.min(1, elapsed / duration);
      const base = target * easeInOut(t);
      const jitter = (Math.random() - 0.5) * 0.8; // 轻微抖动，显得更真实
      const value = Math.max(0, Math.min(target, base + jitter));
      calcProgressBar.style.width = value + '%';
      if (t < 1) {
        progressRafId = requestAnimationFrame(step);
      } else {
        progressRafId = null;
      }
    };
    progressRafId = requestAnimationFrame(step);
  }
  
  // 完成进度条（API完成时调用）
  function completeProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    if (progressRafId) {
      cancelAnimationFrame(progressRafId);
      progressRafId = null;
    }
    
    if (calcProgressBar) {
      calcProgressBar.style.width = '100%';
    }
  }

  // 初始化项目信息（先隐藏面包屑，等数据就绪后再填充与显示，避免闪现默认文案）
  try { if (breadcrumbBar) breadcrumbBar.classList.add('hidden'); } catch(_) {}
  breadcrumbProject.textContent = project.nameEn || project.name || '';
  breadcrumbSubview.textContent = 'Detail';
  try { if (breadcrumbBar) breadcrumbBar.classList.remove('hidden'); } catch(_) {}
  // 统一从 assets/images 取图：优先按项目 id 匹配本地图，其次使用返回图，再退回 logo
  (function(){
    var map = {
      mbti: '/assets/images/mbti-career-personality-test.jpg',
      disc40: '/assets/images/disc-personality-test.jpg',
      mgmt_en: '/assets/images/self-assessment-of-management-skills.jpg',
      observation: '/assets/images/observation-ability-test.jpg',
      introversion_en: '/assets/images/professional-test-for-introversion-extraversion-degree.jpg',
      enneagram_en: '/assets/images/enneagram-personality-test.jpg',
      eq_test_en: '/assets/images/international-standard-emotional-intelligence-test.jpg',
      phil_test_en: '/assets/images/phil-personality-test.jpg',
      four_colors_en: '/assets/images/four-colors-personality-analysis.jpg',
      pdp_test_en: '/assets/images/professional-dyna-metric-program.jpg',
      mental_age_test_en: '/assets/images/test-your-mental-age.jpg',
      holland_test_en: '/assets/images/holland-occupational-interest-test.jpg',
      kelsey_test_en: '/assets/images/kelsey-temperament-type-test.jpg',
      temperament_type_test: '/assets/images/temperament-type-test.jpg',
      social_anxiety_test: '/assets/images/social-anxiety-level-test.jpg',
      personality_charm_1min: '/assets/images/find-out-your-personality-charm-level-in-just-1-minute.jpg',
      violence_index: '/assets/images/find-out-how-many-stars-your-violence-index-has.jpg',
      creativity_test: '/assets/images/test-your-creativity.jpg',
      anxiety_depression_test: '/assets/images/anxiety-and-depression-level-test.jpg',
      loneliness_1min: '/assets/images/find-out-just-how-lonely-your-heart-really-is.jpg'
    };
    var preferred = (project && project.id && map[project.id]) ? map[project.id] : '';
    var fallback = '/assets/images/logo.png';
    var src0 = preferred || project.image || fallback;
    
    // 优化图片加载体验
    projectImage.style.opacity = '0';
    projectImage.style.transition = 'opacity 0.3s ease-in-out';
    
    // 图片加载完成后淡入显示
    projectImage.onload = () => {
      projectImage.style.opacity = '1';
    };
    
    // 设置图片源
    projectImage.src = src0.startsWith('/') ? src0 : ('/' + src0);
    
    // 如果图片已缓存，立即显示
    if (projectImage.complete && projectImage.naturalHeight !== 0) {
      projectImage.style.opacity = '1';
    }
  })();
  
  // 显示免费标签
  const pricingLabel = document.getElementById('pricing-label');
  if (pricingLabel && project.pricingType === '免费') {
    pricingLabel.classList.remove('hidden');
  }
  // 加载项目结果类型与分析（用于跳转型结果展示）
  async function loadAnalyses(projectId) {
    try {
      const data = await window.ApiService.request(`/tests/${projectId}/analyses`);
      if (data && Array.isArray(data.items)) {
        const byCode = {};
        const byName = {};
        data.items.forEach(it => {
          if (it && it.code) byCode[it.code] = it;
          if (it && (it.nameEn || it.name)) byName[it.nameEn || it.name] = it;
        });
        // 兼容旧用法：直接可用 map[key]；并提供名称查找表
        byCode.__byName = byName;
        return byCode;
      }
    } catch(_) {}
    return {};
  }

  projectImage.alt = project.name;
  try {
    projectImage.onerror = function(){
      projectImage.onerror = null;
      projectImage.src = '/assets/images/logo.png';
    };
  } catch(_) {}
  projectTitle.textContent = project.nameEn;
  // 介绍分段显示：按空行分段，单行内的换行转为 <br>
  (function renderIntro(text){
    const el = projectIntro;
    const raw = (text || '').toString();
    console.log('📝 渲染Introduction，项目ID:', project.id);
    console.log('📝 Introduction内容:', raw.substring(0, 100) + (raw.length > 100 ? '...' : ''));
    if (!raw) { 
      console.log('⚠️ Introduction内容为空');
      el.textContent = ''; 
      return; 
    }
    // 转义基础HTML，防止意外标签渲染
    const esc = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // 统一换行符并优先按空行分段；若没有空行，则按单行分段，保证段落间有间距
    const normalized = esc.replace(/\r\n?/g, '\n');
    let parts = normalized.split(/\n\s*\n/);
    if (parts.length === 1) {
      parts = normalized.split(/\n+/); // 回退：按单行分段
    }
    const html = parts
      .map(p => `<p class="leading-relaxed mb-3">${p.replace(/\n/g, '<br>')}</p>`) // 段内换行
      .join('');
    el.innerHTML = html;
  })(project.introEn || project.intro || '');
  // 介绍统一使用数据库返回的 intro_en，不再从本地文件加载

  // Disable pretty URL rewriting for static server to avoid 404 on relative assets under nested paths

  const testedKey = `tested_${project.id}`;
  const likesKey = `likes_${project.id}`;
  
  // 使用API数据或本地存储，但优先使用API数据（即使为0）
  const tested = project.testedCount !== undefined ? project.testedCount : loadLocal(testedKey, '1.1W+');
  let likes = project.likes !== undefined ? project.likes : loadLocal(likesKey, getRandomLikes());
  
  testedCount.textContent = formatNumber(tested);
  likeCount.textContent = formatNumber(likes);

  // 点赞状态已在全局声明
  
  // 检查用户点赞状态
  async function checkLikeStatus() {
    try {
      const result = await window.ApiService.checkLikeStatus(project.id);
      isLiked = result.isLiked;
      updateLikeButtonState();
    } catch (error) {
      console.error('Failed to check like status:', error);
      // 如果检查失败，保持默认状态（未点赞）
      isLiked = false;
      updateLikeButtonState();
    }
  }
  
  // 页面加载时检查点赞状态（如果之前没有并行获取）
  if (isLiked === undefined) {
  checkLikeStatus();
  }

  likeBtn.addEventListener('click', async () => {
    try {
      // 尝试通过API更新点赞数
      const result = await window.ApiService.likeTestProject(project.id);
      likes = result.likes;
      isLiked = result.isLiked;
      likeCount.textContent = formatNumber(likes);
      updateLikeButtonState();
    } catch (error) {
      console.error('Failed to update likes:', error);
      // API失败时使用本地存储
      isLiked = !isLiked;
      likes += isLiked ? 1 : -1;
      likeCount.textContent = formatNumber(likes);
      saveLocal(likesKey, likes);
      updateLikeButtonState();
    }
    
    likeBtn.classList.add('animate-pulse');
    setTimeout(() => likeBtn.classList.remove('animate-pulse'), 300);
  });

  function updateLikeButtonState() {
    if (isLiked) {
      likeBtn.classList.add('text-blue-600', 'hover:text-blue-700');
      likeBtn.classList.remove('text-gray-400', 'hover:text-gray-500');
    } else {
      likeBtn.classList.add('text-gray-400', 'hover:text-gray-500');
      likeBtn.classList.remove('text-blue-600', 'hover:text-blue-700');
    }
  }

  // 视图状态
  function show(view) {
    breadcrumbSubview.textContent = view === 'detail' ? 'Detail' : view === 'start' ? 'Start Test' : 'Result';
    [viewDetail, viewStart, viewResult].forEach(v => v.classList.add('is-transitioning'));
    setTimeout(() => {
      viewDetail.classList.toggle('hidden', view !== 'detail');
      viewStart.classList.toggle('hidden', view !== 'start');
      viewResult.classList.toggle('hidden', view !== 'result');
      // 回到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
      [viewDetail, viewStart, viewResult].forEach(v => v.classList.remove('is-transitioning'));
    }, 150);
  }

  // 确保 TestLogic 已加载（兼容某些环境脚本加载顺序异常）
  let ensureLogicPromise = null;
  function ensureTestLogicLoaded() {
    if (window.TestLogic && typeof window.TestLogic.getQuestions === 'function') return Promise.resolve();
    if (ensureLogicPromise) return ensureLogicPromise;
    ensureLogicPromise = new Promise((resolve) => {
      var s = document.createElement('script');
      s.src = 'js/test-logic.js';
      s.onload = function(){ resolve(); };
      s.onerror = function(){ resolve(); };
      document.head.appendChild(s);
    });
    return ensureLogicPromise;
  }

  // 测试进程（优先从API获取，回退到本地逻辑）
  
  async function getQList() {
    if (cachedQuestions) return cachedQuestions;
    if (isLoadingQuestions) {
      // 如果正在加载，等待加载完成
      while (isLoadingQuestions) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return cachedQuestions;
    }
    
    try {
      isLoadingQuestions = true; // 标记开始加载
      // 尝试从API获取题目
      console.log('🔍 正在获取题目，项目ID:', project.id);
      const questions = await window.ApiService.getTestQuestions(project.id);
      console.log('📋 API返回的题目数据:', questions);
      
      if (questions && questions.length > 0) {
        // 转换API数据格式为前端期望的格式（保留跳转信息 next / resultCode）
        const numFrom = (v) => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'number' && Number.isFinite(v)) return v;
          const s = String(v).trim();
          if (!s) return null;
          // 提取形如 '3' / 'Q3' / 'q3' / '#3' / 'to-3' 的数字
          const m = s.match(/(-?\d+)/);
          return m ? parseInt(m[1], 10) : null;
        };

        const convertedQuestions = questions.map((q, qi) => ({
          id: q.id || q.order || q.order_index || qi + 1,
          text: q.text || q.question_text || '',
          opts: (q.opts || q.options || []).map((opt, oi) => {
            // 统一解析 score_value / value：后端可能把 JSON 放到 value(字符串)
            let sv = opt.score_value || opt.value || {};
            if (typeof sv === 'string') {
              try { sv = JSON.parse(sv); } catch(_) { sv = {}; }
            }
            const rawNext = (opt.next != null ? opt.next : (sv && sv.next != null ? sv.next : null));
            const next = numFrom(rawNext);
            const resultCode = (opt.resultCode != null ? opt.resultCode : (sv && sv.resultCode != null ? sv.resultCode : null));
            return {
              text: opt.text || opt.option_text || '',
              value: (typeof opt.value === 'number' ? opt.value : (typeof sv === 'object' && sv && typeof sv.score === 'number' ? sv.score : (typeof sv === 'number' ? sv : 0))),
              next: next,
              resultCode: resultCode,
              n: opt.n || opt.option_number || (oi + 1)
            };
          })
        }));

        // 自动侦测是否为跳转型测试（任一选项存在 next 或 resultCode）
        try {
          const hasJump = convertedQuestions.some(q => (q.opts || []).some(o => (o && (o.next != null && Number.isFinite(o.next)) || (o.resultCode != null && String(o.resultCode).trim() !== ''))));
          // 暴露给 Console 以便排查
          try { window.lastConvertedQuestions = convertedQuestions; } catch(_) {}
          if (hasJump) { project.isJumpType = true; }
        } catch(_) {}
        
        console.log('✅ 转换后的题目数据:', convertedQuestions.slice(0, 2)); // 调试日志
        console.log('📊 题目总数:', convertedQuestions.length);
        
        // 一致性校验：MBTI 必须 93题且每题2选项(A/B)
        if (project && project.id === 'mbti') {
          const okLen = convertedQuestions.length === 93;
          const okOpts = convertedQuestions.every(q => Array.isArray(q.opts) && q.opts.length === 2);
          if (!okLen || !okOpts) {
            console.warn('MBTI questions integrity check failed', { okLen, okOpts, len: convertedQuestions.length });
          }
        }
        cachedQuestions = convertedQuestions;
        isLoadingQuestions = false; // 标记加载完成
        return convertedQuestions;
      } else {
        console.warn('⚠️ API返回的题目数据为空或无效');
        throw new Error('No questions returned from API');
      }
    } catch (error) {
      console.error('❌ 获取题目失败:', error);
      
      // 如果API失败，尝试使用项目配置中的题目数量作为回退
      if (project && project.questionCount) {
        console.log('🔄 使用项目配置的题目数量作为回退:', project.questionCount);
        // 创建虚拟题目数据，仅用于显示题目数量
        const fallbackQuestions = Array.from({ length: project.questionCount }, (_, i) => ({
          id: i + 1,
          text: `Question ${i + 1}`,
          opts: []
        }));
        cachedQuestions = fallbackQuestions;
        return fallbackQuestions;
      }
      
      // 如果连项目配置都没有，抛出错误
      throw error;
    } finally {
      isLoadingQuestions = false; // 确保在任何情况下都标记加载完成
    }
  }
  let qIndex = 0;
  const answers = [];
  let resultShown = false;
  let isSubmitting = false;

  // 统计信息：题数与预计时长（按每题约12秒估算）
  // 先显示占位骨架，随后并行获取题量后覆盖
  if (infoLine) {
    infoLine.innerHTML = `Loading questions...`;
  }
  (async () => {
    try {
      console.log('🔍 开始获取题目数量...');
      
      // 如果已经有缓存的题目数据，直接使用
      let questions;
      if (cachedQuestions && cachedQuestions.length > 0) {
        questions = cachedQuestions;
        console.log('✅ 使用预缓存的题目数据，数量:', questions.length);
      } else {
        questions = await getQList();
      console.log('📋 获取到的题目:', questions);
      }
      
      const totalQ = questions ? questions.length : 0;
      console.log('📊 题目总数:', totalQ);
      
      if (totalQ > 0) {
        const estMinutes = Math.max(1, Math.round((totalQ * 12) / 60));
        console.log('⏱️ 预计时间:', estMinutes, '分钟');
        
        if (infoLine) {
          infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">${totalQ}</span> questions, estimated <span class="font-semibold text-rose-600">${estMinutes}</span> minutes`;
          console.log('✅ 题目数量显示成功');
        }
      } else {
        console.warn('⚠️ 题目数量为0');
        // API失败或没有题目时，显示错误信息
        if (infoLine) {
          infoLine.innerHTML = `<span class="text-red-500">Unable to load questions. Please refresh the page.</span>`;
        }
      }
    } catch (error) {
      console.error('❌ 获取题目数量失败:', error);
      if (infoLine) {
        infoLine.innerHTML = `<span class="text-red-500">Unable to load questions. Please refresh the page.</span>`;
      }
    }
  })();

  async function renderProgress() {
    // 先确保题目已获取，用于动态判定是否为跳转型
    const totalList = await getQList();
    const hasJump = (() => {
      try { return totalList.some(q => (q.opts || []).some(o => (o && (o.next != null || o.resultCode)))); } catch(_) { return false; }
    })();
    if (hasJump) { project.isJumpType = true; }

    // 跳转型测试不显示进度条
    if (project && project.isJumpType) {
      try {
        progressBar.parentElement.classList.add('hidden');
        progressText.classList.add('hidden');
      } catch(_) {}
      return;
    } else {
      try {
        progressBar.parentElement.classList.remove('hidden');
        progressText.classList.remove('hidden');
      } catch(_) {}
    }
    const total = totalList.length;
    const done = Math.min(qIndex, total);
    const pct = total ? Math.round(done / total * 100) : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = `${done}/${total}`;
  }

  async function renderQuestion() {
    if (resultShown) { return; }
    await ensureTestLogicLoaded();
    const qlist = await getQList();
    console.log('renderQuestion - qlist length:', qlist ? qlist.length : 0);
    console.log('renderQuestion - qIndex:', qIndex);
    
    // 若题库为空，给出友好提示
    if (!qlist || !qlist.length) {
      console.log('No questions available');
      questionTitle.textContent = 'Question set failed to load. Please open with a local server and try again.';
      options.innerHTML = '';
      return;
    }
    const q = qlist[qIndex];
    console.log('Current question:', q);
    if (!q) { // 结束
      // 非跳转型：答完题，开始计算（防重复提交）
      if (resultShown || isSubmitting) { return; }
      isSubmitting = true;
      
      // 先显示计算中状态，不立即跳转到结果页面
      showCalculatingNotice(true);
      
      // 预加载结果页面图片，提升视觉体验
      preloadResultImage();
      
      // 仅从后端获取结果，不再使用本地兜底
      let apiResult = null;
      try {
        const sessionId = window.ApiService.generateSessionId();
        console.log('🚀 开始提交测试结果...');
        apiResult = await window.ApiService.submitTestResult(project.id, answers, sessionId);
        console.log('✅ 测试结果提交成功');
      } catch (error) {
        console.error('❌ 测试结果提交失败:', error);
      }

      if (!apiResult || !apiResult.result) {
        // 后端不可用时，提示错误并终止
        resultTitle.textContent = project.name;
        resultSummary.innerHTML = `<span class="font-semibold text-red-600">Calculation Error</span>`;
        resultAnalysis.textContent = 'Unable to calculate test result. Please try again later.';
        show('result');
        showCalculatingNotice(false);
        isSubmitting = false;
        return;
      }

      const finalResult = apiResult.result;
      console.log('API Result:', apiResult);
      console.log('Final Result:', finalResult);
      
      // 先准备结果页面内容，但不立即显示
      console.log('🚀 开始准备结果页面内容...');
      
      // 完成进度条并隐藏计算提示
      completeProgress();
      setTimeout(() => {
        showCalculatingNotice(false);
      }, 500);
      
      // 准备结果页面内容
      await prepareResultPage(finalResult);
      
      // 内容准备完成后，再跳转到结果页面
      console.log('✅ 结果页面内容准备完成，开始跳转...');
      show('result');
      
      resultShown = true;
      isSubmitting = false;
      return;
    }
    questionTitle.textContent = q.t || q.text || '';
    options.innerHTML = '';
    q.opts.forEach((opt, idx) => {
      const text = typeof opt === 'string' ? opt : (opt.text || '');
      const btn = document.createElement('button');
      btn.className = 'w-full text-left px-4 py-3 rounded border hover:bg-gray-50';
      btn.textContent = text;
      btn.addEventListener('click', async () => {
        // 跳转型支持：若存在 next/resultCode 则走分支
        if (opt && (opt.next != null || opt.resultCode)) {
          // 保存选择（保留为索引，兼容现有评分）
          var ans = (opt && typeof opt.n === 'number') ? (opt.n - 1) : idx;
          answers.push(ans);
          if (opt.resultCode) {
            // 直接出结果：调用后端，前端只显示后端返回的 description_en/analysis
            try {
              // 跳转型：命中结果码，开始计算（防重复提交）
              if (resultShown || isSubmitting) { return; }
              isSubmitting = true;
              
              // 先显示计算中状态，不立即跳转到结果页面
              showCalculatingNotice(true);
              
              // 预加载结果页面图片
              preloadResultImage();
              const sessionId = window.ApiService.generateSessionId();
              const apiRes = await window.ApiService.submitTestResult(project.id, answers, sessionId);
              const r = (apiRes && apiRes.result) ? apiRes.result : {};
              
              // 先准备结果页面内容，但不立即显示
              console.log('🚀 开始准备跳转型测试结果页面内容...');
              
              // 完成进度条并隐藏计算提示
              completeProgress();
              setTimeout(() => {
                showCalculatingNotice(false);
              }, 500);
              
              // 准备结果页面内容
              await prepareResultPage(r);
              
              // 内容准备完成后，再跳转到结果页面
              console.log('✅ 跳转型测试结果页面内容准备完成，开始跳转...');
              show('result');
              
              resultShown = true;
              isSubmitting = false;
              return;
            } catch (e) {
              // 后端失败则回退为本地渲染（极端容错）
            }
          }
          if (opt.next != null) {
            // next 已在转换阶段解析为纯数字（题号），此处直接使用
            const target = Number.isFinite(opt.next) ? (opt.next - 1) : (qIndex + 1);
            qIndex = Math.max(0, Math.min(target, qlist.length));
            renderProgress();
            renderQuestion();
            return;
          }
        } else {
          // 普通线性题目
          var answerIndex = (opt && typeof opt.n === 'number') ? (opt.n - 1) : idx;
          answers.push(answerIndex);
          qIndex += 1;
          renderProgress();
          renderQuestion();
        }
      });
      options.appendChild(btn);
    });
  }

  gotoStart.addEventListener('click', async (e) => {
    e.preventDefault();
    qIndex = 0;
    answers.length = 0;
    resultShown = false;
    show('start');
    // 进入开始页时再次刷新题量与预估
    await ensureTestLogicLoaded();
    try {
      const qs = await getQList(); // 添加await关键字，等待异步操作完成
      if (infoLine && qs && qs.length > 0) {
        const total = qs.length;
        const mins = Math.max(1, Math.round((total * 12) / 60));
        infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">${total}</span> questions, estimated <span class="font-semibold text-rose-600">${mins}</span> minutes`;
      } else if (infoLine) {
        infoLine.innerHTML = `<span class="text-red-500">Unable to load questions. Please refresh the page.</span>`;
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      if (infoLine) {
        infoLine.innerHTML = `<span class="text-red-500">Unable to load questions. Please refresh the page.</span>`;
      }
    }
    renderProgress();
    renderQuestion();
  });

  restartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    qIndex = 0;
    answers.length = 0;
    resultShown = false;
    renderProgress();
    renderQuestion();
  });

  resultRestart.addEventListener('click', (e) => {
    e.preventDefault();
    qIndex = 0;
    answers.length = 0;
    resultShown = false;
    show('start');
    renderProgress();
    renderQuestion();
  });

  // 准备结果页面内容（不立即显示）
  async function prepareResultPage(finalResult) {
    console.log('📋 准备结果页面内容...');
    
    // 第一阶段：准备标题和图片
      resultTitle.textContent = project.name;
    
    // 设置结果图片
    const imageMap = {
          mbti: '/assets/images/mbti-career-personality-test.jpg',
          disc40: '/assets/images/disc-personality-test.jpg',
          introversion_en: '/assets/images/professional-test-for-introversion-extraversion-degree.jpg',
          enneagram_en: '/assets/images/enneagram-personality-test.jpg',
          eq_test_en: '/assets/images/international-standard-emotional-intelligence-test.jpg',
          phil_test_en: '/assets/images/phil-personality-test.jpg',
          four_colors_en: '/assets/images/four-colors-personality-analysis.jpg',
          pdp_test_en: '/assets/images/professional-dyna-metric-program.jpg',
          mental_age_test_en: '/assets/images/test-your-mental-age.jpg',
          holland_test_en: '/assets/images/holland-occupational-interest-test.jpg',
          kelsey_test_en: '/assets/images/kelsey-temperament-type-test.jpg',
          temperament_type_test: '/assets/images/temperament-type-test.jpg',
          social_anxiety_test: '/assets/images/social-anxiety-level-test.jpg',
          personality_charm_1min: '/assets/images/find-out-your-personality-charm-level-in-just-1-minute.jpg',
          violence_index: '/assets/images/find-out-how-many-stars-your-violence-index-has.jpg',
          creativity_test: '/assets/images/test-your-creativity.jpg',
          anxiety_depression_test: '/assets/images/anxiety-and-depression-level-test.jpg',
          loneliness_1min: '/assets/images/find-out-just-how-lonely-your-heart-really-is.jpg'
        };
    
    const preferred = (project && project.id && imageMap[project.id]) ? imageMap[project.id] : '';
    const fallback = '/assets/images/logo.png';
    const src0 = preferred || project.image || fallback;
    
    // 预加载图片并等待加载完成
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ 结果页面图片预加载完成');
        resultImage.src = src0.startsWith('/') ? src0 : ('/' + src0);
        resultImage.style.opacity = '1';
        resolve();
      };
      img.onerror = () => {
        console.log('⚠️ 结果页面图片预加载失败，使用默认图片');
          resultImage.src = '/assets/images/logo.png';
        resultImage.style.opacity = '1';
        resolve();
      };
      img.src = src0.startsWith('/') ? src0 : ('/' + src0);
    });
    
    // 第二阶段：准备结果摘要
    resultSummary.innerHTML = `<span class="font-semibold text-blue-700">${finalResult.description_en || finalResult.summary || ''}</span>`;
    
    // 第三阶段：准备分析内容
      const rawAnalysis = finalResult.analysis || finalResult.analysisEn || '';
      if (project.type === 'disc' || project.type === 'disc40') {
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        try {
          if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
            const mdHtml = window.marked.parse(enhanced);
            resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
          } else {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
          }
        } catch(_) {
        resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
        }
      } else if (project.type === 'mbti') {
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        try {
          if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
            const mdHtml = window.marked.parse(enhanced);
            resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
          } else {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
          }
        } catch(_) {
        resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
        }
      } else {
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        try {
          if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
            const mdHtml = window.marked.parse(enhanced);
            resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
          } else {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
          }
        } catch(_) {
        resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
      }
    }
    
    console.log('✅ 结果页面内容准备完成');
  }

  // 分块渲染结果内容，提升性能
  function renderResultContent(finalResult) {
    const resultSection = document.getElementById('result-section');
    if (!resultSection) return;
    
    // 第一阶段：立即显示标题和图片
              resultTitle.textContent = project.name;
    
    // 设置结果图片
    const imageMap = {
                mbti: '/assets/images/mbti-career-personality-test.jpg',
                disc40: '/assets/images/disc-personality-test.jpg',
                introversion_en: '/assets/images/professional-test-for-introversion-extraversion-degree.jpg',
                enneagram_en: '/assets/images/enneagram-personality-test.jpg',
                eq_test_en: '/assets/images/international-standard-emotional-intelligence-test.jpg',
                phil_test_en: '/assets/images/phil-personality-test.jpg',
                four_colors_en: '/assets/images/four-colors-personality-analysis.jpg',
                pdp_test_en: '/assets/images/professional-dyna-metric-program.jpg',
                mental_age_test_en: '/assets/images/test-your-mental-age.jpg',
                holland_test_en: '/assets/images/holland-occupational-interest-test.jpg',
                kelsey_test_en: '/assets/images/kelsey-temperament-type-test.jpg',
                temperament_type_test: '/assets/images/temperament-type-test.jpg',
                social_anxiety_test: '/assets/images/social-anxiety-level-test.jpg',
                personality_charm_1min: '/assets/images/find-out-your-personality-charm-level-in-just-1-minute.jpg',
                violence_index: '/assets/images/find-out-how-many-stars-your-violence-index-has.jpg',
                creativity_test: '/assets/images/test-your-creativity.jpg',
                anxiety_depression_test: '/assets/images/anxiety-and-depression-level-test.jpg',
                loneliness_1min: '/assets/images/find-out-just-how-lonely-your-heart-really-is.jpg'
                };
    
    const preferred = (project && project.id && imageMap[project.id]) ? imageMap[project.id] : '';
    const fallback = '/assets/images/logo.png';
    const src0 = preferred || project.image || fallback;
    
    // 优化图片加载体验
    resultImage.style.opacity = '0';
    resultImage.style.transition = 'opacity 0.3s ease-in-out';
    resultImage.onload = () => {
      resultImage.style.opacity = '1';
    };
    resultImage.onerror = function(){
      resultImage.onerror = null;
      resultImage.src = '/assets/images/logo.png';
      resultImage.style.opacity = '1';
    };
                resultImage.src = src0.startsWith('/') ? src0 : ('/' + src0);
    
    // 如果图片已缓存，立即显示
    if (resultImage.complete && resultImage.naturalHeight !== 0) {
      resultImage.style.opacity = '1';
    }
    
    // 第二阶段：渲染结果摘要（立即显示）
    setTimeout(() => {
      resultSummary.innerHTML = `<span class="font-semibold text-blue-700">${finalResult.description_en || finalResult.summary || ''}</span>`;
      resultSummary.style.opacity = '0';
      resultSummary.style.transition = 'opacity 0.3s ease-in-out';
      setTimeout(() => {
        resultSummary.style.opacity = '1';
      }, 50);
    }, 100);
    
    // 第三阶段：渲染分析内容（延迟显示，避免阻塞）
    setTimeout(() => {
      const rawAnalysis = finalResult.analysis || finalResult.analysisEn || '';
      if (project.type === 'disc' || project.type === 'disc40') {
        // 确保应用专用样式容器，与MBTI保持一致
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        // 使用与MBTI相同的Markdown处理方式
              try {
                if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
                  const mdHtml = window.marked.parse(enhanced);
                  resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
                } else {
            // 回退到格式化函数
            resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
          }
        } catch(_) {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
        }
      } else if (project.type === 'mbti') {
        // 确保应用专用样式容器
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        try {
          if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
            const mdHtml = window.marked.parse(enhanced);
            resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
          } else {
            resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
          }
        } catch(_) {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
          }
        } else {
        // 其他测试项目也使用统一的Markdown格式处理
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        try {
          if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
            const mdHtml = window.marked.parse(enhanced);
            resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
          } else {
            resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
          }
        } catch(_) {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.description_en || finalResult.summary);
        }
      }
      
      // 添加淡入效果
      resultAnalysis.style.opacity = '0';
      resultAnalysis.style.transition = 'opacity 0.3s ease-in-out';
      setTimeout(() => {
        resultAnalysis.style.opacity = '1';
      }, 50);
    }, 200);
    
    // 第四阶段：添加整体淡入效果
    setTimeout(() => {
      resultSection.style.opacity = '0';
      resultSection.style.transition = 'opacity 0.3s ease-in-out';
      setTimeout(() => {
        resultSection.style.opacity = '1';
      }, 50);
    }, 300);
  }

  // 预加载结果页面图片
  function preloadResultImage() {
    if (!project) return;
    
    const imageMap = {
      mbti: '/assets/images/mbti-career-personality-test.jpg',
      disc40: '/assets/images/disc-personality-test.jpg',
      introversion_en: '/assets/images/professional-test-for-introversion-extraversion-degree.jpg',
      enneagram_en: '/assets/images/enneagram-personality-test.jpg',
      eq_test_en: '/assets/images/international-standard-emotional-intelligence-test.jpg',
      phil_test_en: '/assets/images/phil-personality-test.jpg',
      four_colors_en: '/assets/images/four-colors-personality-analysis.jpg',
      pdp_test_en: '/assets/images/professional-dyna-metric-program.jpg',
      mental_age_test_en: '/assets/images/test-your-mental-age.jpg',
      holland_test_en: '/assets/images/holland-occupational-interest-test.jpg',
      kelsey_test_en: '/assets/images/kelsey-temperament-type-test.jpg',
      temperament_type_test: '/assets/images/temperament-type-test.jpg',
      social_anxiety_test: '/assets/images/social-anxiety-level-test.jpg',
      personality_charm_1min: '/assets/images/find-out-your-personality-charm-level-in-just-1-minute.jpg',
      violence_index: '/assets/images/find-out-how-many-stars-your-violence-index-has.jpg',
      creativity_test: '/assets/images/test-your-creativity.jpg',
      anxiety_depression_test: '/assets/images/anxiety-and-depression-level-test.jpg',
      loneliness_1min: '/assets/images/find-out-just-how-lonely-your-heart-really-is.jpg'
    };
    
    const preferred = (project && project.id && imageMap[project.id]) ? imageMap[project.id] : '';
    const fallback = '/assets/images/logo.png';
    const src0 = preferred || project.image || fallback;
    
    // 创建新的图片对象进行预加载
    const img = new Image();
    img.onload = () => {
      console.log('✅ 结果页面图片预加载完成:', src0);
    };
    img.onerror = () => {
      console.log('⚠️ 结果页面图片预加载失败，将使用默认图片');
    };
    img.src = src0.startsWith('/') ? src0 : ('/' + src0);
  }

  // 结果页面骨架屏显示函数
  function showResultSkeleton() {
    const resultSection = document.getElementById('result-section');
    if (!resultSection) return;
    
    // 显示结果页面骨架屏内容
    resultSection.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- 项目标题骨架 -->
        <div class="text-center mb-8">
          <div class="skeleton-text mx-auto mb-4" style="width: 300px; height: 2rem;"></div>
        </div>
        
        <!-- 项目图片骨架 -->
        <div class="skeleton mb-8" style="width: 100%; height: 300px; border-radius: 1rem;"></div>
        
        <!-- 结果内容骨架 -->
        <div class="text-center mb-8">
          <div class="skeleton-text mx-auto mb-4" style="width: 200px; height: 1.5rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 100%; height: 1rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 90%; height: 1rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 80%; height: 1rem;"></div>
        </div>
        
        <!-- 分析内容骨架 -->
        <div class="text-center">
          <div class="skeleton-text mx-auto mb-4" style="width: 150px; height: 1.5rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 100%; height: 1rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 100%; height: 1rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 95%; height: 1rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 85%; height: 1rem;"></div>
        </div>
      </div>
    `;
  }

  // 骨架屏显示函数
  function showSkeletonScreen() {
    const detailSection = document.getElementById('detail-section');
    if (!detailSection) return;
    
    // 显示骨架屏内容
    detailSection.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- 项目标题骨架 -->
        <div class="text-center mb-8">
          <div class="skeleton-text mx-auto mb-4" style="width: 300px; height: 2rem;"></div>
          <div class="skeleton-text mx-auto" style="width: 200px; height: 1.5rem;"></div>
        </div>
        
        <!-- 项目图片骨架 -->
        <div class="skeleton mb-8" style="width: 100%; height: 400px; border-radius: 1rem;"></div>
        
        <!-- 统计信息骨架 -->
        <div class="flex justify-center gap-8 mb-8">
          <div class="text-center">
            <div class="skeleton-text mb-2" style="width: 80px; height: 1.5rem;"></div>
            <div class="skeleton-text" style="width: 60px; height: 1rem;"></div>
          </div>
          <div class="text-center">
            <div class="skeleton-text mb-2" style="width: 80px; height: 1.5rem;"></div>
            <div class="skeleton-text" style="width: 60px; height: 1rem;"></div>
          </div>
          <div class="text-center">
            <div class="skeleton-text mb-2" style="width: 80px; height: 1.5rem;"></div>
            <div class="skeleton-text" style="width: 60px; height: 1rem;"></div>
          </div>
        </div>
        
        <!-- 开始按钮骨架 -->
        <div class="text-center mb-8">
          <div class="skeleton-button mx-auto" style="width: 200px; height: 3rem;"></div>
        </div>
        
        <!-- 介绍内容骨架 -->
        <div class="text-center">
          <div class="skeleton-text mx-auto mb-4" style="width: 150px; height: 1.5rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 100%; height: 1rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 100%; height: 1rem;"></div>
          <div class="skeleton-text mx-auto mb-2" style="width: 80%; height: 1rem;"></div>
        </div>
      </div>
    `;
  }

  // 立即显示骨架屏，提升用户体验
  console.log('Initializing test page...');
  showSkeletonScreen();
  
  // 立即开始渲染内容，不等待
  show('detail');
  renderProgress();
})();


