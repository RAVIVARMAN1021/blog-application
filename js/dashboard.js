/**
 * ============================================================================
 * BLOGVERSE - DASHBOARD MODULE (dashboard.js)
 * Connects Author Dashboard to Node.js / Express.js REST API backend.
 * Displays dynamic statistics, manages author's blogs, supports status toggling,
 * editing, searching, and deleting with modal confirmation.
 * ============================================================================
 */

// Backend API Base URL
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

let activeFilter = 'all';
let currentSearchTerm = '';
let postToDeleteId = null;
let cachedUserPosts = [];

/**
 * Initialize Dashboard Page
 */
async function initDashboard() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const token = typeof getAuthToken === 'function' ? getAuthToken() : null;

  // Protect route
  if (!user || !token) {
    if (typeof showToast === 'function') {
      showToast('Please sign in to access your author dashboard.', 'info');
    }
    setTimeout(() => {
      window.location.href = 'login.html?redirect=dashboard.html';
    }, 400);
    return;
  }

  // Populate personalized greeting
  populateUserGreeting(user);

  // Setup UI event listeners
  setupDashboardControls();
  setupDeleteModal();

  // Initial fetch of user blogs & render
  await refreshDashboard();
}

/**
 * Populate welcome header with user's name & email
 * @param {Object} user 
 */
function populateUserGreeting(user) {
  const nameEl = document.getElementById('dash-user-name');
  const roleEl = document.getElementById('dash-user-role');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role || user.email;
}

/**
 * Fetch all posts owned by the current logged-in user from backend REST API
 * @returns {Promise<Array>}
 */
async function fetchUserBlogs() {
  const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('blogverse_token');
  if (!token) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/blogs/user/my-blogs`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      if (typeof showToast === 'function') {
        showToast('Your session has expired. Please sign in again.', 'info');
      }
      if (typeof logoutUser === 'function') {
        logoutUser();
      }
      return [];
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.blogs)) {
      return data.blogs.map(formatBlogItem);
    }
    return [];
  } catch (err) {
    console.error('Error fetching user blogs from API:', err);
    if (typeof showToast === 'function') {
      showToast('Could not reach backend API server.', 'error');
    }
    return [];
  }
}

/**
 * Calculate and render dashboard statistics cards
 * @param {Array} posts 
 */
function renderDashboardStats(posts) {
  const totalEl = document.getElementById('stat-total-blogs');
  const publishedEl = document.getElementById('stat-published-blogs');
  const draftEl = document.getElementById('stat-draft-blogs');
  const readsEl = document.getElementById('stat-total-reads');

  const total = posts.length;
  const published = posts.filter(p => p.status === 'published').length;
  const draft = posts.filter(p => p.status === 'draft').length;
  const totalReads = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  if (totalEl) totalEl.textContent = total;
  if (publishedEl) publishedEl.textContent = published;
  if (draftEl) draftEl.textContent = draft;
  if (readsEl) readsEl.textContent = totalReads.toLocaleString();
}

/**
 * Render user posts in the dashboard table
 * @param {Array} posts 
 */
function renderDashboardTable(posts) {
  const tbody = document.getElementById('dashboard-posts-body');
  const emptyState = document.getElementById('dash-empty-state');
  const tableContainer = document.getElementById('dash-table-wrapper');
  if (!tbody) return;

  // Filter by status tab
  let filtered = posts;
  if (activeFilter === 'published') {
    filtered = filtered.filter(p => p.status === 'published');
  } else if (activeFilter === 'draft') {
    filtered = filtered.filter(p => p.status === 'draft');
  }

  // Filter by search term
  if (currentSearchTerm.trim()) {
    const term = currentSearchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }

  // Check if empty
  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (tableContainer) tableContainer.style.display = 'block';

  // Build rows
  tbody.innerHTML = filtered.map(post => {
    const isPublished = post.status === 'published';
    const statusBadgeClass = isPublished ? 'badge-published' : 'badge-draft';
    const statusText = isPublished ? 'Published' : 'Draft';
    const toggleIconTitle = isPublished ? 'Switch to Draft' : 'Publish Post';

    return `
      <tr data-post-id="${post.id}">
        <td>
          <div class="post-cell-meta">
            <img src="${post.image}" alt="${escapeHtml(post.title)}" class="post-cell-thumb" onerror="this.src='assets/images/logo.svg'" />
            <div class="post-cell-text">
              <h5>${escapeHtml(post.title)}</h5>
              <span>${escapeHtml(post.readTime || '3 min read')}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-primary">${escapeHtml(post.category)}</span>
        </td>
        <td>
          <span class="badge ${statusBadgeClass}">
            <span class="badge-dot"></span>
            ${statusText}
          </span>
        </td>
        <td>
          <span style="font-size: 0.88rem; color: var(--text-secondary);">${post.date}</span>
        </td>
        <td>
          <span style="font-weight: 600; font-size: 0.9rem;">${post.views || 0}</span>
        </td>
        <td>
          <div class="table-actions">
            <!-- View Article Modal -->
            <button class="action-icon-btn view-btn" data-id="${post.id}" title="Preview Post" aria-label="Preview">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>

            <!-- Toggle Publish/Draft -->
            <button class="action-icon-btn toggle-status-btn" data-id="${post.id}" data-status="${post.status}" title="${toggleIconTitle}" aria-label="Toggle Status">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>

            <!-- Edit Button -->
            <button class="action-icon-btn edit-btn" data-id="${post.id}" title="Edit Post" aria-label="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>

            <!-- Delete Button -->
            <button class="action-icon-btn delete delete-btn" data-id="${post.id}" title="Delete Post" aria-label="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  attachTableEventListeners();
}

