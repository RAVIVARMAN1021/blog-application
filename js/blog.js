/**
 * ============================================================================
 * BLOGVERSE - BLOG MANAGEMENT MODULE (blog.js)
 * Connects frontend directly to Node.js / Express.js REST API backend.
 * Handles Blog CRUD operations, formatting toolbar, live preview,
 * preset imagery, and Create/Edit form logic.
 * ============================================================================
 */

// Backend API Base URL
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Preset high-res images for one-click featured image selection in editor
const PRESET_IMAGES = {
  tech: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  design: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  code: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  workspace: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  nature: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  ai: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80'
};

/**
 * Fetch all published blogs from backend REST API
 * @param {string} [category] 
 * @param {string} [search] 
 * @returns {Promise<Array>} List of blog objects
 */
async function getBlogs(category, search) {
  try {
    let url = `${API_BASE_URL}/blogs?`;
    if (category && category !== 'All') {
      url += `category=${encodeURIComponent(category)}&`;
    }
    if (search && search.trim()) {
      url += `search=${encodeURIComponent(search.trim())}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.success && Array.isArray(data.blogs)) {
      // Normalize _id to id for frontend compatibility
      return data.blogs.map(formatBlogItem);
    }
    return [];
  } catch (err) {
    console.error('Error fetching blogs from API:', err);
    return [];
  }
}

/**
 * Fetch a single blog post by ID from backend REST API
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
async function getBlogById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
    const data = await response.json();

    if (data.success && data.blog) {
      return formatBlogItem(data.blog);
    }
    return null;
  } catch (err) {
    console.error(`Error fetching blog ${id}:`, err);
    return null;
  }
}

/**
 * Create and persist a new blog post via backend REST API
 * @param {Object} postData 
 * @returns {Promise<Object>} { success: boolean, message: string, blog?: Object }
 */
async function createBlog(postData) {
  try {
    const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('blogverse_token');

    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: postData.title,
        content: postData.content,
        category: postData.category,
        excerpt: postData.excerpt,
        image: postData.image || PRESET_IMAGES.tech,
        status: postData.status || 'published'
      })
    });

    const data = await response.json();
    if (response.status === 401) {
      if (typeof showToast === 'function') {
        showToast('Your session has expired. Please sign in again.', 'error');
      }
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return { success: false, message: 'Session expired' };
    }

    if (response.ok && data.success) {
      return { success: true, message: data.message, blog: formatBlogItem(data.blog) };
    } else {
      return { success: false, message: data.message || 'Failed to create blog post' };
    }
  } catch (err) {
    console.error('Error in createBlog API call:', err);
    return { success: false, message: 'Could not connect to backend server.' };
  }
}

/**
 * Update an existing blog post via backend REST API
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>} { success: boolean, message: string, blog?: Object }
 */
async function updateBlog(id, updateData) {
  try {
    const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('blogverse_token');

    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    if (response.status === 401) {
      if (typeof showToast === 'function') {
        showToast('Your session has expired. Please sign in again.', 'error');
      }
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return { success: false, message: 'Session expired' };
    }

    if (response.ok && data.success) {
      return { success: true, message: data.message, blog: formatBlogItem(data.blog) };
    } else {
      return { success: false, message: data.message || 'Failed to update blog post' };
    }
  } catch (err) {
    console.error('Error in updateBlog API call:', err);
    return { success: false, message: 'Could not connect to backend server.' };
  }
}

/**
 * Delete a blog post via backend REST API
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
async function deleteBlog(id) {
  try {
    const token = typeof getAuthToken === 'function' ? getAuthToken() : localStorage.getItem('blogverse_token');

    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (err) {
    console.error('Error in deleteBlog API call:', err);
    return false;
  }
}

/**
 * Toggle a blog post's status between published and draft via API
 * @param {string} id 
 * @param {string} currentStatus 
 * @returns {Promise<Object|null>}
 */
async function toggleBlogStatus(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  return await updateBlog(id, { status: newStatus });
}

/**
 * Toggle like for a post via backend API
 * @param {string} id 
 * @param {boolean} isCurrentlyLiked 
 * @returns {Promise<number>} Updated like count
 */
async function toggleBlogLike(id, isCurrentlyLiked) {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/like`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        increment: !isCurrentlyLiked
      })
    });
    const data = await response.json();
    return data.success ? data.likes : 0;
  } catch (err) {
    console.error('Error toggling like:', err);
    return 0;
  }
}

/**
 * Format raw MongoDB blog document for frontend consumption
 * @param {Object} item 
 * @returns {Object}
 */
