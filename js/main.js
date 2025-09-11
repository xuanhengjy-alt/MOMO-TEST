/* 首页渲染与导航 */
(async function() {
  const container = document.getElementById('card-container');
  if (!container) return;
  let data;
  try {
    // Under file:// CORS will fail; attempt relative first then absolute
    let res = await fetch('assets/data/tests.json', { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch('/assets/data/tests.json', { cache: 'no-store' });
    }
    if (!res.ok) throw new Error('Network response was not ok');
    data = await res.json();
  } catch (err) {
    console.warn('加载测试数据失败，使用内置数据。可能是本地直接打开导致JSON无法读取。建议使用本地静态服务器（如 VSCode Live Server 或 npx serve）。', err);
    data = {
      projects: [
        {
          id: 'mbti',
          name: 'MBTI Career Personality Test',
          image: 'assets/images/mbti-career personality-test.png',
          intro: 'The MBTI personality theory is based on the classification of psychological types by Carl Jung, later developed by Katharine Cook Briggs and Isabel Briggs Myers. It helps explain why people have different interests, excel at different jobs, and sometimes misunderstand each other. For decades, MBTI has been used worldwide by couples, teachers and students, young people choosing careers, and organizations to improve relationships, team communication, organizational building and diagnostics. In the Fortune 500, 80% of companies have experience applying MBTI.',
          type: 'mbti'
        },
        {
          id: 'disc',
          name: 'DISC性格测试',
          image: 'assets/images/discceshi.png',
          intro: 'DISC 理论起源于马斯顿博士提出的“正常人的情绪”，用于衡量人格特质的四个典型因子：D/I/S/C。',
          type: 'disc'
        },
        {
          id: 'mgmt',
          name: '管理能力测试',
          image: 'assets/images/guanli.png',
          intro: '评估管理能力强弱与改进方向。',
          type: 'mgmt'
        },
        {
          id: 'disc40',
          name: 'DISC Personality Test',
          image: 'assets/images/disc-personality-test.png',
          intro: 'In the 1920s, American psychologist William Moulton Marston developed a theory to explain human emotional responses. Prior to this, such research had been largely confined to studies of psychiatric patients or individuals with mental disorders. Dr. Marston sought to broaden the scope of this research to apply it to the general population with normal mental health. Consequently, he structured his theory into a systematic framework titled The Emotions of Normal People.\n\nTo test his theory, Dr. Marston needed a psychological assessment method to measure emotional responses—specifically, “personality traits.” He identified four highly representative personality factors: Dominance, Influence, Steadiness, and Compliance. DISC represents the initial letters of these four English words. In 1928, Dr. Marston formally introduced the DISC assessment and its theoretical framework within his book The Emotions of Normal People.\n\nToday, DISC theory is extensively applied in talent recruitment by Fortune 500 companies worldwide, distinguished by its longstanding history, strong professionalism, and high authority.',
          type: 'disc40'
        }
      ]
    };
    // 在 file:// 下隐藏提示，直接使用内置数据避免打断体验
  }
  const tpl = document.getElementById('test-card-template');

  data.projects.forEach(p => {
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector('img');
    const title = node.querySelector('h3');
    const people = node.querySelector('.people');
    const btn = node.querySelector('.start-btn');

    const skeleton = node.querySelector('.skeleton');
    img.src = p.image;
    img.alt = p.name;
    img.addEventListener('load', () => {
      skeleton.classList.add('hidden');
      img.classList.remove('hidden');
    });
    title.textContent = p.name;

    const testedKey = `tested_${p.id}`;
    const likeKey = `likes_${p.id}`;
    // 初始化W+与likes（首页需要W+）
    let tested = Utils.loadLocal(testedKey, null);
    if (!tested) {
      tested = Utils.getRandomTestedW();
      Utils.saveLocal(testedKey, tested);
    }
    people.textContent = tested;

    if (Utils.loadLocal(likeKey, null) == null) {
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


