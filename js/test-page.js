(async function() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.replace('index.html'); return; }

  let data;
  try {
    // file:// 优先使用相对路径
    let res = await fetch('assets/data/tests.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    data = await res.json();
  } catch (e) {
    // file:// 下回退至内置数据
    data = { projects: [
      { id:'mbti', name:'MBTI Career Personality Test', image:'assets/images/mbti-career personality-test.png',
        intro:'The MBTI personality theory is based on the classification of psychological types by Carl Jung, later developed by Katharine Cook Briggs and Isabel Briggs Myers. It helps explain why people have different interests, excel at different jobs, and sometimes misunderstand each other. For decades, MBTI has been used worldwide by couples, teachers and students, young people choosing careers, and organizations to improve relationships, team communication, organizational building and diagnostics. In the Fortune 500, 80% of companies have experience applying MBTI.',
        type:'mbti' },
      { id:'disc', name:'DISC性格测试', image:'assets/images/discceshi.png',
        intro:'0世纪20年代，美国心理学家威廉·莫尔顿·马斯顿创建了一个理论来解释人的情绪反应，在此之前，这种工作主要局限在对于精神病患者或精神失常人群的研究，而马斯顿博士则希望扩大这个研究范围，以运用于心理健康的普通人群，因此，马斯顿博士将他的理论构建为一个体系，即 The Emotions of Normal People——“正常人的情绪”。\n\n为了检验他的理论，马斯顿博士需要采用某种心理测评的方式来衡量人群的情绪反映——“人格特征”，因此，他采用了四个他认为是非常典型的人格特质因子，即 Dominance－支配，Influence－影响，Steady－稳健，以及 Compliance－服从。而 DISC，正是代表了这四个英文单词的首字母。在1928年，马斯顿博士正是在他的“正常人的情绪”一书中，提出了 DISC 测评，以及理论说明。\n\n目前，DISC 理论已被广泛应用于世界500强企业的人才招聘，历史悠久、专业性强、权威性高。',
        type:'disc' },
      { id:'mgmt', name:'管理能力测试', image:'assets/images/guanli.png',
        intro:'管理能力自测是一个帮助个人评估和提升其管理技能的重要工具。通过自测，管理者可以识别自己的优势和需要改进的领域，从而为职业发展制定更有效的计划。',
        type:'mgmt' },
      { id:'disc40', name:'DISC Personality Test', image:'assets/images/disc-personality-test.png',
        intro:'In the 1920s, American psychologist William Moulton Marston developed a theory to explain human emotional responses. Prior to this, such research had been largely confined to studies of psychiatric patients or individuals with mental disorders. Dr. Marston sought to broaden the scope of this research to apply it to the general population with normal mental health. Consequently, he structured his theory into a systematic framework titled The Emotions of Normal People.\n\nTo test his theory, Dr. Marston needed a psychological assessment method to measure emotional responses—specifically, “personality traits.” He identified four highly representative personality factors: Dominance, Influence, Steadiness, and Compliance. DISC represents the initial letters of these four English words. In 1928, Dr. Marston formally introduced the DISC assessment and its theoretical framework within his book The Emotions of Normal People.\n\nToday, DISC theory is extensively applied in talent recruitment by Fortune 500 companies worldwide, distinguished by its longstanding history, strong professionalism, and high authority.', type:'disc40' }
    ] };
  }
  const project = data.projects.find(p => p.id === id);
  if (!project) { location.replace('index.html'); return; }

  const { $, $all, loadLocal, saveLocal, getRandomLikes } = window.Utils;

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
  projectImage.src = project.image;
  projectImage.alt = project.name;
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

  // Pretty URL for DISC Personality Test: domain + project name (slug)
  if (project && project.id === 'disc40') {
    try {
      const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const baseDir = location.pathname.replace(/[^\/]+$/, '');
      const prettyPath = baseDir + slug;
      if (location.pathname !== prettyPath) {
        history.replaceState(null, '', prettyPath);
      }
    } catch (_) {}
  }

  const testedKey = `tested_${project.id}`;
  const likesKey = `likes_${project.id}`;
  const tested = loadLocal(testedKey, '1.1W+');
  let likes = loadLocal(likesKey, getRandomLikes());
  testedCount.textContent = tested;
  likeCount.textContent = likes;

  likeBtn.addEventListener('click', () => {
    likes += 1;
    likeCount.textContent = likes;
    likeBtn.classList.add('animate-pulse');
    setTimeout(() => likeBtn.classList.remove('animate-pulse'), 300);
    saveLocal(likesKey, likes);
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

  // 测试进程（实时获取题库，避免初始化时机问题）
  function getQList() {
    try {
      if (!(window.TestLogic && typeof window.TestLogic.getQuestions === 'function')) return [];
      let t = project && project.type ? project.type : '';
      let qs = window.TestLogic.getQuestions(t) || [];
      if (qs.length) return qs;
      // 兼容性兜底：按 id 猜测类型
      const fallbackTypeById = {
        disc: 'disc',
        disc40: 'disc40',
        mgmt: 'mgmt',
        mbti: 'mbti'
      };
      if (project && project.id && fallbackTypeById[project.id]) {
        qs = window.TestLogic.getQuestions(fallbackTypeById[project.id]) || [];
        if (qs.length) return qs;
      }
      // 最后再尝试常用题库，确保不为空
      const tryTypes = ['mbti','disc40','disc','mgmt'];
      for (var i=0;i<tryTypes.length;i++) {
        qs = window.TestLogic.getQuestions(tryTypes[i]) || [];
        if (qs.length) return qs;
      }
      return [];
    } catch(_) { return []; }
  }
  let qIndex = 0;
  const answers = [];

  // 统计信息：题数与预计时长（按每题约12秒估算）
  const totalQ = getQList().length;
  const estMinutes = Math.max(1, Math.round((totalQ * 12) / 60));
  if (infoLine) {
    infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">${totalQ}</span> questions, estimated <span class="font-semibold text-rose-600">${estMinutes}</span> minutes`;
  }

  function renderProgress() {
    const total = getQList().length;
    const done = Math.min(qIndex, total);
    const pct = total ? Math.round(done / total * 100) : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = `${done}/${total}`;
  }

  async function renderQuestion() {
    await ensureTestLogicLoaded();
    const qlist = getQList();
    // 若题库为空，给出友好提示
    if (!qlist || !qlist.length) {
      questionTitle.textContent = 'Question set failed to load. Please open with a local server and try again.';
      options.innerHTML = '';
      return;
    }
    const q = qlist[qIndex];
    if (!q) { // 结束
      const result = await window.TestLogic.score(project.type, answers);
      resultTitle.textContent = project.name;
      resultImage.src = project.image;
      if (project.type === 'disc' || project.type === 'disc40') {
        resultSummary.textContent = result.summary; // e.g., "Dominance, Influence" for ties
      } else if (project.type === 'mbti') {
        // Show MBTI code prominently
        resultSummary.innerHTML = `After testing, you are <span class="font-semibold text-blue-700">${result.summary}</span> personality type.`;
      } else {
        resultSummary.textContent = `Total: ${result.total} - ${result.summary}`;
      }
      const rawAnalysis = result.analysis || '';
      if (project.type === 'disc' || project.type === 'disc40') {
        // Split paragraphs by double newlines for better readability
        const parts = rawAnalysis.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
        const html = parts.map(p => {
          const h = p.replace(/^(Dominance|Influence|Steadiness|Compliance)/, '<span class="analysis-key">$1</span>');
          return `<p>${h}</p>`;
        }).join('');
        resultAnalysis.innerHTML = html;
      } else if (project.type === 'mbti') {
        // For MBTI, highlight the type code
        const html = rawAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong class="text-rose-600">$1</strong>');
        resultAnalysis.innerHTML = `<p>${html.replace(/\n/g,'<br>')}</p>`;
      } else {
        // Default: paragraphize by double newlines
        const parts = rawAnalysis.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
        resultAnalysis.innerHTML = parts.map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
      }
      show('result');
      return;
    }
    questionTitle.textContent = q.t;
    options.innerHTML = '';
    q.opts.forEach((text, idx) => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left px-4 py-3 rounded border hover:bg-gray-50';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        // 保存答案
        answers.push(idx);
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