function formatBlogItem(item) {
  if (!item) return null;
  const authorObj = item.author || {};
  return {
    id: item._id || item.id,
    _id: item._id || item.id,
    title: item.title,
    slug: item.slug,
    category: item.category,
    content: item.content,
    excerpt: item.excerpt,
    image: item.image || PRESET_IMAGES.tech,
    author: authorObj.name || item.authorName || 'Author',
    authorEmail: authorObj.email || item.authorEmail || '',
    authorAvatar: authorObj.avatar || (authorObj.name ? authorObj.name[0].toUpperCase() : 'A'),
    authorId: authorObj._id || item.author,
    date: formatDate(item.createdAt),
    readTime: item.readTime || '3 min read',
    status: item.status || 'published',
    featured: !!item.featured,
    likes: item.likes || 0,
    views: item.views || 0
  };
}

/**
 * Format ISO date string into readable date (e.g. "Nov 18, 2026")
 * @param {string|Date} dateStr 
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Recent';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * ============================================================================
 * CREATE / EDIT BLOG PAGE CONTROLLER
 * ============================================================================
 */
async function initCreateBlogPage() {
  const blogForm = document.getElementById('blog-post-form');
  if (!blogForm) return;

  // Ensure user is logged in
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const token = typeof getAuthToken === 'function' ? getAuthToken() : null;

  if (!currentUser || !token) {
    if (typeof showToast === 'function') {
      showToast('Please sign in to write or edit blog posts.', 'info');
    }
    setTimeout(() => {
      window.location.href = 'login.html?redirect=create-blog.html';
    }, 400);
    return;
  }

  // Preload author name in form
  const authorField = document.getElementById('blog-author');
  if (authorField) {
    authorField.value = currentUser.name;
  }

  // Check if we are in Edit Mode via URL query ?id=...
  const urlParams = new URLSearchParams(window.location.search);
  const editPostId = urlParams.get('id');
  let currentEditingPost = null;

  if (editPostId) {
    currentEditingPost = await getBlogById(editPostId);
    if (currentEditingPost) {
      document.getElementById('page-heading').textContent = 'Edit Blog Post';
      document.getElementById('breadcrumb-title').textContent = 'Edit Post';
      document.getElementById('submit-publish-btn').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        Update Post
      `;

      // Fill in fields
      document.getElementById('blog-title').value = currentEditingPost.title;
      document.getElementById('blog-category').value = currentEditingPost.category;
      document.getElementById('blog-excerpt').value = currentEditingPost.excerpt || '';
      document.getElementById('blog-content').value = currentEditingPost.content;
      document.getElementById('blog-image-url').value = currentEditingPost.image;
      document.getElementById('blog-status-select').value = currentEditingPost.status;

      updateImagePreview(currentEditingPost.image);
    }
  }

  // Setup Image Controls
  setupImageControls();

  // Setup Formatting Toolbar
  setupEditorToolbar();

  // Setup View Tabs (Write vs Live Preview)
  setupViewTabs();

  // Setup Form Submission
  setupFormSubmit(editPostId, currentEditingPost, currentUser);
}

/**
 * Handle image inputs: URL change, File Upload (Base64), Presets
 */
function setupImageControls() {
  const urlInput = document.getElementById('blog-image-url');
  const fileInput = document.getElementById('blog-image-file');
  const previewBox = document.getElementById('image-preview-box');

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      updateImagePreview(urlInput.value.trim());
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          if (typeof showToast === 'function') {
            showToast('Image size should be under 2MB.', 'error');
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
          const base64 = evt.target.result;
          if (urlInput) urlInput.value = base64;
          updateImagePreview(base64);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const presetButtons = document.querySelectorAll('.preset-tag-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-preset');
      if (PRESET_IMAGES[type]) {
        if (urlInput) urlInput.value = PRESET_IMAGES[type];
        updateImagePreview(PRESET_IMAGES[type]);
      }
    });
  });
}

function updateImagePreview(url) {
  const previewBox = document.getElementById('image-preview-box');
  if (!previewBox) return;

  if (url) {
    previewBox.innerHTML = `<img src="${url}" alt="Preview" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'preview-placeholder\\'>Failed to load image URL</div>'"/>`;
  } else {
    previewBox.innerHTML = `
      <div class="preview-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <span>No image selected</span>
      </div>
    `;
  }
}

/**
 * Setup Editor Toolbar controls
 */
function setupEditorToolbar() {
  const textarea = document.getElementById('blog-content');
  const toolbar = document.querySelector('.editor-toolbar');
  if (!textarea || !toolbar) return;

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;

    e.preventDefault();
    const action = btn.getAttribute('data-action');
    insertFormatting(textarea, action);
  });
}

