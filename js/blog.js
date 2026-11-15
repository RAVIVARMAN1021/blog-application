/**
 * ============================================================================
 * BLOGVERSE - BLOG MANAGEMENT MODULE (blog.js)
 * Manages blog posts in localStorage, CRUD operations, seed data,
 * formatting toolbar, rich preview, and Create/Edit post form logic.
 * ============================================================================
 */

// Storage Key
const BLOGS_STORAGE_KEY = 'blogverse_posts';

// Sample Seed Posts with high quality images and realistic content
const INITIAL_SAMPLE_POSTS = [
  {
    id: 'post_101',
    title: 'The Future of Frontend Development: Trends to Watch in 2025 and Beyond',
    slug: 'future-of-frontend-development-2025',
    category: 'Technology',
    excerpt: 'Explore how WebAssembly, edge rendering, component-driven architectures, and AI-assisted tooling are reshaping how modern user interfaces are crafted.',
    content: `
      <p>The frontend ecosystem never stands still. Over the past few years, the velocity of innovation in web standards, browser rendering engines, and developer toolchains has reached an extraordinary peak. As engineers building experiences for millions of users worldwide, staying ahead of these shifts is no longer optional—it is essential.</p>
      
      <h2>1. The Rise of Sub-Millisecond Edge Rendering</h2>
      <p>Modern users demand instant responsiveness. Traditional server-side rendering (SSR) often suffered from latency bottlenecks when servers were physically distant from the user. Edge computing has turned this model upside down by running compute nodes at hundreds of globally distributed points of presence.</p>
      
      <blockquote>"The fastest request is the one that travels the shortest geographical distance. Compute at the edge is the new default baseline."</blockquote>

      <h2>2. WebAssembly and Native Performance on the Web</h2>
      <p>WebAssembly (WASM) is continuing its progression from experimental feature to production workhorse. From in-browser video editors like Figma to heavy 3D rendering engines and database clients, WASM unlocks speeds previously reserved strictly for compiled desktop software.</p>

      <h2>3. AI-Assisted Developer Workflows</h2>
      <p>Developer productivity is experiencing an exponential leap. Intelligent code completion, automated unit test generation, and continuous accessibility auditing now happen directly inside modern IDEs, freeing creators to focus on high-level architecture and delighting users.</p>

      <h2>Key Takeaways for Engineers</h2>
      <ul>
        <li>Prioritize web vitals: Core Web Vitals directly impact conversion and SEO rankings.</li>
        <li>Embrace modern vanilla capabilities: CSS Grid, CSS Variables, and Native Dialogs solve problems that used to require heavy external libraries.</li>
        <li>Design for accessibility from day one: Semantic HTML is the foundation of accessible software.</li>
      </ul>
    `,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    author: 'Alex Rivera',
    authorEmail: 'demo@example.com',
    authorAvatar: 'AR',
    date: 'Nov 14, 2024',
    readTime: '6 min read',
    status: 'published',
    featured: true,
    likes: 42,
    views: 310
  },
  {
    id: 'post_102',
    title: 'Mastering Modern CSS: From Flexbox and Grid to Container Queries',
    slug: 'mastering-modern-css-grid-flexbox',
    category: 'Design',
    excerpt: 'A deep dive into building bulletproof responsive layouts without needing bloated CSS frameworks or excessive media query breakpoints.',
    content: `
      <p>CSS has evolved drastically over the last decade. Gone are the days of float-based grid hacks, fragile clearfix rules, and massive third-party UI framework dependencies. Modern vanilla CSS provides native layout systems that are cleaner, faster, and dramatically easier to maintain.</p>

      <h2>Flexbox vs. CSS Grid: Knowing When to Choose What</h2>
      <p>Flexbox is inherently one-dimensional—it aligns items along either a row or a column. CSS Grid is two-dimensional—handling rows and columns simultaneously with mathematical precision.</p>

      <pre><code>/* Clean Responsive Grid without Media Queries */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}</code></pre>

      <h2>CSS Custom Properties for Dynamic Theming</h2>
      <p>Using CSS variables allows instant theme toggling (Light/Dark mode) and dynamic design tokens without recalculating entire stylesheets at runtime.</p>
    `,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    author: 'Elena Rostova',
    authorEmail: 'elena@example.com',
    authorAvatar: 'ER',
    date: 'Nov 12, 2024',
    readTime: '4 min read',
    status: 'published',
    featured: false,
    likes: 29,
    views: 185
  },
  {
    id: 'post_103',
    title: 'Building Resilient Web Applications with Vanilla JavaScript and Web APIs',
    slug: 'building-resilient-vanilla-javascript-apps',
    category: 'Coding',
    excerpt: 'Learn how to leverage native browser APIs, DOM events, and client-side storage to build lightning-fast web applications with zero external dependencies.',
    content: `
      <p>Framework fatigue is real. While React, Vue, and Angular certainly have their place in complex corporate software, understanding the fundamental mechanics of the browser DOM and modern JavaScript standards makes you an extraordinarily more versatile engineer.</p>

      <h2>The Power of Modern Web APIs</h2>
      <p>The standard Web Platform includes rich capabilities right out of the box:</p>
      <ul>
        <li><strong>localStorage & IndexedDB:</strong> For robust client-side persistence without requiring an immediate backend roundtrip.</li>
        <li><strong>IntersectionObserver:</strong> For lazy loading images and trigger-based scroll animations without scrolling performance penalties.</li>
        <li><strong>Fetch API:</strong> Clean promise-based network communication with built-in streaming support.</li>
      </ul>

      <blockquote>"Understanding how vanilla DOM manipulation works under the hood turns abstract framework errors into trivial puzzles."</blockquote>
    `,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    author: 'Alex Rivera',
    authorEmail: 'demo@example.com',
    authorAvatar: 'AR',
    date: 'Nov 10, 2024',
    readTime: '5 min read',
    status: 'published',
    featured: false,
    likes: 38,
    views: 240
  },
  {
    id: 'post_104',
    title: 'Designing with Intention: Why Minimalist UI Converts Better',
    slug: 'designing-with-intention-minimalist-ui',
    category: 'Design',
    excerpt: 'Clutter is the enemy of clarity. Discover the cognitive psychology behind whitespace, visual hierarchy, and intuitive user experiences.',
    content: `
      <p>When users land on a website, they make subconscious judgments within the first 50 milliseconds. An interface packed with competing visual stimuli, loud banners, and chaotic layouts forces cognitive friction upon the reader.</p>
      <h2>The Law of Visual Hierarchy</h2>
      <p>Visual hierarchy directs the user's eye naturally. By controlling scale, contrast, and spacing, you guide the visitor toward primary actions effortlessly.</p>
    `,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    author: 'Marcus Vance',
    authorEmail: 'marcus@example.com',
    authorAvatar: 'MV',
    date: 'Nov 08, 2024',
    readTime: '3 min read',
    status: 'published',
    featured: false,
    likes: 19,
    views: 142
  },
  {
    id: 'post_105',
    title: 'Architecting Scalable Microservices with Event-Driven Design',
    slug: 'architecting-scalable-microservices-event-driven',
    category: 'Technology',
    excerpt: 'Draft notes on decoupling distributed systems, asynchronous message queues, and designing fault-tolerant communication pipelines.',
    content: `
      <p>This draft outlines core tenets of asynchronous messaging patterns, idempotency keys, and avoiding distributed transactions across decoupled boundaries.</p>
      <h2>Work in Progress</h2>
      <p>To be expanded with real-world case studies from fintech and logistics implementations.</p>
    `,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    author: 'Alex Rivera',
    authorEmail: 'demo@example.com',
    authorAvatar: 'AR',
    date: 'Nov 05, 2024',
    readTime: '4 min read',
    status: 'draft',
    featured: false,
    likes: 0,
    views: 12
  },
  {
    id: 'post_106',
    title: 'A Remote Worker’s Guide to Peak Focus and Burnout Prevention',
    slug: 'remote-worker-focus-burnout-prevention',
    category: 'Lifestyle',
    excerpt: 'Actionable strategies for structuring your day, establishing ruthless boundaries between work and rest, and maintaining creative energy.',
    content: `
      <p>Working remotely grants unmatched autonomy, but without intentional structure, the home can quickly become a 24-hour workplace. Setting physical and psychological boundaries protects both your career trajectory and mental wellbeing.</p>
      <h2>The 90-Minute Focus Block</h2>
      <p>Research consistently shows human cognitive focus peaks in 90-minute ultradian cycles. Scheduling focused sprints followed by intentional screen-free walks radically improves sustainable output.</p>
    `,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    author: 'Sarah Jenkins',
    authorEmail: 'sarah@example.com',
    authorAvatar: 'SJ',
    date: 'Nov 02, 2024',
    readTime: '5 min read',
    status: 'published',
    featured: false,
    likes: 54,
    views: 380
  }
];

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
 * Initialize posts in localStorage if none exist
 */