/**
 * Attach click listeners to view, edit, toggle, and delete buttons
 */
function attachTableEventListeners() {
  const tbody = document.getElementById('dashboard-posts-body');
  if (!tbody) return;

  // View post modal
  tbody.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const post = cachedUserPosts.find(p => p.id === id) || (await getBlogById(id));
      if (post && typeof openReaderModal === 'function') {
        openReaderModal(post);
      }
    });
  });

  // Edit post button
  tbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      window.location.href = `create-blog.html?id=${id}`;
    });
  });

  // Toggle post status button
  tbody.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const currentStatus = btn.getAttribute('data-status');
      btn.disabled = true;

      const result = await toggleBlogStatus(id, currentStatus);
      if (result && result.success) {
        if (typeof showToast === 'function') {
          showToast(`Post status updated to ${result.blog.status}.`, 'success');
        }
        await refreshDashboard();
      } else {
        if (typeof showToast === 'function') {
          showToast(result?.message || 'Failed to update status', 'error');
        }
        btn.disabled = false;
      }
    });
  });

  // Delete post button
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openDeleteConfirmModal(id);
    });
  });
}

/**
 * Setup dashboard filter tabs and search input
 */
function setupDashboardControls() {
  const tabButtons = document.querySelectorAll('.dash-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      renderDashboardTable(cachedUserPosts);
    });
  });

  const searchInput = document.getElementById('dashboard-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value;
      renderDashboardTable(cachedUserPosts);
    });
  }
}

/**
 * Setup Delete Confirmation Modal
 */
function setupDeleteModal() {
  const modal = document.getElementById('delete-confirm-modal');
  const cancelBtn = document.getElementById('cancel-delete-btn');
  const confirmBtn = document.getElementById('confirm-delete-btn');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('open');
    postToDeleteId = null;
  }

  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!postToDeleteId) return;

      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';

      const success = await deleteBlog(postToDeleteId);

      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Delete Permanently';
      closeModal();

      if (success) {
        if (typeof showToast === 'function') {
          showToast('Blog post deleted successfully.', 'success');
        }
        await refreshDashboard();
      } else {
        if (typeof showToast === 'function') {
          showToast('Failed to delete blog post from server.', 'error');
        }
      }
    });
  }
}

function openDeleteConfirmModal(id) {
  const modal = document.getElementById('delete-confirm-modal');
  if (!modal) return;
  postToDeleteId = id;
  modal.classList.add('open');
}

/**
 * Refresh stats and table contents from backend API
 */
async function refreshDashboard() {
  cachedUserPosts = await fetchUserBlogs();
  renderDashboardStats(cachedUserPosts);
  renderDashboardTable(cachedUserPosts);
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

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});
