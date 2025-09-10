(async function() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { location.replace('index.html'); return; }

  let data;
  try {
    const res = await fetch('assets/data/tests.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    data = await res.json();
  } catch (e) {
    console.warn('加载测试数据失败，使用内置数据。建议使用本地服务器预览。', e);
    data = { projects: [
      { id:'disc', name:'DISC性格测试', image:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
        intro:'0世纪20年代，美国心理学家威廉·莫尔顿·马斯顿创建了一个理论来解释人的情绪反应，在此之前，这种工作主要局限在对于精神病患者或精神失常人群的研究，而马斯顿博士则希望扩大这个研究范围，以运用于心理健康的普通人群，因此，马斯顿博士将他的理论构建为一个体系，即 The Emotions of Normal People——“正常人的情绪”。\n\n为了检验他的理论，马斯顿博士需要采用某种心理测评的方式来衡量人群的情绪反映——“人格特征”，因此，他采用了四个他认为是非常典型的人格特质因子，即 Dominance－支配，Influence－影响，Steady－稳健，以及 Compliance－服从。而 DISC，正是代表了这四个英文单词的首字母。在1928年，马斯顿博士正是在他的“正常人的情绪”一书中，提出了 DISC 测评，以及理论说明。\n\n目前，DISC 理论已被广泛应用于世界500强企业的人才招聘，历史悠久、专业性强、权威性高。',
        type:'disc' },
      { id:'mgmt', name:'管理能力测试', image:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
        intro:'管理能力自测是一个帮助个人评估和提升其管理技能的重要工具。通过自测，管理者可以识别自己的优势和需要改进的领域，从而为职业发展制定更有效的计划。',
        type:'mgmt' }
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
    breadcrumbSubview.textContent = view === 'detail' ? '详情' : view === 'start' ? '开始测试' : '测试结果';
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

  // 测试进程
  const qlist = window.TestLogic.getQuestions(project.type);
  let qIndex = 0;
  const answers = [];

  // 统计信息：题数与预计时长（按每题约12秒估算）
  const totalQ = qlist.length;
  const estMinutes = Math.max(1, Math.round((totalQ * 12) / 60));
  if (infoLine) {
    infoLine.textContent = `共有${totalQ}个测试问题，预计用时${estMinutes}分钟`;
  }

  function renderProgress() {
    const total = qlist.length;
    const done = Math.min(qIndex, total);
    const pct = total ? Math.round(done / total * 100) : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = `${done}/${total}`;
  }

  function renderQuestion() {
    const q = qlist[qIndex];
    if (!q) { // 结束
      const result = window.TestLogic.score(project.type, answers);
      resultTitle.textContent = project.name;
      resultImage.src = project.image;
      resultSummary.textContent = project.type === 'disc'
        ? result.summary // 如：Influence－活泼型/社交者；并列时为“A、B”
        : `总分：${result.total} 分 - ${result.summary}`;
      resultAnalysis.textContent = result.analysis || '';
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

  gotoStart.addEventListener('click', () => {
    qIndex = 0;
    answers.length = 0;
    renderProgress();
    renderQuestion();
    show('start');
  });

  restartBtn.addEventListener('click', () => {
    qIndex = 0;
    answers.length = 0;
    renderProgress();
    renderQuestion();
  });

  resultRestart.addEventListener('click', () => {
    qIndex = 0;
    answers.length = 0;
    renderProgress();
    renderQuestion();
    show('start');
  });

  // 初始显示
  show('detail');
  renderProgress();
})();