function initBlogsStorage() {
  const blogs = getBlogs();
  if (blogs.length === 0) {
    saveBlogs(INITIAL_SAMPLE_POSTS);
  }
}

/**
 * Retrieve all blogs from localStorage
 * @returns {Array} List of blog objects
 */
function getBlogs() {
  try {
    const data = localStorage.getItem(BLOGS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error loading blogs from localStorage:', err);
    return [];
  }
}

/**
 * Save array of blogs to localStorage
 * @param {Array} blogs 
 */
function saveBlogs(blogs) {
  try {
    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));
  } catch (err) {
    console.error('Error saving blogs to localStorage:', err);
  }
}

/**
 * Get a single blog by ID
 * @param {string} id 
 * @returns {Object|null}
 */
function getBlogById(id) {
  const blogs = getBlogs();
  return blogs.find(b => b.id === id) || null;
}

/**
 * Create and persist a new blog post
 * @param {Object} postData 
 * @returns {Object} Newly created post
 */
function createBlog(postData) {
  initBlogsStorage();
  const blogs = getBlogs();

  const newPost = {
    id: 'post_' + Date.now(),
    title: postData.title.trim(),
    slug: generateSlug(postData.title),
    category: postData.category || 'General',
    excerpt: postData.excerpt ? postData.excerpt.trim() : generateExcerpt(postData.content),
    content: postData.content,
    image: postData.image || PRESET_IMAGES.tech,
    author: postData.author || 'Anonymous Writer',
    authorEmail: postData.authorEmail || 'demo@example.com',
    authorAvatar: postData.authorAvatar || 'AU',
    date: formatCurrentDate(),
    readTime: calculateReadTime(postData.content),
    status: postData.status || 'published',
    featured: false,
    likes: 0,
    views: 0
  };

  blogs.unshift(newPost);
  saveBlogs(blogs);
  return newPost;
}

