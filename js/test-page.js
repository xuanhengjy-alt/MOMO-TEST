(async function() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.replace('index.html'); return; }

  // 使用API服务获取项目数据
  let project;
  try {
    project = await window.ApiService.getTestProject(id);
  } catch (e) {
    console.warn('Failed to fetch project from API, using fallback data', e);
    // 回退到内置数据
    const fallbackProjects = window.ApiService.getFallbackProjects();
    project = fallbackProjects.find(p => p.id === id);
  }
  if (!project) { location.replace('index.html'); return; }

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

  // 将原始 MBTI 文本粗加工为 Markdown：按常见关键词插入多级标题与列表符号
  function toMarkdownWithHeadings(raw) {
    if (!raw) return '';
    const lines = String(raw).split('\n');
    const out = [];
    const headingRules = [
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
      if (rule) { out.push(rule.h); continue; }
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

  // 初始化项目信息
  breadcrumbProject.textContent = project.name;
  // 统一从 assets/images 取图：优先按项目 id 匹配本地图，其次使用返回图，再退回 logo
  (function(){
    var map = {
      mbti: 'assets/images/mbti-career-personality-test.png',
      disc40: 'assets/images/disc-personality-test.png'
    };
    var preferred = (project && project.id && map[project.id]) ? map[project.id] : '';
    projectImage.src = preferred || project.image || 'assets/images/logo.png';
  })();
  projectImage.alt = project.name;
  try {
    projectImage.onerror = function(){
      projectImage.onerror = null;
      projectImage.src = 'assets/images/mbti-career%20personality-test.png';
    };
  } catch(_) {}
  projectTitle.textContent = project.name;
  projectIntro.textContent = project.intro || '';
  // 对 MBTI 项目，尝试加载完整介绍文件（若存在）
  if (project && project.id === 'mbti') {
    try {
      let res = await fetch('/assets/data/mbti-intro.txt', { cache: 'no-store' });
      if (!res.ok) res = await fetch('assets/data/mbti-intro.txt', { cache: 'no-store' });
      if (res.ok) {
        const txt = await res.text();
        if (txt && txt.trim()) {
          projectIntro.textContent = txt;
        }
      }
    } catch (_) {
      // 本地 file:// 打开可能导致 fetch 失败：提供内置兜底全文
      var fullIntro = [
        "The MBTI personality theory is based on the classification of psychological types by the renowned psychologist Carl Jung, which was later studied and developed by a mother and daughter, Katharine Cook Briggs and Isabel Briggs Myers. This theory can help explain why different people are interested in different things, excel at different jobs, and sometimes don't understand each other. This tool has been in use around the world for nearly 30 years. Couples use it to enhance harmony, teachers and students use it to improve learning and teaching efficiency, young people use it to choose careers, organizations use it to improve interpersonal relationships, team communication, organizational building, organizational diagnosis and many other aspects. In the Fortune 500, 80 percent of companies have experience in applying MBTI.",
        "",
        "People tend to develop their personalities during adolescence, after which they have a relatively stable personality type, which then develops and improves dynamically over the years. We usually think that as a person grows older, his character changes. According to Jung's theory, once a person's character is formed, it is very difficult to change. The reason for showing different manifestations is that the character is developing dynamically due to changes in factors such as environment and experience, and functions that were not used before are also being exerted accordingly. If we use the left hand and the right hand as a metaphor, a person's MBTI tendencies are the hand he is most familiar with using, and as he gains more experience, he begins to practice using the other hand.",
        "",
        "The personality type description provided by MBTI is only for the test-taker to determine their own personality type. There are no good or bad personality types, only differences. Each personality trait has its own value and merits, as well as weaknesses and points to note. A clear understanding of one's strengths and weaknesses helps to better utilize one's strengths, and to avoid weaknesses in one's personality as much as possible in dealing with people and matters, to get along better with others, and to make better important decisions.",
        "",
        "Those who take part in the test must answer the questions honestly and independently. Only in this way can effective results be obtained."
      ].join('\n');
      projectIntro.textContent = fullIntro;
    }
  }

  // Disable pretty URL rewriting for static server to avoid 404 on relative assets under nested paths

  const testedKey = `tested_${project.id}`;
  const likesKey = `likes_${project.id}`;
  
  // 使用API数据或本地存储
  const tested = project.testedCount || loadLocal(testedKey, '1.1W+');
  let likes = project.likes || loadLocal(likesKey, getRandomLikes());
  
  testedCount.textContent = formatNumber(tested);
  likeCount.textContent = formatNumber(likes);

  likeBtn.addEventListener('click', async () => {
    try {
      // 尝试通过API更新点赞数
      const result = await window.ApiService.likeTestProject(project.id);
      likes = result.likes;
      likeCount.textContent = formatNumber(likes);
    } catch (error) {
      // API失败时使用本地存储
      likes += 1;
      likeCount.textContent = formatNumber(likes);
      saveLocal(likesKey, likes);
    }
    
    likeBtn.classList.add('animate-pulse');
    setTimeout(() => likeBtn.classList.remove('animate-pulse'), 300);
  });

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
        // 一致性校验：MBTI 必须 93题且每题2选项(A/B)
        if (project && project.id === 'mbti') {
          const okLen = questions.length === 93;
          const okOpts = questions.every(q => Array.isArray(q.opts) && q.opts.length === 2);
          if (!okLen || !okOpts) {
            console.warn('MBTI questions integrity check failed', { okLen, okOpts, len: questions.length });
          }
        }
        cachedQuestions = questions;
        return questions;
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

  // 统计信息：题数与预计时长（按每题约12秒估算）
  const totalQ = await getQList().then(q => q.length).catch(() => 0);
  const estMinutes = Math.max(1, Math.round((totalQ * 12) / 60));
  if (infoLine) {
    infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">${totalQ}</span> questions, estimated <span class="font-semibold text-rose-600">${estMinutes}</span> minutes`;
  }

  async function renderProgress() {
    const total = (await getQList()).length;
    const done = Math.min(qIndex, total);
    const pct = total ? Math.round(done / total * 100) : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = `${done}/${total}`;
  }

  async function renderQuestion() {
    await ensureTestLogicLoaded();
    const qlist = await getQList();
    // 若题库为空，给出友好提示
    if (!qlist || !qlist.length) {
      questionTitle.textContent = 'Question set failed to load. Please open with a local server and try again.';
      options.innerHTML = '';
      return;
    }
    const q = qlist[qIndex];
    if (!q) { // 结束
      // 计算测试结果
      const result = await window.TestLogic.score(project.type, answers);
      
      // 尝试提交结果到API并获取完整分析
      let apiResult = null;
      try {
        const sessionId = window.ApiService.generateSessionId();
        apiResult = await window.ApiService.submitTestResult(project.id, answers, sessionId);
        console.log('Test result submitted to API successfully');
      } catch (error) {
        console.warn('Failed to submit test result to API:', error);
        // 继续使用本地计算，即使API提交失败
      }
      
      // 优先使用API返回的结果，如果没有则使用本地计算结果
      const finalResult = apiResult && apiResult.result ? apiResult.result : result;
      
      resultTitle.textContent = project.name;
      (function(){
        var map = {
          mbti: 'assets/images/mbti-career-personality-test.png',
          disc40: 'assets/images/disc-personality-test.png'
        };
        var preferred = (project && project.id && map[project.id]) ? map[project.id] : '';
        resultImage.src = preferred || project.image || 'assets/images/logo.png';
      })();
      try {
        resultImage.onerror = function(){
          resultImage.onerror = null;
          resultImage.src = 'assets/images/mbti-career%20personality-test.png';
        };
      } catch(_) {}
      if (project.type === 'disc' || project.type === 'disc40') {
        resultSummary.textContent = finalResult.summary; // e.g., "Dominance, Influence" for ties
      } else if (project.type === 'mbti') {
        // Show MBTI code prominently
        resultSummary.innerHTML = `After testing, you are <span class="font-semibold text-blue-700">${finalResult.summary}</span> personality type.`;
      } else {
        resultSummary.textContent = `Total: ${finalResult.total} - ${finalResult.summary}`;
      }
      const rawAnalysis = finalResult.analysis || '';
      if (project.type === 'disc' || project.type === 'disc40') {
        // 确保应用专用样式容器，与MBTI保持一致
        try { resultAnalysis.classList.add('mbti-analysis'); } catch(_) {}
        try { resultAnalysis.classList.add('analysis-rich'); } catch(_) {}
        // 使用与MBTI相同的Markdown处理方式
        try {
          if (window.marked && window.DOMPurify) {
            const enhanced = toMarkdownWithHeadings(rawAnalysis || '');
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
            const enhanced = toMarkdownWithHeadings(rawAnalysis || '');
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
            const enhanced = toMarkdownWithHeadings(rawAnalysis || '');
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
      return;
    }
    questionTitle.textContent = q.t || q.text || '';
    options.innerHTML = '';
    q.opts.forEach((opt, idx) => {
      const text = typeof opt === 'string' ? opt : (opt.text || '');
      const btn = document.createElement('button');
      btn.className = 'w-full text-left px-4 py-3 rounded border hover:bg-gray-50';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        // 保存答案
        var answerIndex = (opt && typeof opt.n === 'number') ? (opt.n - 1) : idx;
        answers.push(answerIndex);
        qIndex += 1;
        renderProgress();
        renderQuestion();
      });
      options.appendChild(btn);
    });
  }

  gotoStart.addEventListener('click', async (e) => {
    e.preventDefault();
    qIndex = 0;
    answers.length = 0;
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
    renderProgress();
    renderQuestion();
  });

  resultRestart.addEventListener('click', (e) => {
    e.preventDefault();
    qIndex = 0;
    answers.length = 0;
    show('start');
    renderProgress();
    renderQuestion();
  });

  // 初始显示
  show('detail');
  renderProgress();
})();


