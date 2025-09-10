/* 首页渲染与导航 */
(async function() {
  const container = document.getElementById('card-container');
  if (!container) return;
  let data;
  try {
    const res = await fetch('assets/data/tests.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Network response was not ok');
    data = await res.json();
  } catch (err) {
    console.warn('加载测试数据失败，使用内置数据。可能是本地直接打开导致JSON无法读取。建议使用本地静态服务器（如 VSCode Live Server 或 npx serve）。', err);
    data = {
      projects: [
        {
          id: 'disc',
          name: 'DISC性格测试',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
          intro: 'DISC 理论起源于马斯顿博士提出的“正常人的情绪”，用于衡量人格特质的四个典型因子：D/I/S/C。',
          type: 'disc'
        },
        {
          id: 'mgmt',
          name: '管理能力测试',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
          intro: '评估管理能力强弱与改进方向。',
          type: 'mgmt'
        }
      ]
    };
    const hint = document.createElement('div');
    hint.className = 'mb-4 p-3 rounded border bg-yellow-50 text-yellow-800 text-sm';
    hint.textContent = '提示：本页面直接用浏览器打开可能无法读取本地JSON数据，已使用内置示例数据。建议使用本地服务器预览（如 VSCode Live Server 或 npx serve）。';
    container.parentElement.insertBefore(hint, container);
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


