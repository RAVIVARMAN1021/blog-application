/**
 * ============================================================================
 * BLOGVERSE - MAIN CORE MODULE (main.js)
 * Global application utilities:
 * - Dark/Light Theme Switcher
 * - Mobile Navigation Menu Toggle
 * - Dynamic Navbar Auth State & Dropdowns
 * - Toast Notification System
 * - Home Page: Fetches published blogs from REST API, live search & categories
 * - Full Article Reader Modal with Likes & Comments connected to API
 * ============================================================================
 */

// Global State for Home Page Filtering & Data Cache
let homeActiveCategory = 'All';
let homeSearchQuery = '';
let cachedHomeBlogs = [];

/**
 * ============================================================================
 * 1. THEME SWITCHER (Dark / Light Mode)
 * ============================================================================
 */
function initTheme() {
  const savedTheme = localStorage.getItem('blogverse_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(currentTheme);

  // Setup toggle button listeners
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('blogverse_theme', newTheme);
      if (typeof showToast === 'function') {
        showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`, 'info', 1800);
      }
    });
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  updateThemeIcons(theme);
}

function updateThemeIcons(theme) {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const isDark = theme === 'dark';

  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  toggleBtns.forEach(btn => {
    btn.innerHTML = isDark ? sunIcon : moonIcon;
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  });
}

/**
 * ============================================================================
 * 2. MOBILE NAVIGATION DRAWER
 * ============================================================================
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!toggleBtn || !mobileNav) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNav.classList.toggle('open');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !toggleBtn.contains(e.target)) {
      mobileNav.classList.remove('open');
    }
  });

  // Close on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileNav.classList.remove('open');
    }
  });
}

/**
 * ============================================================================
 * 3. DYNAMIC NAVBAR AUTHENTICATION STATE
 * ============================================================================
 */
function updateNavbarAuthState() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const navActionsContainer = document.getElementById('navbar-auth-actions');
  const mobileAuthContainer = document.getElementById('mobile-auth-actions');

  if (!navActionsContainer) return;

  if (user) {
    // Authenticated state
    navActionsContainer.innerHTML = `
      <a href="create-blog.html" class="btn btn-sm btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Write Post
      </a>
      
      <div class="nav-user-dropdown" id="nav-user-dropdown">
        <button class="nav-user-btn" id="nav-user-toggle" aria-expanded="false" aria-haspopup="true">
          <div class="nav-user-avatar">${escapeHtml(user.avatar || (user.name ? user.name[0].toUpperCase() : 'U'))}</div>
          <span class="nav-user-name">${escapeHtml(user.name.split(' ')[0])}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>

        <div class="dropdown-menu" id="nav-user-menu">
          <div class="dropdown-header">
            <strong>${escapeHtml(user.name)}</strong>
            <div class="dropdown-user-email">${escapeHtml(user.email)}</div>
          </div>
          <a href="dashboard.html" class="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a href="create-blog.html" class="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Write Post
          </a>
          <button class="dropdown-item danger" id="nav-logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </div>
    `;

    // Dropdown toggle
    const toggleBtn = document.getElementById('nav-user-toggle');
    const menu = document.getElementById('nav-user-menu');
    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) {
          menu.classList.remove('show');
        }
      });
    }

    // Sign out button
    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (typeof logoutUser === 'function') logoutUser();
      });
    }

    // Mobile auth sync
    if (mobileAuthContainer) {
      mobileAuthContainer.innerHTML = `
        <div style="padding: 0.5rem 0; border-top: 1px solid var(--border-color); margin-top: 0.5rem;">
          <div style="font-weight: 700; margin-bottom: 0.25rem;">Signed in as ${escapeHtml(user.name)}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${escapeHtml(user.email)}</div>
          <div style="display: flex; gap: 0.5rem; flex-direction: column;">
            <a href="dashboard.html" class="btn btn-secondary btn-full">Dashboard</a>
            <a href="create-blog.html" class="btn btn-primary btn-full">Create Blog</a>
            <button id="mobile-logout-btn" class="btn btn-danger-outline btn-full">Sign Out</button>
          </div>
        </div>
      `;
      const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
      if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
          if (typeof logoutUser === 'function') logoutUser();
        });
      }
    }
  } else {
    // Guest state
    navActionsContainer.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-ghost">Sign In</a>
      <a href="register.html" class="btn btn-sm btn-primary">Get Started</a>
    `;

    if (mobileAuthContainer) {
      mobileAuthContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <a href="login.html" class="btn btn-secondary btn-full">Sign In</a>
          <a href="register.html" class="btn btn-primary btn-full">Get Started</a>
        </div>
      `;
    }
  }
}

/**
 * ============================================================================
 * 4. TOAST NOTIFICATION COMPONENT
 * ============================================================================
 */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-message">${escapeHtml(message)}</div>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
    }, 250);
  };

  closeBtn.addEventListener('click', removeToast);
  setTimeout(removeToast, duration);
}

/**
 * ============================================================================
 * 5. HOME PAGE LOGIC: POSTS, SEARCH, AND CATEGORIES (Connected to REST API)
 * ============================================================================
 */
async function initHomePage() {
  const postsGrid = document.getElementById('home-posts-grid');
  if (!postsGrid) return; // Not on home page

  // Show subtle loading state
  postsGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem 0; color: var(--text-muted);">
      <svg class="spin" style="margin: 0 auto 1rem; width: 32px; height: 32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      <p>Loading latest articles from server...</p>
    </div>
  `;

  // Fetch blogs from backend API
  cachedHomeBlogs = await getBlogs();

  // Render Category Filter Chips
  renderCategoryFilterPills();

  // Setup Live Search Input
  setupSearchInput();

  // Render Featured Post
  renderFeaturedPost();

  // Render Posts Grid
  renderHomePosts();

  // Setup Newsletter subscription
  setupNewsletterForm();
}

/**
 * Render category filter pills with post counts
 */
function renderCategoryFilterPills() {
  const filterContainer = document.getElementById('category-filter-bar');
  if (!filterContainer) return;

  const published = cachedHomeBlogs;

  // Collect unique categories
  const categories = ['All', ...new Set(published.map(b => b.category))];

  filterContainer.innerHTML = categories.map(cat => {
    const count = cat === 'All' ? published.length : published.filter(b => b.category === cat).length;
    const isActive = cat === homeActiveCategory ? 'active' : '';

    return `
      <button class="filter-chip ${isActive}" data-category="${escapeHtml(cat)}">
        <span>${escapeHtml(cat)}</span>
        <span class="chip-count">${count}</span>
      </button>
    `;
  }).join('');

  // Attach click listener
  filterContainer.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      filterContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      homeActiveCategory = btn.getAttribute('data-category');
      renderHomePosts();
    });
  });
}

