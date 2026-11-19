/**
 * ============================================================================
 * BLOGVERSE - INDIVIDUAL BLOG DETAILS MODULE (blog-details.js)
 * Fetches single blog by ID from MongoDB Atlas via REST API (GET /api/blogs/:id).
 * Handles loading states, full article rendering, like toggling, and error views.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initBlogDetailsPage();
});

async function initBlogDetailsPage() {
  const loadingEl = document.getElementById('details-loading');
  const errorEl = document.getElementById('details-error');
  const articleEl = document.getElementById('details-article');
  const shareBtn = document.getElementById('share-btn');

  // Extract blog ID from query parameters (?id=BLOG_ID)
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');

  if (!blogId || !blogId.trim()) {
    showDetailsError('No Blog ID Provided', 'Please select a valid blog post from the Home page.');
    return;
  }

  try {
    if (loadingEl) loadingEl.style.display = 'flex';
    if (errorEl) errorEl.style.display = 'none';
    if (articleEl) articleEl.style.display = 'none';

    // Fetch blog details from backend REST API
    const post = typeof getBlogById === 'function' ? await getBlogById(blogId.trim()) : null;

    if (!post) {
      showDetailsError(
        'Blog Post Not Found',
        'The article you requested could not be found in our database. It may have been unpublished, deleted, or the ID is invalid.'
      );
      return;
    }

    // Populate Article Content
    renderArticleDetails(post);

    if (loadingEl) loadingEl.style.display = 'none';
    if (articleEl) articleEl.style.display = 'block';

  } catch (err) {
    console.error('Failed to load blog details:', err);
    showDetailsError('Error Loading Article', 'A network or server error occurred while retrieving this blog post. Please try again.');
  }

  // Setup Share / Copy Link functionality
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (typeof showToast === 'function') {
          showToast('Article link copied to clipboard!', 'success');
        } else {
          alert('Link copied to clipboard!');
        }
      } catch (e) {
        if (typeof showToast === 'function') {
          showToast('Failed to copy link. You can copy the URL from your browser address bar.', 'warning');
        }
      }
    });
  }
}

/**
 * Populate all DOM elements with the fetched blog post data
 * @param {Object} post 
 */
function renderArticleDetails(post) {
  // Update browser tab title
  document.title = `${post.title} – Blogverse`;

  // Badges & Meta
  const categoryEl = document.getElementById('article-category');
  const dateEl = document.getElementById('article-date');
  const readTimeEl = document.getElementById('article-read-time');
  const titleEl = document.getElementById('article-title');

  if (categoryEl) categoryEl.textContent = post.category || 'General';
  if (dateEl) dateEl.textContent = post.date || 'Recent';
  if (readTimeEl) readTimeEl.textContent = post.readTime || '3 min read';
  if (titleEl) titleEl.textContent = post.title || 'Untitled Post';

  // Author details
  const authorAvatarEl = document.getElementById('article-author-avatar');
  const authorNameEl = document.getElementById('article-author-name');
  const authorRoleEl = document.getElementById('article-author-role');

  const avatarText = post.authorAvatar || (post.author ? post.author[0].toUpperCase() : 'AU');
  if (authorAvatarEl) authorAvatarEl.textContent = avatarText;
  if (authorNameEl) authorNameEl.textContent = post.author || 'Author';
  if (authorRoleEl) authorRoleEl.textContent = post.authorEmail || 'Contributing Writer';

  // Stats (Views & Likes)
  const viewsEl = document.getElementById('article-views');
  const likesEl = document.getElementById('details-likes');
  const likeBtn = document.getElementById('details-like-btn');

  if (viewsEl) viewsEl.textContent = post.views || 0;
  if (likesEl) likesEl.textContent = post.likes || 0;

  // Like button handling
  if (likeBtn) {
    const likedKey = `blogverse_liked_${post.id}`;
    const isLiked = localStorage.getItem(likedKey) === 'true';

    if (isLiked) {
      likeBtn.classList.add('liked');
      const svg = likeBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', 'currentColor');
    }

    likeBtn.addEventListener('click', async () => {
      const currentlyLiked = likeBtn.classList.contains('liked');
      if (typeof toggleBlogLike === 'function') {
        const newLikes = await toggleBlogLike(post.id, currentlyLiked);
        if (likesEl) likesEl.textContent = newLikes;

        likeBtn.classList.toggle('liked');
        const nowLiked = likeBtn.classList.contains('liked');
        localStorage.setItem(likedKey, nowLiked ? 'true' : 'false');

        const svg = likeBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', nowLiked ? 'currentColor' : 'none');

        if (typeof showToast === 'function') {
          showToast(nowLiked ? 'Liked story!' : 'Unliked story.', 'info');
        }
      }
    });
  }

  // Featured Image
  const imgEl = document.getElementById('article-image');
  if (imgEl) {
    imgEl.src = post.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';
    imgEl.alt = post.title;
  }

  // Article Content (Rich HTML)
  const contentEl = document.getElementById('article-content');
  if (contentEl) {
    // If content is HTML, insert directly; if raw text, format paragraphs
    if (post.content && post.content.includes('<')) {
      contentEl.innerHTML = post.content;
    } else {
      contentEl.innerHTML = (post.content || '')
        .split('\n\n')
        .filter(Boolean)
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('');
    }
  }

  // Author Bio Card at bottom
  const bioAvatar = document.getElementById('bio-avatar');
  const bioName = document.getElementById('bio-author-name');
  const bioMeta = document.getElementById('bio-author-meta');

  if (bioAvatar) bioAvatar.textContent = avatarText;
  if (bioName) bioName.textContent = post.author || 'Author';
  if (bioMeta) {
    bioMeta.textContent = post.authorEmail ? `Reach out to the author at ${post.authorEmail}` : 'Published on Blogverse platform.';
  }
}

/**
 * Display clean error message state
 * @param {string} title 
 * @param {string} message 
 */
function showDetailsError(title, message) {
  const loadingEl = document.getElementById('details-loading');
  const errorEl = document.getElementById('details-error');
  const articleEl = document.getElementById('details-article');
  const errorTitle = document.getElementById('error-title');
  const errorMsg = document.getElementById('error-message');

  if (loadingEl) loadingEl.style.display = 'none';
  if (articleEl) articleEl.style.display = 'none';
  if (errorEl) {
    errorEl.style.display = 'block';
    if (errorTitle) errorTitle.textContent = title;
    if (errorMsg) errorMsg.textContent = message;
  }
}

/**
 * Utility: Escape HTML string
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
