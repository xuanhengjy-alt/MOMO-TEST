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
  // 简化URL解析逻辑
  let slug = null;
  
  // 从URL路径中提取slug
  const pathParts = location.pathname.split('/').filter(Boolean);
  console.log('URL路径:', location.pathname);
  console.log('路径部分:', pathParts);
  
  // 查找blog-detail.html后面的slug
  const blogDetailIndex = pathParts.indexOf('blog-detail.html');
  if (blogDetailIndex !== -1 && pathParts[blogDetailIndex + 1]) {
    slug = decodeURIComponent(pathParts[blogDetailIndex + 1]);
    console.log('✅ 提取到slug:', slug);
  } else {
    // 从查询参数获取
    const params = new URLSearchParams(location.search);
    slug = params.get('slug');
    console.log('从查询参数获取slug:', slug);
  }
  
  if (!slug) {
    console.log('❌ 没有找到slug，重定向到blog.html');
    location.replace('/blog.html');
    return;
  }

  const titleEl = document.getElementById('blog-title');
  const coverEl = document.getElementById('blog-cover');
  const contentEl = document.getElementById('blog-content');
  const breadcrumb = document.getElementById('breadcrumb-title');
  
  // 不显示加载状态，直接显示空内容
  if (titleEl) titleEl.textContent = '';
  if (contentEl) contentEl.innerHTML = '';

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
    console.log('🔍 获取blog详情，slug:', slug);
    
    // 并行加载blog详情和推荐文章，提高加载速度
    const [blogResponse, recommendationsResponse] = await Promise.allSettled([
      fetch(`/api/blogs/${encodeURIComponent(slug)}`, { 
        signal: AbortSignal.timeout(5000) 
      }),
      fetch(`/api/blogs/${encodeURIComponent(slug)}/recommend`, { 
        signal: AbortSignal.timeout(3000) 
      })
    ]);
    
    console.log('Blog API响应状态:', blogResponse.status === 'fulfilled' ? blogResponse.value.status : 'failed');
    console.log('Recommendations API响应状态:', recommendationsResponse.status === 'fulfilled' ? recommendationsResponse.value.status : 'failed');
    
    // 处理blog详情
    if (blogResponse.status !== 'fulfilled' || !blogResponse.value.ok) {
      throw new Error(`HTTP error! status: ${blogResponse.value?.status || 'network error'}`);
    }
    
    const response = await blogResponse.value.json();
    console.log('✅ 成功获取blog数据:', response);
    
    // 检查API响应格式
    if (!response.success || !response.blog) {
      throw new Error('Invalid API response format');
    }
    
    const b = response.blog;
    document.title = `${b.title} - MOMO TEST`;
    // 基础 SEO/OG 注入
    try {
      const head = document.head;
      const metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = (b.excerpt || '').slice(0, 160);
      head.appendChild(metaDesc);

      const ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.setAttribute('content', `${b.title} - MOMO TEST`);
      head.appendChild(ogTitle);

      const ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      ogDesc.setAttribute('content', (b.excerpt || '').slice(0, 160));
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

    console.log('Rendering content:', b.content ? 'has content' : 'no content');
    renderMarkdown(b.content);
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

    // 推荐（已经在上面并行加载了）
    try {
      console.log('🔍 处理推荐文章...');
      let rec = [];
      
      if (recommendationsResponse.status === 'fulfilled' && recommendationsResponse.value.ok) {
        const recResponse = await recommendationsResponse.value.json();
        console.log('✅ 推荐文章数据:', recResponse);
        
        // 检查API响应格式
        if (recResponse.success && recResponse.recommendations) {
          rec = recResponse.recommendations;
        } else {
          console.log('⚠️ 推荐文章API响应格式错误');
          rec = [];
        }
      } else {
        console.log('⚠️ 推荐文章API调用失败');
        rec = [];
      }
      
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
    console.error('❌ 加载blog详情失败:', e);
    
    // 显示简单错误信息
    const titleEl = document.getElementById('blog-title');
    const contentEl = document.getElementById('blog-content');
    
    if (titleEl) titleEl.textContent = 'Blog Not Found';
    if (contentEl) contentEl.innerHTML = `
      <p class="text-gray-500">Sorry, the blog post could not be found.</p>
      <p class="text-sm text-gray-400 mt-2">Please check the URL or <a href="/blog.html" class="text-blue-600 hover:underline">browse our blog list</a>.</p>
    `;
    
    // 3秒后重定向
    setTimeout(() => {
      location.replace('/blog.html');
    }, 3000);
  }
})();


