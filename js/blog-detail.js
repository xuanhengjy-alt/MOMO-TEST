(async function(){
  const pathParts = location.pathname.split('/').filter(Boolean);
  let slug = null;
  if (pathParts.length >= 2 && pathParts[pathParts.length-2] === 'blog-detail.html') {
    slug = decodeURIComponent(pathParts[pathParts.length-1] || '');
  }
  if (!slug) {
    const params = new URLSearchParams(location.search);
    slug = params.get('slug');
  }
  if (!slug) { location.replace('/blog.html'); return; }

  const titleEl = document.getElementById('blog-title');
  const coverEl = document.getElementById('blog-cover');
  const contentEl = document.getElementById('blog-content');
  const breadcrumb = document.getElementById('breadcrumb-title');

  function renderMarkdown(md){
    // 规范化粗体：
    // 1) ** <text> ** 或 **  text  ** → **text**（去掉两端空格，避免 CommonMark 解析失败）
    // 2) **<span>text</span>** → <span><strong>text</strong></span>
    function normalizeStrongSpans(src){
      if (!src) return '';
      try {
        let out = src;
        // 修正 ** 前后留白导致的不解析
        out = out.replace(/\*\*\s+([\s\S]*?)\s+\*\*/g, '**$1**');
        // 处理被 span 包裹的情况
        out = out.replace(/\*\*(\s*<span\b[^>]*>)([\s\S]*?)(<\/span>)\s*\*\*/gi, function(_, open, inner, close){
          return `${open}<strong>${inner}</strong>${close}`;
        });
        return out;
      } catch(_) { return src; }
    }
    md = normalizeStrongSpans(md);
    // Markdown 渲染（兼容性兜底）
    try {
      if (window.marked && window.DOMPurify) {
        // 配置 marked，保证换行转段落
        if (window.marked.setOptions) {
          window.marked.setOptions({ breaks: true, gfm: true });
        }
        const html = window.marked.parse(md || '');
        contentEl.innerHTML = window.DOMPurify.sanitize(html);
        try {
          if (window.hljs) {
            contentEl.querySelectorAll('pre code').forEach((block) => {
              window.hljs.highlightElement(block);
            });
          }
        } catch(_) {}
        return;
      }
    } catch(_) {}
    // 兜底：按纯文本显示并保留换行
    contentEl.textContent = md || '';
    contentEl.style.whiteSpace = 'pre-line';
  }

  function sanitizeTitleToFilename(title){
    return String(title || '')
      .toLowerCase().trim()
      .replace(/[\s/_.,:：—-]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 60);
  }

  try {
    const b = await window.ApiService.getBlogDetail(slug);
    document.title = `${b.title} - MOMO TEST`;
    // 基础 SEO/OG 注入
    try {
      const head = document.head;
      const metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = (b.summary || '').slice(0, 160);
      head.appendChild(metaDesc);

      const ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.setAttribute('content', `${b.title} - MOMO TEST`);
      head.appendChild(ogTitle);

      const ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      ogDesc.setAttribute('content', (b.summary || '').slice(0, 160));
      head.appendChild(ogDesc);

      const ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      ogType.setAttribute('content', 'article');
      head.appendChild(ogType);

      const ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      const fallbackName = sanitizeTitleToFilename(b.title);
      const byTitle = `assets/blogs/${fallbackName}.png`;
      const imgUrl = (b.cover_image_url && (b.cover_image_url.startsWith('/') ? b.cover_image_url : `/${b.cover_image_url}`)) || `/${byTitle}`;
      ogImg.setAttribute('content', imgUrl);
      head.appendChild(ogImg);
    } catch(_) {}
    titleEl.textContent = b.title;
    if (breadcrumb) breadcrumb.textContent = b.title;

    const fallbackName = sanitizeTitleToFilename(b.title);
    const byTitle = `/assets/blogs/${fallbackName}.png`;
    const src0 = b.cover_image_url || byTitle;
    const src = src0.startsWith('/') ? src0 : `/${src0}`;
    try { coverEl.removeAttribute('loading'); } catch(_) {}
    // 先绑定事件，再设置 src，避免瞬时缓存命中错过 onload
    coverEl.addEventListener('load', function(){ coverEl.classList.remove('hidden'); });
    coverEl.onerror = function(){ coverEl.onerror = null; coverEl.classList.add('hidden'); };
    const finalSrc = `${src}?v=${Date.now()}`;
    coverEl.src = finalSrc;
    if (coverEl.complete && coverEl.naturalWidth > 0) {
      void coverEl.offsetHeight;
      coverEl.classList.remove('hidden');
    } else if (coverEl.decode) {
      coverEl.decode().then(function(){ coverEl.classList.remove('hidden'); }).catch(function(){});
    }

    renderMarkdown(b.content_md);
    try { if (window.Analytics) window.Analytics.logDetailRead(slug); } catch(_) {}

    // Recommended test card
    try {
      const testId = b.test_project_id;
      if (testId) {
        const sec = document.getElementById('test-card-sec');
        const imgEl = document.getElementById('test-card-img');
        const titleEl = document.getElementById('test-card-title');
        const peopleEl = document.getElementById('test-card-people');
        const btnEl = document.getElementById('test-card-btn');
        const map = {
          mbti: '/assets/images/mbti-career-personality-test.png',
          disc40: '/assets/images/disc-personality-test.png',
          observation: '/assets/images/observation-ability-test.png'
        };
        let project;
        try { project = await window.ApiService.getTestProject(testId); } catch(_) {}
        if (!project) {
          const list = await window.ApiService.getTestProjects();
          project = (list || []).find(p => p.id === testId);
        }
        if (project) {
          titleEl.textContent = project.nameEn || project.name || testId;
          // 格式化测试人数（与首页一致）
          try {
            const n = project.testedCount;
            const formatted = window.Utils ? window.Utils.formatNumber(n) : (n || '');
            if (formatted) {
              peopleEl.innerHTML = `<span class="font-semibold text-amber-600">${formatted}</span> people tested`;
            } else {
              peopleEl.textContent = '';
            }
          } catch(_) { peopleEl.textContent = ''; }
          const img0 = map[project.id] || project.image || '/assets/images/logo.png';
          imgEl.src = img0.startsWith('/') ? img0 : `/${img0}`;
          btnEl.onclick = function(){ location.href = `/test-detail.html/${encodeURIComponent(project.id)}`; };
          // 免费标签显示
          try {
            const pricingEl = document.getElementById('test-card-pricing');
            if (pricingEl && (project.pricingType === '免费' || project.pricingType === 'free')) {
              pricingEl.classList.remove('hidden');
            }
          } catch(_) {}
          sec.classList.remove('hidden');
        }
      }
    } catch(_) {}

    // 推荐
    try {
      const rec = await window.ApiService.getBlogRecommendations(slug);
      const recContainer = document.getElementById('rec-container');
      const recTpl = document.getElementById('rec-card-template');
      if (rec && rec.length && recContainer && recTpl) {
        rec.forEach(r => {
          const node = recTpl.content.cloneNode(true);
          const img = node.querySelector('img');
          const sk = node.querySelector('.skeleton');
          const h3 = node.querySelector('h3');
          h3.textContent = r.title;
          // 优先用数据库封面，否则按 slug 规则
          const fallbackBySlug = `/assets/blogs/${encodeURIComponent(r.slug)}.png`;
          const cover0 = (r.cover_image_url || '').trim();
          const coverAbs = cover0 ? (cover0.startsWith('/') ? cover0 : `/${cover0}`) : fallbackBySlug;
          const real = `${coverAbs}?v=${Date.now()}`;
          const pre = new Image();
          pre.onload = function(){
            img.src = real;
            sk.classList.add('hidden');
            img.classList.remove('hidden');
          };
          pre.onerror = function(){ sk.classList.add('hidden'); img.src = '/assets/images/logo.png'; img.classList.remove('hidden'); };
          pre.src = real;
          node.querySelector('article').onclick = function(){
            try { if (window.Analytics) window.Analytics.logRecClick(slug, r.slug); } catch(_) {}
            location.href = `/blog-detail.html/${encodeURIComponent(r.slug)}`;
          };
          recContainer.appendChild(node);
        });
      }
    } catch (e) { console.warn('recommendations failed', e); }
  } catch (e) {
    console.error('Failed to load blog detail', e);
    location.replace('blog.html');
  }
})();