/**
 * Update an existing blog post
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Object|null} Updated post or null if not found
 */
function updateBlog(id, updateData) {
  initBlogsStorage();
  const blogs = getBlogs();
  const index = blogs.findIndex(b => b.id === id);

  if (index === -1) return null;

  blogs[index] = {
    ...blogs[index],
    title: updateData.title ? updateData.title.trim() : blogs[index].title,
    slug: updateData.title ? generateSlug(updateData.title) : blogs[index].slug,
    category: updateData.category || blogs[index].category,
    excerpt: updateData.excerpt ? updateData.excerpt.trim() : blogs[index].excerpt,
    content: updateData.content !== undefined ? updateData.content : blogs[index].content,
    image: updateData.image || blogs[index].image,
    status: updateData.status || blogs[index].status,
    readTime: updateData.content ? calculateReadTime(updateData.content) : blogs[index].readTime
  };

  saveBlogs(blogs);
  return blogs[index];
}

/**
 * Delete a blog post by ID
 * @param {string} id 
 * @returns {boolean}
 */
function deleteBlog(id) {
  initBlogsStorage();
  const blogs = getBlogs();
  const filtered = blogs.filter(b => b.id !== id);
  if (filtered.length === blogs.length) return false;
  saveBlogs(filtered);
  return true;
}

