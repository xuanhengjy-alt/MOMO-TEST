(async function(){
  async function loadScript(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src; s.async=true; s.onload=()=>resolve(true); s.onerror=()=>reject(new Error('load fail '+src));
      document.head.appendChild(s);
    });
  }
  async function ensureLibs(){
    const markedCdn = [
      'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
      'https://unpkg.com/marked/marked.min.js',
      'https://cdn.bootcdn.net/ajax/libs/marked/12.0.2/marked.min.js'
    ];
    const purifyCdn = [
      'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js',
      'https://unpkg.com/dompurify@3.0.6/dist/purify.min.js',
      'https://cdn.bootcdn.net/ajax/libs/dompurify/3.0.6/purify.min.js'
    ];
    if(!window.marked){
      for (const u of markedCdn){ try{ await loadScript(u); if(window.marked) break; }catch(e){} }
    }
    if(!window.DOMPurify){
      for (const u of purifyCdn){ try{ await loadScript(u); if(window.DOMPurify) break; }catch(e){} }
    }
  }
  await ensureLibs();
  const pathParts = location.pathname.split('/').filter(Boolean);
  console.log('🔍 URL解析开始:');
  console.log('Current URL:', location.href);
  console.log('Path parts:', pathParts);
  console.log('Search params:', location.search);
  console.log('User Agent:', navigator.userAgent);
  console.log('Is Vercel:', window.location.hostname.includes('vercel'));
  console.log('Environment:', window.location.hostname);
  
  let slug = null;
  if (pathParts.length >= 2 && pathParts[pathParts.length-2] === 'blog-detail.html') {
    slug = decodeURIComponent(pathParts[pathParts.length-1] || '');
    console.log('✅ 从URL路径提取slug:', slug);
  }
  if (!slug) {
    const params = new URLSearchParams(location.search);
    slug = params.get('slug');
    console.log('🔍 从查询参数提取slug:', slug);
  }
  console.log('📋 最终提取的slug:', slug);
  
  if (!slug) { 
    console.log('❌ 没有找到slug，重定向到blog.html');
    console.log('当前URL:', location.href);
    console.log('路径部分:', pathParts);
    
    // 显示友好的错误信息
    const titleEl = document.getElementById('blog-title');
    const contentEl = document.getElementById('blog-content');
    if (titleEl) titleEl.textContent = 'Blog Not Found';
    if (contentEl) contentEl.innerHTML = '<p class="text-gray-500">Sorry, the blog post you are looking for could not be found.</p><p class="text-sm text-gray-400 mt-2">Please check the URL format: /blog-detail.html/[blog-slug]</p>';
    
    // 延迟重定向，让用户看到错误信息
    setTimeout(() => {
      location.replace('/blog.html');
    }, 3000);
    return; 
  }
  
  // 检查slug是否有效（不应该是常见的文件名）
  const invalidSlugs = ['blog.html', 'index.html', 'test-detail.html', 'blog-detail.html'];
  if (invalidSlugs.includes(slug)) {
    console.log('❌ 检测到无效的slug:', slug);
    console.log('当前URL:', location.href);
    
    // 显示友好的错误信息
    const titleEl = document.getElementById('blog-title');
    const contentEl = document.getElementById('blog-content');
    if (titleEl) titleEl.textContent = 'Invalid Blog URL';
    if (contentEl) contentEl.innerHTML = '<p class="text-gray-500">The blog URL format is incorrect.</p><p class="text-sm text-gray-400 mt-2">Please use: /blog-detail.html/[blog-slug]</p>';
    
    // 延迟重定向，让用户看到错误信息
    setTimeout(() => {
      location.replace('/blog.html');
    }, 3000);
    return;
  }

  const titleEl = document.getElementById('blog-title');
  const coverEl = document.getElementById('blog-cover');
  const contentEl = document.getElementById('blog-content');
  const breadcrumb = document.getElementById('breadcrumb-title');

  function renderMarkdown(md){
    console.log('renderMarkdown called with:', md ? 'content' : 'no content');
    // 规范化粗体：
    // 1) ** <text> ** 或 **  text  ** → **text**（去掉两端空格，避免 CommonMark 解析失败）
    // 2) **<span>text</span>** → <span><strong>text</strong></span>
    function normalizeStrongSpans(src){
      if (!src) return '';
      try {
        let out = src;
        // 确保 ** 两侧有空格，避免紧贴表情/符号导致解析失败
        out = out.replace(/([^\s*])\*\*/g, '$1 **');
        out = out.replace(/\*\*([^\s*])/g, '** $1');
        // 修正 ** 前后留白导致的不解析（仅修正粗体，不改动分段）
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
        // 配置 marked，开启 GFM 表格、换行
        if (window.marked.setOptions) {
          window.marked.setOptions({ breaks: true, gfm: true });
        }
        // 兼容旧版 marked 的表格支持
        if (window.marked.use) {
          try { window.marked.use({ gfm: true }); } catch(_) {}
        }
        const html = window.marked.parse(md || '');
        contentEl.innerHTML = window.DOMPurify.sanitize(html, { ADD_TAGS: ['table','thead','tbody','tr','th','td'] });
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
    console.log('Loading blog detail for slug:', slug);
    console.log('API Service available:', !!window.ApiService);
    console.log('getBlogDetail method available:', !!window.ApiService.getBlogDetail);
    
    // 测试API连接
    console.log('🔍 测试API连接...');
    try {
      const testResponse = await fetch('/api/blogs');
      console.log('API连接测试结果:', testResponse.status, testResponse.ok);
      if (!testResponse.ok) {
        console.error('API连接失败:', testResponse.status, testResponse.statusText);
      }
    } catch (apiError) {
      console.error('API连接错误:', apiError);
    }
    
    const b = await window.ApiService.getBlogDetail(slug);
    console.log('Blog data received:', b);
    console.log('Blog title:', b.title);
    console.log('Blog content_md length:', b.content_md ? b.content_md.length : 0);
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
      const byTitle = `assets/blogs/${fallbackName}.jpg`;
      const imgUrl = (b.cover_image_url && (b.cover_image_url.startsWith('/') ? b.cover_image_url : `/${b.cover_image_url}`)) || `/${byTitle}`;
      ogImg.setAttribute('content', imgUrl);
      head.appendChild(ogImg);
    } catch(_) {}
    console.log('Setting title:', b.title);
    titleEl.textContent = b.title;
    if (breadcrumb) breadcrumb.textContent = b.title;

    const fallbackName = sanitizeTitleToFilename(b.title);
    const byTitle = `/assets/blogs/${fallbackName}.jpg`;
    const src0 = b.cover_image_url || byTitle;
    const src = src0.startsWith('/') ? src0 : `/${src0}`;
    try { coverEl.removeAttribute('loading'); } catch(_) {}
    // 先绑定事件，再设置 src，避免瞬时缓存命中错过 onload
    coverEl.addEventListener('load', function(){ coverEl.classList.remove('hidden'); });
    coverEl.onerror = function(){ coverEl.onerror = null; coverEl.classList.add('hidden'); };
    const ver = b.updated_at ? new Date(b.updated_at).getTime() : '';
    const finalSrc = ver ? `${src}?v=${ver}` : src;
    coverEl.src = finalSrc;
    if (coverEl.complete && coverEl.naturalWidth > 0) {
      void coverEl.offsetHeight;
      coverEl.classList.remove('hidden');
    } else if (coverEl.decode) {
      coverEl.decode().then(function(){ coverEl.classList.remove('hidden'); }).catch(function(){});
    }

    console.log('Rendering content:', b.content_md ? 'has content' : 'no content');
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
          mbti: '/assets/images/mbti-career-personality-test.jpg',
          disc40: '/assets/images/disc-personality-test.jpg',
          observation: '/assets/images/observation-ability-test.jpg'
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
      console.log('🔍 开始加载推荐文章...');
      const rec = await window.ApiService.getBlogRecommendations(slug);
      console.log('✅ 推荐文章数据:', rec);
      
      const recContainer = document.getElementById('rec-container');
      const recTpl = document.getElementById('rec-card-template');
      
      if (rec && rec.length && recContainer && recTpl) {
        console.log(`📝 渲染 ${rec.length} 篇推荐文章`);
        rec.forEach((r, index) => {
          console.log(`📝 渲染推荐文章 ${index + 1}:`, r.title);
          const node = recTpl.content.cloneNode(true);
          const img = node.querySelector('img');
          const sk = node.querySelector('.skeleton');
          const h3 = node.querySelector('h3');
          h3.textContent = r.title;
          // 优先用数据库封面，否则按 slug 规则
          const fallbackBySlug = `/assets/blogs/${encodeURIComponent(r.slug)}.jpg`;
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
        console.log('✅ 推荐文章渲染完成');
      } else {
        console.log('⚠️ 推荐文章数据为空或容器不存在');
        console.log('rec:', rec);
        console.log('recContainer:', recContainer);
        console.log('recTpl:', recTpl);
      }
    } catch (e) { 
      console.error('❌ 推荐文章加载失败:', e);
      console.error('Error details:', {
        message: e.message,
        status: e.status,
        url: e.url || 'unknown'
      });
    }
  } catch (e) {
    console.error('Failed to load blog detail', e);
    console.error('Error details:', {
      message: e.message,
      status: e.status,
      url: e.url || 'unknown'
    });
    
    // 显示错误信息给用户
    const titleEl = document.getElementById('blog-title');
    const contentEl = document.getElementById('blog-content');
    if (titleEl) titleEl.textContent = 'Blog Not Found';
    if (contentEl) contentEl.innerHTML = '<p class="text-gray-500">Sorry, the blog post you are looking for could not be found.</p>';
    
    // 延迟重定向，让用户看到错误信息
    setTimeout(() => {
      location.replace('blog.html');
    }, 3000);
  }
})();


