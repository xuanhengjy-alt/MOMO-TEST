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

        const fallbackName = sanitizeTitleToFilename(b.title);
        const byTitle = `assets/blogs/${fallbackName}.png`;
        // 取消懒加载，确保首屏立即加载
        try { img.removeAttribute('loading'); } catch(_) {}
        // 先注册事件，再设置 src，避免瞬时加载错过 load 事件
        img.addEventListener('load', function(){
          sk.classList.add('hidden');
          img.classList.remove('hidden');
        });
        img.addEventListener('error', function(){ sk.classList.add('hidden'); console.error('Blog image load failed:', byTitle); });
        img.src = byTitle;
        // 若已缓存完成，主动触发展示
        if (img.complete && img.naturalWidth > 0) {
          // 强制一次重绘，避免某些情况下不渲染
          void img.offsetHeight;
          sk.classList.add('hidden');
          img.classList.remove('hidden');
        } else if (img.decode) {
          img.decode().then(function(){
            sk.classList.add('hidden');
            img.classList.remove('hidden');
          }).catch(function(){});
        }

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