/**
 * Toggle a blog post's status between published and draft
 * @param {string} id 
 * @returns {Object|null}
 */
function toggleBlogStatus(id) {
  const blog = getBlogById(id);
  if (!blog) return null;
  const newStatus = blog.status === 'published' ? 'draft' : 'published';
  return updateBlog(id, { status: newStatus });
}

/**
 * Increment views counter for an article
 * @param {string} id 
 */
function incrementBlogViews(id) {
  const blogs = getBlogs();
  const index = blogs.findIndex(b => b.id === id);
  if (index !== -1) {
    blogs[index].views = (blogs[index].views || 0) + 1;
    saveBlogs(blogs);
  }
}

/**
 * Toggle like for a post (stored locally)
 * @param {string} id 
 * @returns {number} Updated like count
 */
function toggleBlogLike(id) {
  const blogs = getBlogs();
  const index = blogs.findIndex(b => b.id === id);
  if (index === -1) return 0;

  const likedKey = `liked_${id}`;
  const isLiked = localStorage.getItem(likedKey) === 'true';

  if (isLiked) {
    blogs[index].likes = Math.max(0, (blogs[index].likes || 1) - 1);
    localStorage.removeItem(likedKey);
  } else {
    blogs[index].likes = (blogs[index].likes || 0) + 1;
    localStorage.setItem(likedKey, 'true');
  }

  saveBlogs(blogs);
  return blogs[index].likes;
}

/**
 * Utility: Convert a string title into a clean URL slug
 * @param {string} text 
 * @returns {string}
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Utility: Format current date into readable format (e.g., "Nov 15, 2024")
 * @returns {string}
 */
function formatCurrentDate() {
  const options = { year: 'numeric', month: 'short', day: '2-digit' };
  return new Date().toLocaleDateString('en-US', options);
}

/**
 * Utility: Calculate estimated reading time
 * @param {string} text 
 * @returns {string}
 */
function calculateReadTime(text) {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const wordCount = cleanText.split(/\s+/).filter(w => w.length > 0).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute) || 1;
  return `${minutes} min read`;
}

/**
 * Utility: Generate excerpt from content string
 * @param {string} content 
 * @returns {string}
 */
function generateExcerpt(content) {
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText.length > 150 ? plainText.slice(0, 147) + '...' : plainText;
}

/**
 * ============================================================================
 * CREATE / EDIT BLOG PAGE CONTROLLER
 * ============================================================================
 */
function initCreateBlogPage() {
  const blogForm = document.getElementById('blog-post-form');
  if (!blogForm) return;

  // Ensure user is logged in to create/edit
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!currentUser) {
    if (typeof showToast === 'function') {
      showToast('Please sign in to write or edit blog posts.', 'info');
    }
    setTimeout(() => {
      window.location.href = 'login.html?redirect=create-blog.html';
    }, 500);
    return;
  }

  // Preload author name
  const authorField = document.getElementById('blog-author');
  if (authorField) {
    authorField.value = currentUser.name;
  }

  // Check if we are in Edit Mode via URL query ?id=...
  const urlParams = new URLSearchParams(window.location.search);
  const editPostId = urlParams.get('id');
  let currentEditingPost = null;

  if (editPostId) {
    currentEditingPost = getBlogById(editPostId);
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
      document.getElementById('blog-excerpt').value = currentEditingPost.excerpt;
      document.getElementById('blog-content').value = currentEditingPost.content;
      document.getElementById('blog-image-url').value = currentEditingPost.image;
      document.getElementById('blog-status-select').value = currentEditingPost.status;

      // Update image preview
      updateImagePreview(currentEditingPost.image);
    }
  }

  // Setup Image Preview Handlers
  setupImageControls();

  // Setup Formatting Toolbar
  setupEditorToolbar();

  // Setup View Tabs (Edit vs Live Preview)
  setupViewTabs();

  // Form Submission
  setupFormSubmit(editPostId, currentEditingPost, currentUser);
}

