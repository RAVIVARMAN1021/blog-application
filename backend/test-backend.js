/**
 * Comprehensive Backend API Test Suite
 * Tests all authentication, blog CRUD, permissions, and error handling.
 */

const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

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
  console.log('\n=============================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND API TESTS');
  console.log('=============================================\n');

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
    // 1. Health Check
    console.log('--- 1. Testing Health Check ---');
    const health = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.success === true, 'GET /api/health returns 200 OK');

    // 2. Demo User Login
    console.log('\n--- 2. Testing User Login ---');
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'demo@example.com',
        password: 'password123'
      }
    );
    assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login with valid credentials returns 200 + JWT');
    const demoToken = loginRes.data.token;

    // 3. User Login with wrong password
    const badLogin = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: 'demo@example.com',
        password: 'wrong_password'
      }
    );
    assert(badLogin.status === 401 && badLogin.data.success === false, 'POST /api/auth/login with invalid password returns 401');

    // 4. User Registration
    console.log('\n--- 3. Testing User Registration ---');
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'New Test User',
        email: uniqueEmail,
        password: 'password123'
      }
    );
    assert(regRes.status === 201 && regRes.data.token, 'POST /api/auth/register creates user and returns 201 + JWT');
    const newUserToken = regRes.data.token;

    // 5. Duplicate Registration Check
    const dupReg = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Duplicate User',
        email: uniqueEmail,
        password: 'password123'
      }
    );
    assert(dupReg.status === 400, 'POST /api/auth/register with duplicate email returns 400 error');

    // 6. Get Current User Profile (/api/auth/me)
    console.log('\n--- 4. Testing Protected Profile ---');
    const meRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(meRes.status === 200 && meRes.data.user.email === 'demo@example.com', 'GET /api/auth/me returns authenticated user details');

    // 7. Get All Published Blogs
    console.log('\n--- 5. Testing Blog APIs ---');
    const allBlogs = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs',
      method: 'GET'
    });
    assert(allBlogs.status === 200 && Array.isArray(allBlogs.data.blogs), 'GET /api/blogs returns list of published blogs');

    // 7b. Test search with regex special characters like "[" and "("
    const regexSearch = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs?search=' + encodeURIComponent('['),
      method: 'GET'
    });
    assert(regexSearch.status === 200, 'GET /api/blogs?search=[ handles regex characters safely without 500 error');

    // 7c. Test Invalid ObjectId format handling (CastError)
    const invalidIdRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs/invalid_id_12345',
      method: 'GET'
    });
    assert(invalidIdRes.status === 404, 'GET /api/blogs/invalid_id returns 404 for invalid ObjectId format');

    // 8. Create a New Blog (Protected)
    const newBlogPayload = {
      title: 'Automated Test Blog Article',
      category: 'Technology',
      content: '<p>This is test content written during automated verification of the REST APIs.</p>',
      excerpt: 'Short excerpt for automated test blog.',
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
          Authorization: `Bearer ${demoToken}`
        }
      },
      newBlogPayload
    );
    assert(createBlogRes.status === 201 && createBlogRes.data.blog, 'POST /api/blogs creates new blog post');
    const createdBlogId = createBlogRes.data.blog._id;

    // 9. Unauthorized Blog Creation (without token)
    const unauthCreate = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/blogs',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      newBlogPayload
    );
    assert(unauthCreate.status === 401, 'POST /api/blogs without JWT returns 401 Unauthorized');

    // 10. Get Single Blog by ID
    const singleBlog = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/blogs/${createdBlogId}`,
      method: 'GET'
    });
    assert(singleBlog.status === 200 && singleBlog.data.blog.title === newBlogPayload.title, 'GET /api/blogs/:id returns single post');

    // 11. Get Logged-in User's Blogs (/api/blogs/user/my-blogs)
    const userBlogs = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/blogs/user/my-blogs',
      method: 'GET',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(userBlogs.status === 200 && userBlogs.data.blogs.some(b => b._id === createdBlogId), 'GET /api/blogs/user/my-blogs returns user blogs');

    // 12. Update Blog Post (PUT /api/blogs/:id)
    const updateBlogRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/blogs/${createdBlogId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${demoToken}`
        }
      },
      {
        title: 'Updated Automated Test Blog Article Title'
      }
    );
    assert(updateBlogRes.status === 200 && updateBlogRes.data.blog.title === 'Updated Automated Test Blog Article Title', 'PUT /api/blogs/:id updates blog title');

    // 13. Forbidden Update by different user
    const forbiddenUpdate = await request(
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
        title: 'Hacked Title'
      }
    );
    assert(forbiddenUpdate.status === 403, 'PUT /api/blogs/:id by non-author returns 403 Forbidden');

    // 14. Delete Blog Post (DELETE /api/blogs/:id)
    const deleteRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/blogs/${createdBlogId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(deleteRes.status === 200, 'DELETE /api/blogs/:id deletes post');

    // 15. Verify Blog is Deleted
    const getDeleted = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/blogs/${createdBlogId}`,
      method: 'GET'
    });
    assert(getDeleted.status === 404, 'GET /api/blogs/:id on deleted post returns 404');

    console.log('\n=============================================');
    console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('=============================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

// Wait for server to boot, then run tests
setTimeout(runTests, 1500);