/**
 * Setup live search input & clear button
 */
function setupSearchInput() {
  const searchInput = document.getElementById('home-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    homeSearchQuery = e.target.value;
    if (clearBtn) {
      if (homeSearchQuery.length > 0) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
    }
    renderHomePosts();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      homeSearchQuery = '';
      clearBtn.classList.remove('visible');
      renderHomePosts();
      searchInput.focus();
    });
  }
}

/**
 * Render Featured Post in the Hero/Featured section
 */
function renderFeaturedPost() {
  const container = document.getElementById('featured-post-container');
  if (!container) return;

  const published = cachedHomeBlogs;
  const featured = published.find(b => b.featured) || published[0];

  if (!featured) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  container.innerHTML = `
    <div class="featured-card" data-id="${featured.id}">
      <div class="featured-img-wrap">
        <img src="${featured.image}" alt="${escapeHtml(featured.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'" />
        <span class="featured-badge">⭐ Featured Story</span>
      </div>
      <div class="featured-body">
        <div class="featured-meta">
          <span class="badge badge-primary">${escapeHtml(featured.category)}</span>
          <span>•</span>
          <span>${featured.date}</span>
          <span>•</span>
          <span>${escapeHtml(featured.readTime || '5 min read')}</span>
        </div>
        <h3 class="featured-title">${escapeHtml(featured.title)}</h3>
        <p class="featured-excerpt">${escapeHtml(featured.excerpt)}</p>
        <div class="author-block">
          <div class="author-avatar">${escapeHtml(featured.authorAvatar || 'AU')}</div>
          <div class="author-info">
            <h4>${escapeHtml(featured.author)}</h4>
            <p>${escapeHtml(featured.authorEmail || 'Author')}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Click card to open full article reader modal
  const card = container.querySelector('.featured-card');
  if (card) {
    card.addEventListener('click', () => {
      openReaderModal(featured);
    });
  }
}

/**
 * Filter and render latest posts grid on Home Page
 */
function renderHomePosts() {
  const postsGrid = document.getElementById('home-posts-grid');
  const emptyState = document.getElementById('home-empty-state');
  if (!postsGrid) return;

  let published = cachedHomeBlogs;

  // Apply Category Filter
  if (homeActiveCategory !== 'All') {
    published = published.filter(b => b.category && b.category.toLowerCase() === homeActiveCategory.toLowerCase());
  }

  // Apply Search Filter
  if (homeSearchQuery.trim()) {
    const q = homeSearchQuery.toLowerCase();
    published = published.filter(b =>
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q))
    );
  }

  if (published.length === 0) {
    postsGrid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  postsGrid.innerHTML = published.map(post => `
    <article class="blog-card" data-id="${post.id}">
      <div class="blog-card-media">
        <img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'" />
        <span class="blog-card-category">${escapeHtml(post.category)}</span>
      </div>
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <span>${post.date}</span>
          <span class="meta-dot"></span>
          <span>${escapeHtml(post.readTime || '3 min read')}</span>
        </div>
        <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
        <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="blog-card-footer">
          <div class="card-author">
            <div class="card-author-avatar">${escapeHtml(post.authorAvatar || 'AU')}</div>
            <span class="card-author-name">${escapeHtml(post.author)}</span>
          </div>
          <span class="read-more-link">
            Read Story
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </span>
        </div>
      </div>
    </article>
  `).join('');

  // Attach click listeners to cards
  postsGrid.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('click', async () => {
      const id = card.getAttribute('data-id');
      const post = cachedHomeBlogs.find(p => p.id === id) || (await getBlogById(id));
      if (post) {
        openReaderModal(post);
      }
    });
  });
}

/**
 * Newsletter Subscribe Handler
 */
function setupNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
      showToast('Thank you for subscribing to Blogverse weekly digest! 🎉', 'success');
      emailInput.value = '';
    }
  });
}

/**
 * ============================================================================
 * 6. FULL POST READER MODAL
 * ============================================================================
 */
function openReaderModal(post) {
  let modal = document.getElementById('reader-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reader-modal-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const likedKey = `liked_${post.id}`;
  const isLiked = localStorage.getItem(likedKey) === 'true';

  modal.innerHTML = `
    <div class="reader-modal-card" role="dialog" aria-modal="true">
      <button class="modal-close-btn" id="reader-close-btn" aria-label="Close article">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <img src="${post.image}" alt="${escapeHtml(post.title)}" class="reader-hero-img" onerror="this.style.display='none'" />

      <div class="reader-content-wrap">
        <div class="reader-meta-bar">
          <span class="badge badge-primary">${escapeHtml(post.category)}</span>
          <span>•</span>
          <span>${post.date}</span>
          <span>•</span>
          <span>${escapeHtml(post.readTime || '4 min read')}</span>
          <span>•</span>
          <span>${(post.views || 0) + 1} views</span>
        </div>

        <h1 class="reader-title">${escapeHtml(post.title)}</h1>

        <div class="reader-author-row">
          <div class="author-block">
            <div class="author-avatar">${escapeHtml(post.authorAvatar || 'AU')}</div>
            <div class="author-info">
              <h4>${escapeHtml(post.author)}</h4>
              <p>${escapeHtml(post.authorEmail || 'Contributing Writer')}</p>
            </div>
          </div>

          <button class="like-btn ${isLiked ? 'liked' : ''}" id="modal-like-btn" data-id="${post.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span id="like-count-display">${post.likes || 0}</span> Likes
          </button>
        </div>

        <div class="reader-body">
          ${post.content}
        </div>

        <!-- Comments Section -->
        <div class="reader-engagement">
          <div style="width: 100%;">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Comments</h3>
            <div id="comments-list" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;"></div>

            <div style="display: flex; gap: 0.75rem;">
              <input type="text" id="comment-input" class="form-control" placeholder="Write a thoughtful comment..." />
              <button class="btn btn-primary" id="add-comment-btn">Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Setup comments
  setupModalComments(post.id);

  // Setup like button via backend API
  const likeBtn = modal.querySelector('#modal-like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      const currentlyLiked = likeBtn.classList.contains('liked');
      if (typeof toggleBlogLike === 'function') {
        const newLikes = await toggleBlogLike(post.id, currentlyLiked);
        const countDisplay = modal.querySelector('#like-count-display');
        if (countDisplay) countDisplay.textContent = newLikes;
        likeBtn.classList.toggle('liked');
        const isNowLiked = likeBtn.classList.contains('liked');
        localStorage.setItem(likedKey, isNowLiked ? 'true' : 'false');
        const svg = likeBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isNowLiked ? 'currentColor' : 'none');
      }
    });
  }

  // Close modal handlers
  const closeBtn = modal.querySelector('#reader-close-btn');
  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeydown);
    }
  };
  window.addEventListener('keydown', onKeydown);
}