/**
 * Handle image inputs: URL change, File Upload (Base64), Presets
 */
function setupImageControls() {
  const urlInput = document.getElementById('blog-image-url');
  const fileInput = document.getElementById('blog-image-file');
  const previewBox = document.getElementById('image-preview-box');

  // URL input live change
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const url = urlInput.value.trim();
      updateImagePreview(url);
    });
  }

  // File upload input (read as Data URL Base64)
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          if (typeof showToast === 'function') {
            showToast('Image size should be under 2MB for browser storage.', 'error');
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
          const base64 = evt.target.result;
          if (urlInput) urlInput.value = base64;
          updateImagePreview(base64);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Preset tag buttons
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

/**
 * Helper to update the image preview element
 * @param {string} url 
 */
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
 * Setup Editor Toolbar controls (Bold, Italic, Headings, Quote, Code, List, Link)
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

/**
 * Insert formatted HTML tags at current cursor or selection
 * @param {HTMLTextAreaElement} textarea 
 * @param {string} action 
 */
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
      const url = prompt('Enter the link URL:', 'https://');
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
 * Handle form submission: Validation & Saving
 */
function setupFormSubmit(editPostId, currentEditingPost, currentUser) {
  const form = document.getElementById('blog-post-form');
  const titleInput = document.getElementById('blog-title');
  const categorySelect = document.getElementById('blog-category');
  const contentTextarea = document.getElementById('blog-content');
  const excerptTextarea = document.getElementById('blog-excerpt');
  const imageUrlInput = document.getElementById('blog-image-url');
  const statusSelect = document.getElementById('blog-status-select');

  // Submit as Published button
  const publishBtn = document.getElementById('submit-publish-btn');
  // Save as Draft button
  const draftBtn = document.getElementById('submit-draft-btn');

  function validateAndSave(targetStatus) {
    let isValid = true;

    // Reset styles
    [titleInput, categorySelect, contentTextarea].forEach(el => {
      el.classList.remove('is-invalid');
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
        showToast('Please fix the errors in the form before saving.', 'error');
      }
      return;
    }

    // Determine final status
    const finalStatus = targetStatus || (statusSelect ? statusSelect.value : 'published');

    const postPayload = {
      title: titleVal,
      category: categoryVal,
      content: contentVal,
      excerpt: excerptTextarea.value.trim(),
      image: imageUrlInput.value.trim() || PRESET_IMAGES.tech,
      status: finalStatus,
      author: currentUser.name,
      authorEmail: currentUser.email,
      authorAvatar: currentUser.avatar || 'U'
    };

    if (editPostId && currentEditingPost) {
      // Update
      updateBlog(editPostId, postPayload);
      if (typeof showToast === 'function') {
        showToast('Blog post updated successfully!', 'success');
      }
    } else {
      // Create new
      createBlog(postPayload);
      if (typeof showToast === 'function') {
        showToast(finalStatus === 'published' ? 'Blog post published successfully!' : 'Blog post saved as draft.', 'success');
      }
    }

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);
  }

  // Publish / Main Button
  if (publishBtn) {
    publishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      validateAndSave('published');
    });
  }

  // Draft Button
  if (draftBtn) {
    draftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      validateAndSave('draft');
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initBlogsStorage();
  initCreateBlogPage();
});
