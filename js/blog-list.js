(function(){
  const container = document.getElementById('blog-container');
  const empty = document.getElementById('blog-empty');
  const retryBtn = document.getElementById('blog-retry');
  const tpl = document.getElementById('blog-card-template');
  if (!container || !tpl) return;

  let page = 1;
  const pageSize = 99; // 一次性加载足够多
  let loading = false;
  let ended = false;

  function sanitizeTitleToFilename(title){
    return String(title || '')
      .toLowerCase().trim()
      .replace(/[\s/_.,:：—-]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 60);
  }

  async function load(){
    if (loading || ended) return;
    loading = true;
    try {
      const items = await window.ApiService.getBlogs({ page, pageSize });
      if (!items || !items.length) {
        if (page === 1) empty.classList.remove('hidden');
        ended = true;
        return;
      }
      empty.classList.add('hidden');
      items.forEach(b => {
        const node = tpl.content.cloneNode(true);
        const img = node.querySelector('img');
        const sk = node.querySelector('.skeleton');
        const h3 = node.querySelector('h3');
        const p = node.querySelector('p');
        const card = node.querySelector('article');
        h3.textContent = b.title;
        p.textContent = b.summary || '';

        // 优先使用数据库提供的封面 URL（按你的新规则）
        const dbCover = (b.cover_image_url || '').trim();
        const normalizedDbCover = dbCover ? (dbCover.startsWith('/') ? dbCover : `/${dbCover}`) : '';
        const bySlug = `/assets/blogs/${encodeURIComponent(b.slug)}.png`;
        // 取消懒加载，确保首屏立即加载
        try { img.removeAttribute('loading'); } catch(_) {}
        // 预加载再挂载，彻底规避缓存时序导致的 load 丢失
        const realSrc = `${(normalizedDbCover || bySlug)}?v=${Date.now()}`;
        const pre = new Image();
        pre.onload = function(){
          img.src = realSrc;
          sk.classList.add('hidden');
          img.classList.remove('hidden');
        };
        pre.onerror = function(){
          sk.classList.add('hidden');
          console.error('Blog image preload failed:', normalizedDbCover || bySlug);
        };
        pre.src = realSrc;

        card.addEventListener('click', function(){
          location.href = `blog-detail.html/${encodeURIComponent(b.slug)}`;
        });
        card.addEventListener('keydown', function(e){
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            location.href = `blog-detail.html/${encodeURIComponent(b.slug)}`;
          }
        });
        container.appendChild(node);
      });
      try { if (window.Analytics) window.Analytics.logListExpose(items); } catch(_) {}
      page += 1;
    } catch (e) {
      console.error('Failed to load blogs', e);
      if (page === 1) empty.classList.remove('hidden');
    } finally {
      loading = false;
    }
  }

  load();
  retryBtn && (retryBtn.onclick = function(){ ended = false; page = 1; container.innerHTML = ''; load(); });
})();