/**
 * Comments component (stored in client storage per post)
 * @param {string} postId 
 */
function setupModalComments(postId) {
  const commentsKey = `comments_${postId}`;
  const listEl = document.getElementById('comments-list');
  const inputEl = document.getElementById('comment-input');
  const postBtn = document.getElementById('add-comment-btn');

  function getComments() {
    try {
      const data = localStorage.getItem(commentsKey);
      return data ? JSON.parse(data) : [
        { name: 'Sarah Jenkins', text: 'Terrific insights! Really appreciated the breakdown of modern web APIs.', time: '2 hours ago' }
      ];
    } catch (e) {
      return [];
    }
  }

  function saveComments(comments) {
    localStorage.setItem(commentsKey, JSON.stringify(comments));
  }

  function renderComments() {
    const comments = getComments();
    if (!listEl) return;

    if (comments.length === 0) {
      listEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Be the first to leave a comment on this article.</p>';
      return;
    }

    listEl.innerHTML = comments.map(c => `
      <div style="background-color: var(--bg-subtle); padding: 0.85rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
          <strong style="font-size: 0.88rem;">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(c.time || 'Just now')}</span>
        </div>
        <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.45;">${escapeHtml(c.text)}</p>
      </div>
    `).join('');
  }

  renderComments();

  if (postBtn && inputEl) {
    postBtn.addEventListener('click', () => {
      const text = inputEl.value.trim();
      if (!text) return;

      const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      const userName = user ? user.name : 'Guest Reader';

      const comments = getComments();
      comments.push({
        name: userName,
        text: text,
        time: 'Just now'
      });
      saveComments(comments);
      inputEl.value = '';
      renderComments();
      showToast('Comment posted!', 'success', 2000);
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  updateNavbarAuthState();
  initHomePage();
});