function insertFormatting(textarea, action) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end) || 'text';
  let replacement = '';

  switch (action) {
    case 'bold':
      replacement = `<strong>${selectedText}</strong>`;
      break;
    case 'italic':
      replacement = `<em>${selectedText}</em>`;
      break;
    case 'h2':
      replacement = `\n<h2>${selectedText}</h2>\n`;
      break;
    case 'h3':
      replacement = `\n<h3>${selectedText}</h3>\n`;
      break;
    case 'quote':
      replacement = `\n<blockquote>${selectedText}</blockquote>\n`;
      break;
    case 'code':
      replacement = `\n<pre><code>${selectedText}</code></pre>\n`;
      break;
    case 'list':
      replacement = `\n<ul>\n  <li>${selectedText}</li>\n  <li>Second item</li>\n</ul>\n`;
      break;
    case 'link':
      const url = prompt('Enter link URL:', 'https://');
      if (url) {
        replacement = `<a href="${url}" target="_blank" rel="noopener">${selectedText}</a>`;
      } else {
        return;
      }
      break;
    default:
      return;
  }

  textarea.setRangeText(replacement, start, end, 'end');
  textarea.focus();
}

/**
 * Setup tabs to switch between Writing and Live HTML Preview
 */
function setupViewTabs() {
  const tabButtons = document.querySelectorAll('.view-tab-btn');
  const textarea = document.getElementById('blog-content');
  const preview = document.getElementById('preview-container');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.getAttribute('data-view');
      if (view === 'preview') {
        textarea.style.display = 'none';
        preview.classList.add('active');
        preview.innerHTML = textarea.value.trim() || '<p class="text-muted">Nothing to preview yet. Start typing your content!</p>';
      } else {
        textarea.style.display = 'block';
        preview.classList.remove('active');
      }
    });
  });
}

/**
 * Handle form submission: Validation & Saving to REST API
 */
function setupFormSubmit(editPostId, currentEditingPost, currentUser) {
  const titleInput = document.getElementById('blog-title');
  const categorySelect = document.getElementById('blog-category');
  const contentTextarea = document.getElementById('blog-content');
  const excerptTextarea = document.getElementById('blog-excerpt');
  const imageUrlInput = document.getElementById('blog-image-url');
  const statusSelect = document.getElementById('blog-status-select');

  const publishBtn = document.getElementById('submit-publish-btn');
  const draftBtn = document.getElementById('submit-draft-btn');

  async function validateAndSave(targetStatus) {
    let isValid = true;

    [titleInput, categorySelect, contentTextarea].forEach(el => {
      if (el) el.classList.remove('is-invalid');
    });

    const titleVal = titleInput.value.trim();
    const categoryVal = categorySelect.value;
    const contentVal = contentTextarea.value.trim();

    if (!titleVal) {
      titleInput.classList.add('is-invalid');
      document.getElementById('title-error').textContent = 'Please enter a blog post title.';
      isValid = false;
    } else {
      document.getElementById('title-error').textContent = '';
    }

    if (!categoryVal) {
      categorySelect.classList.add('is-invalid');
      document.getElementById('category-error').textContent = 'Please select a category.';
      isValid = false;
    } else {
      document.getElementById('category-error').textContent = '';
    }

    if (!contentVal || contentVal.length < 20) {
      contentTextarea.classList.add('is-invalid');
      document.getElementById('content-error').textContent = 'Blog content must be at least 20 characters.';
      isValid = false;
    } else {
      document.getElementById('content-error').textContent = '';
    }

    if (!isValid) {
      if (typeof showToast === 'function') {
        showToast('Please fix the form errors before saving.', 'error');
      }
      return;
    }

    const finalStatus = targetStatus || (statusSelect ? statusSelect.value : 'published');

    const postPayload = {
      title: titleVal,
      category: categoryVal,
      content: contentVal,
      excerpt: excerptTextarea ? excerptTextarea.value.trim() : '',
      image: imageUrlInput ? imageUrlInput.value.trim() || PRESET_IMAGES.tech : PRESET_IMAGES.tech,
      status: finalStatus
    };

    if (publishBtn) publishBtn.disabled = true;
    if (draftBtn) draftBtn.disabled = true;

    let result;
    if (editPostId && currentEditingPost) {
      result = await updateBlog(editPostId, postPayload);
    } else {
      result = await createBlog(postPayload);
    }

    if (publishBtn) publishBtn.disabled = false;
    if (draftBtn) draftBtn.disabled = false;

    if (result.success) {
      if (typeof showToast === 'function') {
        showToast(result.message || 'Saved successfully!', 'success');
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } else {
      if (typeof showToast === 'function') {
        showToast(result.message || 'Error saving blog post', 'error');
      }
    }
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      validateAndSave('published');
    });
  }

  if (draftBtn) {
    draftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      validateAndSave('draft');
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initCreateBlogPage();
});
