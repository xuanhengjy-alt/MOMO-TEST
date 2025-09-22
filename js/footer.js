// Footer Component
class Footer {
  constructor() {
    this.websiteUrl = 'https://momotest.aithink.app';
    this.texts = {
      'zh-CN': {
        description: '专业的心理测试平台，提供MBTI、DISC、九型人格等多种科学心理测试，帮助您更好地了解自己。',
        quickNav: '快速导航',
        testHome: '测试首页',
        blog: '博客文章',
        mbtiTest: 'MBTI测试',
        discTest: 'DISC测试',
        enneagramTest: '九型人格测试',
        copyright: '© 2024 MOMO TEST. All rights reserved. | 专业的心理测试平台'
      },
      'en': {
        description: 'Professional psychological testing platform, offering MBTI, DISC, Enneagram and other scientific psychological tests to help you better understand yourself.',
        quickNav: 'Quick Navigation',
        testHome: 'Test Home',
        blog: 'Blog',
        mbtiTest: 'MBTI Test',
        discTest: 'DISC Test',
        enneagramTest: 'Enneagram Test',
        copyright: '© 2024 MOMO TEST. All rights reserved. | Professional Psychological Testing Platform'
      }
    };
    // Default to English
    this.currentLang = 'en';
  }

  // Get current language
  getCurrentLanguage() {
    if (typeof window !== 'undefined' && window.I18N && window.I18N.getLang) {
      return window.I18N.getLang();
    }
    if (typeof document !== 'undefined') {
      return document.documentElement.lang || 'en';
    }
    return 'en';
  }

  // Get text
  getText(key) {
    return this.texts[this.currentLang]?.[key] || this.texts['en'][key] || key;
  }

  // Create footer HTML
  createFooter() {
    // Detect if we're on a page that uses absolute paths
    // Check if the current page uses absolute paths by looking at existing img tags
    const existingImg = document.querySelector('img[src^="/assets/"]');
    const isAbsolutePath = existingImg !== null ||
                          window.location.pathname.includes('/blog-detail.html') ||
                          window.location.pathname.includes('/test-detail.html');
    const logoPath = isAbsolutePath ? '/assets/images/logo.png' : 'assets/images/logo.png';
    
    // 根据当前页面确定链接路径
    const linkPrefix = isAbsolutePath ? '/' : '';
    
    return `
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <img src="${logoPath}" alt="MOMO TEST" />
              <h3>MOMO TEST</h3>
            </div>
            <p class="footer-description">
              ${this.getText('description')}
            </p>
            <a href="${this.websiteUrl}" target="_blank" rel="noopener noreferrer" class="footer-website">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              ${this.websiteUrl}
            </a>
          </div>
          <div class="footer-nav">
            <h4>${this.getText('quickNav')}</h4>
            <ul>
              <li><a href="${linkPrefix}index.html">${this.getText('testHome')}</a></li>
              <li><a href="${linkPrefix}blog.html">${this.getText('blog')}</a></li>
              <li><a href="${linkPrefix}test-detail.html/mbti">${this.getText('mbtiTest')}</a></li>
              <li><a href="${linkPrefix}test-detail.html/disc40">${this.getText('discTest')}</a></li>
              <li><a href="${linkPrefix}test-detail.html/enneagram-en">${this.getText('enneagramTest')}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>${this.getText('copyright')}</p>
        </div>
      </footer>
    `;
  }

  // Render footer to page
  render(container = 'body') {
    if (typeof document === 'undefined') return;
    
    const targetElement = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (targetElement) {
      // Check if footer already exists, remove it first
      const existingFooter = targetElement.querySelector('.footer');
      if (existingFooter) {
        existingFooter.remove();
      }
      
      targetElement.insertAdjacentHTML('beforeend', this.createFooter());
    }
  }

  // Update footer language
  updateLanguage() {
    this.currentLang = this.getCurrentLanguage();
    this.render();
  }

  // Initialize footer
  init() {
    if (typeof document === 'undefined') return;
    
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }

    // Add extra spacing for test pages
    this.addTestPageSpacing();

    // Listen for language switch events
    if (typeof window !== 'undefined' && window.I18N) {
      const originalSetLang = window.I18N.setLang;
      if (originalSetLang) {
        window.I18N.setLang = (lang) => {
          originalSetLang.call(window.I18N, lang);
          this.updateLanguage();
        };
      }
    }
  }

  // Add extra spacing for test pages
  addTestPageSpacing() {
    if (typeof document === 'undefined') return;
    
    // Check if we're on a test detail page
    if (window.location.pathname.includes('test-detail.html')) {
      // Hide footer when test start view is active
      this.hideFooterInTestView();
      
      // Listen for view changes to show/hide footer accordingly
      this.observeViewChanges();
    }
  }

  // Hide footer in test start view
  hideFooterInTestView() {
    const testStartView = document.getElementById('view-start');
    const footer = document.querySelector('.footer');
    
    if (testStartView && footer) {
      // Check if test start view is currently visible
      if (!testStartView.classList.contains('hidden')) {
        footer.style.display = 'none';
      }
    }
  }

  // Observe view changes to show/hide footer
  observeViewChanges() {
    // Create a mutation observer to watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          const footer = document.querySelector('.footer');
          
          if (target.id === 'view-start' && footer) {
            if (target.classList.contains('hidden')) {
              // Test start view is hidden, show footer
              footer.style.display = 'block';
            } else {
              // Test start view is visible, hide footer
              footer.style.display = 'none';
            }
          }
        }
      });
    });

    // Start observing the view-start element
    const testStartView = document.getElementById('view-start');
    if (testStartView) {
      observer.observe(testStartView, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  }
}

// Auto-initialize footer
(function() {
  function initFooter() {
    const footer = new Footer();
    footer.init();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
  } else {
    // DOM is already loaded, initialize immediately
    setTimeout(initFooter, 100); // Small delay to ensure other scripts have loaded
  }
})();
