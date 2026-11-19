/**
 * Comprehensive Backend & MongoDB Atlas Database Verification Suite
 * Tests all requirements: User registration, password hashing verification in MongoDB,
 * authentication, blog CRUD, individual blog details, draft isolation, and security.
 */

const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const User = require('./models/User');
const Blog = require('./models/Blog');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND & MONGODB ATLAS VERIFICATION');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // Connect Mongoose directly to MongoDB Atlas for database-level assertions
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`📡 Connected directly to MongoDB Atlas (${mongoose.connection.host}) for direct DB verification.\n`);

    // 1. Health Check
    console.log('--- 1. Health Check ---');
    const health = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.success === true, 'GET /api/health returns 200 OK');

    // 2. Register a New User
    console.log('\n--- 2. User Registration & Database Verification ---');
    const uniqueEmail = `atlas_tester_${Date.now()}@example.com`;
    const regPassword = 'SecurePassword123!';
    const regRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Atlas Verification Tester',
        email: uniqueEmail,
        password: regPassword
      }
    );
    assert(regRes.status === 201 && regRes.data.token, 'POST /api/auth/register creates user and returns 201 + JWT');
    const newUserId = regRes.data.user._id;
    const newUserToken = regRes.data.token;

    // 3. Verify user is saved in MongoDB directly
    const dbUser = await User.findById(newUserId).select('+password');
    assert(dbUser && dbUser.email === uniqueEmail, 'Verify new user is saved in MongoDB Atlas database');

    // 4. Verify password is saved in hashed form (bcrypt) and not plain text
    const isHashed = dbUser.password && (dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$'));
    const isNotPlain = dbUser.password !== regPassword;
    const bcryptMatches = await dbUser.matchPassword(regPassword);
    assert(isHashed && isNotPlain && bcryptMatches, 'Verify password is salted and hashed using bcryptjs in MongoDB Atlas');

    // 5. Verify password hash is never returned through API
    assert(regRes.data.user.password === undefined, 'Verify password hash is NOT exposed in API responses');

    // 6. Log in with the registered account
    console.log('\n--- 3. User Login & Token Verification ---');
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: uniqueEmail,
        password: regPassword
      }
    );
    assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login succeeds with registered credentials');

    // 7. Verify login fails with incorrect password
    const badLogin = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: uniqueEmail,
        password: 'wrong_password_attempt'
      }
    );
    assert(badLogin.status === 401, 'POST /api/auth/login rejects invalid password with 401');

    // 8. Create a New Blog (Published)
    console.log('\n--- 4. Blog Creation & MongoDB Storage Verification ---');
    const blogPayload = {
      title: 'Deep Dive into Cloud Database Architectures',
      category: 'Technology',
      content: '<p>Exploring distributed MongoDB replica sets, cloud resilience, and high-throughput indexes.</p>',
      excerpt: 'Exploring distributed MongoDB replica sets.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      status: 'published'
    };

    const createBlogRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/blogs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newUserToken}`
        }
      },
      blogPayload
    );
    assert(createBlogRes.status === 201 && createBlogRes.data.blog, 'POST /api/blogs creates blog post');
    const createdBlogId = createBlogRes.data.blog._id;

    // 9. Verify blog is saved in MongoDB Atlas directly
    const dbBlog = await Blog.findById(createdBlogId);
    assert(dbBlog && dbBlog.title === blogPayload.title && dbBlog.author.toString() === newUserId, 'Verify blog is persisted in MongoDB Atlas with author reference');

    // 10. Retrieve all published blogs (GET /api/blogs)
    console.log('\n--- 5. Retrieve Published Blogs & Filtering ---');
    const allPublished = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs',
      method: 'GET'
    });
    assert(allPublished.status === 200 && allPublished.data.blogs.some(b => b._id === createdBlogId), 'GET /api/blogs retrieves published blogs including new post');

    // 11. Category Filtering
    const techBlogs = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs?category=Technology',
      method: 'GET'
    });
    assert(techBlogs.status === 200 && techBlogs.data.blogs.every(b => b.category === 'Technology'), 'GET /api/blogs?category=Technology filters by category');

    // 12. Search Filtering (with regex characters)
    const searchRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs?search=' + encodeURIComponent('Deep Dive'),
      method: 'GET'
    });
    assert(searchRes.status === 200 && searchRes.data.blogs.some(b => b._id === createdBlogId), 'GET /api/blogs?search= keyword search returns matching posts');

    // 13. Open an Individual Blog Details Page API (GET /api/blogs/:id)
    console.log('\n--- 6. Individual Blog Details (GET /api/blogs/:id) ---');
    const initialViews = dbBlog.views || 0;
    const blogDetailsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/blogs/${createdBlogId}`,
      method: 'GET'
    });
    assert(
      blogDetailsRes.status === 200 &&
      blogDetailsRes.data.blog.title === blogPayload.title &&
      blogDetailsRes.data.blog.author.name === 'Atlas Verification Tester' &&
      blogDetailsRes.data.blog.views === initialViews + 1,
      'GET /api/blogs/:id retrieves complete blog details, populates author, and increments views'
    );

    // 14. Edit an existing blog (PUT /api/blogs/:id)
    console.log('\n--- 7. Blog Update & Authorization ---');
    const updateRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/blogs/${createdBlogId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newUserToken}`
        }
      },
      {
        title: 'Deep Dive into Cloud Database Architectures (Updated)'
      }
    );
    assert(updateRes.status === 200 && updateRes.data.blog.title.includes('Updated'), 'PUT /api/blogs/:id updates blog title');

    // Verify update in MongoDB Atlas directly
    const updatedDbBlog = await Blog.findById(createdBlogId);
    assert(updatedDbBlog.title === 'Deep Dive into Cloud Database Architectures (Updated)', 'Verify updated blog title in MongoDB Atlas database');

    // 15. Create Draft Blog and Verify Draft Isolation
    console.log('\n--- 8. Draft Isolation Verification ---');
    const draftPayload = {
      title: 'Secret Upcoming Announcement (Draft Only)',
      category: 'Career',
      content: '<p>Internal draft content not ready for the public.</p>',
      status: 'draft'
    };
    const draftCreateRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/blogs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newUserToken}`
        }
      },
      draftPayload
    );
    assert(draftCreateRes.status === 201, 'POST /api/blogs creates draft blog');
    const draftBlogId = draftCreateRes.data.blog._id;

    // Verify draft is NOT in public GET /api/blogs
    const publicAfterDraft = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs',
      method: 'GET'
    });
    const draftInPublic = publicAfterDraft.data.blogs.some(b => b._id === draftBlogId);
    assert(!draftInPublic, 'Verify drafts are NOT returned in public GET /api/blogs list');

    // Verify draft IS returned in author dashboard (/api/blogs/user/my-blogs)
    const myBlogs = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs/user/my-blogs',
      method: 'GET',
      headers: { Authorization: `Bearer ${newUserToken}` }
    });
    const draftInAuthorList = myBlogs.data.blogs.some(b => b._id === draftBlogId && b.status === 'draft');
    assert(draftInAuthorList, 'Verify author can view own draft in /api/blogs/user/my-blogs');

    // 16. Delete a Blog (DELETE /api/blogs/:id)
    console.log('\n--- 9. Blog Deletion Verification ---');
    const deleteRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/blogs/${createdBlogId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${newUserToken}` }
    });
    assert(deleteRes.status === 200, 'DELETE /api/blogs/:id successfully deletes post');

    // Verify removed from MongoDB Atlas directly
    const deletedDbBlog = await Blog.findById(createdBlogId);
    assert(deletedDbBlog === null, 'Verify blog document is permanently removed from MongoDB Atlas');

    // Clean up test draft
    await Blog.findByIdAndDelete(draftBlogId);
    await User.findByIdAndDelete(newUserId);

    console.log('\n=============================================================');
    console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('=============================================================\n');

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test execution error:', err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// Start tests
setTimeout(runTests, 1000);
