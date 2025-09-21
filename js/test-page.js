(async function() {
  // 支持 pretty URL: /test-detail.html/<id-or-slug>
  function extractIdFromUrl(){
    try {
      // 1) 优先从 pathname 解析
      const parts = location.pathname.split('/').filter(Boolean);
      console.log('🔍 URL parts:', parts);
      
      // 处理 test-detail.html/mbti 格式
      if (parts.length >= 2 && parts[parts.length-2] === 'test-detail.html') {
        const v = decodeURIComponent(parts[parts.length-1] || '');
        console.log('✅ 从pathname解析到ID:', v);
        if (v && v !== 'index.html') return v; // 排除index.html
      }
      
      // 2) 处理 Vercel重写后的情况：test-detail.html/index.html -> 从referrer获取
      if (parts.length >= 2 && parts[parts.length-2] === 'test-detail.html' && parts[parts.length-1] === 'index.html') {
        console.log('🔍 检测到Vercel重写情况，尝试从referrer解析');
        if (document.referrer) {
          const referrerMatch = /test-detail\.html\/([^\/\?]+)/.exec(document.referrer);
          if (referrerMatch && referrerMatch[1]) {
            const v = decodeURIComponent(referrerMatch[1]);
            console.log('✅ 从referrer解析到ID:', v);
            return v;
          }
        }
      }
      
      // 3) 再从 href 正则解析（兼容某些代理重写场景）
      const m = /test-detail\.html\/(.+?)(?:[?#]|$)/i.exec(location.href);
      if (m && m[1]) {
        const v = decodeURIComponent(m[1]);
        console.log('✅ 从href正则解析到ID:', v);
        if (v && v !== 'index.html') return v; // 排除index.html
      }
      
      // 4) 兼容旧链接 ?id=
      const params = new URLSearchParams(location.search);
      const q = params.get('id');
      if (q) {
        console.log('✅ 从查询参数解析到ID:', q);
        return q;
      }
      
      // 5) 检查是否是直接访问test-detail.html的情况（没有项目ID）
      if (parts.includes('test-detail.html') && parts.length === 1) {
        console.log('❌ 直接访问test-detail.html，没有项目ID');
        return null;
      }
      
      console.log('❌ 没有找到项目ID');
    } catch(error) {
      console.error('❌ URL解析错误:', error);
    }
    return '';
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
    
    // 先尝试直接按 id 取（处理直接使用项目ID的情况）
    try {
      const prj = await window.ApiService.getTestProject(input);
      if (prj && prj.id) {
        console.log('✅ 直接找到项目:', prj.id);
        return prj.id;
      }
    } catch(_) {
      console.log('⚠️ 直接API调用失败，尝试其他方法');
    }
    
    // 拉取项目列表，根据 nameEn 规范化匹配
    let projects;
    try {
      projects = await window.ApiService.getTestProjects();
      const sanitize = (s)=>String(s||'').toLowerCase().trim().replace(/[\s/_.,:：—-]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').slice(0,60);
      
      console.log('📋 项目列表:', projects.map(p => ({ id: p.id, nameEn: p.nameEn, slug: sanitize(p.nameEn||p.name) })));
      
      // 先尝试精确匹配slug
      const inputSlug = sanitize(input);
      let hit = (projects||[]).find(p => sanitize(p.nameEn||p.name) === inputSlug);
      if (hit) {
        console.log('✅ 精确匹配找到项目:', hit.id);
        return hit.id;
      }
      
      // 再尝试部分匹配（处理 social-test-anxiety-test -> social_anxiety_test 的情况）
      hit = (projects||[]).find(p => {
        const projectSlug = sanitize(p.nameEn||p.name);
        const inputSlug = input.toLowerCase();
        // 检查是否包含关键词汇
        const projectWords = projectSlug.split('-');
        const inputWords = inputSlug.split('-');
        return projectWords.some(word => inputWords.includes(word)) && 
               inputWords.some(word => projectWords.includes(word));
      });
      if (hit) {
        console.log('✅ 部分匹配找到项目:', hit.id);
        return hit.id;
      }
      
      // 最后尝试模糊匹配
      hit = (projects||[]).find(p => {
        const projectSlug = sanitize(p.nameEn||p.name);
        const inputSlug = input.toLowerCase();
        return projectSlug.includes(inputSlug) || inputSlug.includes(projectSlug);
      });
      if (hit) {
        console.log('✅ 模糊匹配找到项目:', hit.id);
        return hit.id;
      }
      
    } catch(error) {
      console.error('❌ 获取项目列表失败:', error);
      console.log('🔄 尝试使用回退数据...');
      
      // 使用回退数据
      projects = window.ApiService.getFallbackProjects();
      console.log('📋 回退项目列表:', projects.map(p => ({ id: p.id, nameEn: p.nameEn })));
      
      // 在回退数据中查找
      const sanitize = (s)=>String(s||'').toLowerCase().trim().replace(/[\s/_.,:：—-]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').slice(0,60);
      
      // 先尝试精确匹配
      let hit = projects.find(p => p.id === input);
      if (hit) {
        console.log('✅ 在回退数据中精确匹配找到项目:', hit.id);
        return hit.id;
      }
      
      // 尝试slug匹配
      const inputSlug = sanitize(input);
      hit = projects.find(p => sanitize(p.nameEn||p.name) === inputSlug);
      if (hit) {
        console.log('✅ 在回退数据中slug匹配找到项目:', hit.id);
        return hit.id;
      }
    }
    
    // 如果都找不到，返回原始输入（可能是有效的项目ID）
    console.log(`⚠️ 项目未找到，返回原始输入: ${input}`);
    return input;
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

  // 使用API服务获取项目数据
  let project;
  try {
    console.log('🔍 尝试获取项目数据，项目ID:', id);
    project = await window.ApiService.getTestProject(id);
    console.log('✅ 从API获取项目数据成功:', project);
  } catch (e) {
    console.warn('⚠️ 从API获取项目数据失败，尝试使用回退数据:', e);
    // 回退到内置数据
    try {
      const fallbackProjects = window.ApiService.getFallbackProjects();
      project = fallbackProjects.find(p => p.id === id);
      console.log('✅ 从回退数据获取项目数据:', project);
    } catch (fallbackError) {
      console.error('❌ 回退数据也失败:', fallbackError);
    }
  }
  
  if (!project) { 
    console.error('❌ 无法获取项目数据，重定向到主页');
    location.replace('index.html'); 
    return; 
  }
  
  console.log('Final project data:', project);
  console.log('Project ID:', project.id);
  
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
    return String(md).replace(/\*\*\s*([^*][^*]*?)\s*\*\*/g, function(_, inner){
      return '**' + inner.replace(/^\s+|\s+$/g, '') + '**';
    });
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
  const breadcrumbProject = $('#breadcrumb-project');
  const breadcrumbSubview = $('#breadcrumb-subview');
  const breadcrumbBar = document.getElementById('breadcrumb-bar');
  const viewDetail = $('#view-detail');
  const viewStart = $('#view-start');
  const viewResult = $('#view-result');

  // 详情视图元素
  const projectImage = $('#project-image');
  const projectTitle = $('#project-title');
  const testedCount = $('#tested-count');
  const likeBtn = $('#like-btn');
  const likeCount = $('#like-count');
  const gotoStart = $('#goto-start');
  const projectIntro = $('#project-intro');

  // 开始视图元素
  const progressBar = $('#progress-bar');
  const progressText = $('#progress-text');
  const questionTitle = $('#question-title');
  const options = $('#options');
  const restartBtn = $('#restart-btn');

  // 结果视图元素
  const resultTitle = $('#result-title');
  const resultImage = $('#result-image');
  const resultSummary = $('#result-summary');
  const resultAnalysis = $('#result-analysis');
  const resultRestart = $('#result-restart');
  const infoLine = $('#info-line');

  // 计算中提示（绿色、底部、居中）
  let calcNoticeEl = null;
  function showCalculatingNotice(show) {
    try {
      if (!calcNoticeEl) {
        calcNoticeEl = document.createElement('div');
        calcNoticeEl.id = 'calc-notice';
        calcNoticeEl.style.textAlign = 'center';
        calcNoticeEl.style.color = '#16a34a'; // green-600
        calcNoticeEl.style.marginTop = '12px';
        calcNoticeEl.style.fontWeight = '600';
        calcNoticeEl.textContent = 'The result is being calculated. Please wait a moment......';
      }
      if (show) {
        if (!calcNoticeEl.parentElement) {
          // 插入到选项区域下方（题目框底部）
          (options && options.parentElement ? options.parentElement : document.body).appendChild(calcNoticeEl);
        }
        calcNoticeEl.classList.remove('hidden');
      } else {
        calcNoticeEl.classList.add('hidden');
      }
    } catch (_) {}
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
    projectImage.src = src0.startsWith('/') ? src0 : ('/' + src0);
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
  })(project.introEn || '');
  // 介绍统一使用数据库返回的 intro_en，不再从本地文件加载

  // Disable pretty URL rewriting for static server to avoid 404 on relative assets under nested paths

  const testedKey = `tested_${project.id}`;
  const likesKey = `likes_${project.id}`;
  
  // 使用API数据或本地存储
  const tested = project.testedCount || loadLocal(testedKey, '1.1W+');
  let likes = project.likes || loadLocal(likesKey, getRandomLikes());
  
  testedCount.textContent = formatNumber(tested);
  likeCount.textContent = formatNumber(likes);

  // 初始化点赞状态
  let isLiked = false;
  
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
  
  // 页面加载时检查点赞状态
  checkLikeStatus();

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
  let cachedQuestions = null;
  
  async function getQList() {
    if (cachedQuestions) return cachedQuestions;
    
    try {
      // 尝试从API获取题目
      const questions = await window.ApiService.getTestQuestions(project.id);
      if (questions && questions.length > 0) {
        // 转换API数据格式为前端期望的格式
        const convertedQuestions = questions.map(q => ({
          id: q.id || q.order || 0,
          text: q.text || q.question_text || '',
          opts: (q.options || []).map(opt => ({
            text: opt.text || opt.option_text || '',
            value: opt.value || opt.score_value || 0
          }))
        }));
        
        console.log('Converted questions:', convertedQuestions.slice(0, 2)); // 调试日志
        
        // 一致性校验：MBTI 必须 93题且每题2选项(A/B)
        if (project && project.id === 'mbti') {
          const okLen = convertedQuestions.length === 93;
          const okOpts = convertedQuestions.every(q => Array.isArray(q.opts) && q.opts.length === 2);
          if (!okLen || !okOpts) {
            console.warn('MBTI questions integrity check failed', { okLen, okOpts, len: convertedQuestions.length });
          }
        }
        cachedQuestions = convertedQuestions;
        return convertedQuestions;
      }
    } catch (error) {
      console.warn('Failed to fetch questions from API, using local logic', error);
    }
    
    // 回退到本地逻辑
    try {
      if (!(window.TestLogic && typeof window.TestLogic.getQuestions === 'function')) return [];
      let t = project && project.type ? project.type : '';
      let qs = window.TestLogic.getQuestions(t) || [];
      if (qs.length) {
        cachedQuestions = qs;
        return qs;
      }
      // 兼容性兜底：按 id 猜测类型
      const fallbackTypeById = {
        disc: 'disc',
        disc40: 'disc40',
        mgmt: 'mgmt',
        mbti: 'mbti'
      };
      if (project && project.id && fallbackTypeById[project.id]) {
        qs = window.TestLogic.getQuestions(fallbackTypeById[project.id]) || [];
        if (qs.length) {
          cachedQuestions = qs;
          return qs;
        }
      }
      // 最后再尝试常用题库，确保不为空
      const tryTypes = ['mbti','disc40','disc','mgmt'];
      for (var i=0;i<tryTypes.length;i++) {
        qs = window.TestLogic.getQuestions(tryTypes[i]) || [];
        if (qs.length) {
          cachedQuestions = qs;
          return qs;
        }
      }
      return [];
    } catch(_) { return []; }
  }
  let qIndex = 0;
  const answers = [];
  let resultShown = false;
  let isSubmitting = false;

  // 统计信息：题数与预计时长（按每题约12秒估算）
  // 先显示占位骨架，随后并行获取题量后覆盖
  if (infoLine) {
    infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">--</span> questions, estimated <span class="font-semibold text-rose-600">--</span> minutes`;
  }
  (async () => {
    const totalQ = await getQList().then(q => q.length).catch(() => 0);
    const estMinutes = Math.max(1, Math.round((totalQ * 12) / 60));
    if (infoLine) {
      infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">${totalQ}</span> questions, estimated <span class="font-semibold text-rose-600">${estMinutes}</span> minutes`;
    }
  })();

  async function renderProgress() {
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
    const total = (await getQList()).length;
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
      showCalculatingNotice(true);
      // 仅从后端获取结果，不再使用本地兜底
      let apiResult = null;
      try {
        const sessionId = window.ApiService.generateSessionId();
        apiResult = await window.ApiService.submitTestResult(project.id, answers, sessionId);
        console.log('Test result submitted to API successfully');
      } catch (error) {
        console.error('Failed to submit test result to API (no fallback):', error);
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
      
      resultTitle.textContent = project.name;
      (function(){
        var map = {
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
        var preferred = (project && project.id && map[project.id]) ? map[project.id] : '';
        var fallback = '/assets/images/logo.png';
        var src0 = preferred || project.image || fallback;
        resultImage.src = src0.startsWith('/') ? src0 : ('/' + src0);
      })();
      try {
        resultImage.onerror = function(){
          resultImage.onerror = null;
          resultImage.src = '/assets/images/logo.png';
        };
      } catch(_) {}
      // 统一用后端（或本地评分）返回的 summary/analysis 展示，保持从数据库获取
      resultSummary.innerHTML = `<span class="font-semibold text-blue-700">${finalResult.summary || ''}</span>`;
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
            resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.summary);
          }
        } catch(_) {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.summary);
        }
      } else if (project.type === 'mbti') {
        // 确保应用专用样式容器
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        // 始终优先用 Markdown（若库已加载），在渲染前先进行“加标题”的粗加工
        try {
          if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
            const mdHtml = window.marked.parse(enhanced);
            resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
          } else {
            resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.summary);
          }
        } catch(_) {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.summary);
        }
      } else {
        // 其他测试项目也使用统一的Markdown格式处理
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        try {
          if (window.marked && window.DOMPurify) {
            // 所有测试类型都支持Markdown标题渲染
            const enhanced = toMarkdownWithHeadings(normalizeStrong(rawAnalysis || ''));
            const mdHtml = window.marked.parse(enhanced);
            resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
          } else {
            resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.summary);
          }
        } catch(_) {
          resultAnalysis.innerHTML = formatMbtiAnalysis(rawAnalysis, finalResult.summary);
        }
      }
      show('result');
      resultShown = true;
      showCalculatingNotice(false);
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
            // 直接出结果：调用后端，前端只显示后端返回的 summary/analysis（对应 description_en/analysis_en）
            try {
              // 跳转型：命中结果码，开始计算（防重复提交）
              if (resultShown || isSubmitting) { return; }
              isSubmitting = true;
              showCalculatingNotice(true);
              const sessionId = window.ApiService.generateSessionId();
              const apiRes = await window.ApiService.submitTestResult(project.id, answers, sessionId);
              const r = (apiRes && apiRes.result) ? apiRes.result : {};
              resultTitle.textContent = project.name;
              (function(){
                var map = {
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
                var preferred = (project && project.id && map[project.id]) ? map[project.id] : '';
                var fallback = '/assets/images/logo.png';
                var src0 = preferred || project.image || fallback;
                resultImage.src = src0.startsWith('/') ? src0 : ('/' + src0);
              })();
              resultSummary.innerHTML = `<span class=\"font-semibold text-blue-700\">${r.summary || r.summaryEn || ''}</span>`;
              try { resultAnalysis.classList.add('mbti-analysis'); resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
              const text = r.analysis || r.analysisEn || '';
              try {
                if (window.marked && window.DOMPurify) {
                  const enhanced = toMarkdownWithHeadings(normalizeStrong(text));
                  const mdHtml = window.marked.parse(enhanced);
                  resultAnalysis.innerHTML = window.DOMPurify.sanitize(mdHtml);
                } else {
                  resultAnalysis.textContent = text;
                }
              } catch(_) { resultAnalysis.textContent = text; }
              show('result');
              resultShown = true;
              showCalculatingNotice(false);
              isSubmitting = false;
              return;
            } catch (e) {
              // 后端失败则回退为本地渲染（极端容错）
            }
          }
          if (opt.next != null) {
            qIndex = Math.max(0, Math.min((opt.next - 1), qlist.length));
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
    const qs = getQList();
    if (infoLine) {
      const total = qs.length;
      const mins = Math.max(1, Math.round((total * 12) / 60));
      infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">${total}</span> questions, estimated <span class="font-semibold text-rose-600">${mins}</span> minutes`;
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

  // 初始显示
  console.log('Initializing test page...');
  show('detail');
  renderProgress();
  console.log('About to call renderQuestion...');
  renderQuestion();
})();


