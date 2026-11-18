/**
 * ============================================================================
 * BLOGVERSE - AUTHENTICATION MODULE (auth.js)
 * Handles user registration, login, logout, password visibility, and route guards.
 * Integrates directly with the Node.js / Express.js REST API backend.
 * Stores JWT token and user profile in client storage.
 * ============================================================================
 */

// Backend API Base URL
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// Storage Keys
const TOKEN_STORAGE_KEY = 'blogverse_token';
const CURRENT_USER_KEY = 'blogverse_current_user';

// Default Demo User credentials for convenient evaluation
const DEFAULT_DEMO_USER = {
  name: 'Alex Rivera',
  email: 'demo@example.com',
  password: 'password123'
};

/**
 * Retrieve the current JWT authentication token
 * @returns {string|null}
 */
function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.error('Error reading auth token:', err);
    return null;
  }
}

/**
 * Get current authenticated user object
 * @returns {Object|null}
 */
function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error reading current user:', err);
    return null;
  }
}

/**
 * Save user session (token and profile)
 * @param {Object} user 
 * @param {string} token 
 */
function setAuthSession(user, token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (user) {
      const safeUser = { ...user };
      delete safeUser.password;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    }
  } catch (err) {
    console.error('Error saving auth session:', err);
  }
}

/**
 * Log out current user, clear session, and redirect to home
 */
function logoutUser() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);

  if (typeof showToast === 'function') {
    showToast('You have been logged out successfully.', 'info');
  }

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

/**
 * Authenticate user with email and password via backend REST API
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} { success: boolean, message: string, user?: Object, token?: string }
 */
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password
      })
    });

    const data = await response.json();

    if (response.ok && data.success && data.token) {
      setAuthSession(data.user, data.token);
      return {
        success: true,
        message: data.message || `Welcome back, ${data.user.name}!`,
        user: data.user,
        token: data.token
      };
    } else {
      return {
        success: false,
        message: data.message || 'Login failed. Please verify your credentials.'
      };
    }
  } catch (error) {
    console.error('Backend Login API Error:', error);
    return {
      success: false,
      message: 'Unable to reach backend server. Please verify the backend server is running on port 5000.'
    };
  }
}

/**
 * Register a new user via backend REST API
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} { success: boolean, message: string, user?: Object, token?: string }
 */
async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      })
    });

    const data = await response.json();

    if (response.ok && data.success && data.token) {
      setAuthSession(data.user, data.token);
      return {
        success: true,
        message: data.message || 'Account created successfully! Welcome to Blogverse.',
        user: data.user,
        token: data.token
      };
    } else {
      return {
        success: false,
        message: data.message || 'Registration failed. Please try again.'
      };
    }
  } catch (error) {
    console.error('Backend Registration API Error:', error);
    return {
      success: false,
      message: 'Unable to reach backend server. Please verify the backend server is running on port 5000.'
    };
  }
}

/**
 * Route Guard: Redirects to login if user is not authenticated
 */
function requireAuth(redirectBack = true) {
  const token = getAuthToken();
  const user = getCurrentUser();

  if (!token || !user) {
    if (redirectBack) {
      const currentUrl = encodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
      window.location.href = `login.html?redirect=${currentUrl}`;
    } else {
      window.location.href = 'login.html';
    }
    return false;
  }
  return true;
}

/**
 * Route Guard: Redirect away from login/register if already authenticated
 */
function redirectIfAuth() {
  const token = getAuthToken();
  const user = getCurrentUser();

  if (token && user) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || 'dashboard.html';
    window.location.href = redirect;
  }
}

/**
 * Setup password show/hide eye toggle button
 */
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      btn.innerHTML = isPassword
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
}

/**
 * Quick Auto-Fill Demo Button Helper
 */
function setupDemoLoginHelper() {
  const fillBtn = document.getElementById('fill-demo-btn');
  if (!fillBtn) return;

  fillBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    if (emailInput && passwordInput) {
      emailInput.value = DEFAULT_DEMO_USER.email;
      passwordInput.value = DEFAULT_DEMO_USER.password;
      emailInput.classList.remove('is-invalid');
      passwordInput.classList.remove('is-invalid');
      emailInput.classList.add('is-valid');
      passwordInput.classList.add('is-valid');
      if (typeof showToast === 'function') {
        showToast('Demo credentials filled! Click Sign In to authenticate with backend.', 'info');
      }
    }
  });
}

/**
 * Handle Login Form Validation & Async Submission to REST API
 */
function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    let isValid = true;

    // Reset error styling
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('is-invalid', 'is-valid');
    passwordInput.classList.remove('is-invalid', 'is-valid');

    // Email validation
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      emailError.textContent = 'Email address is required.';
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      emailError.textContent = 'Please enter a valid email address.';
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput.classList.add('is-valid');
    }

    // Password validation
    const passwordVal = passwordInput.value;
    if (!passwordVal) {
      passwordError.textContent = 'Password is required.';
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else if (passwordVal.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters.';
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      passwordInput.classList.add('is-valid');
    }

    if (!isValid) return;

    // Set Loading State
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Signing in...';

    const result = await loginUser(emailVal, passwordVal);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    if (result.success) {
      if (typeof showToast === 'function') {
        showToast(result.message, 'success');
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || 'dashboard.html';
      setTimeout(() => {
        window.location.href = redirect;
      }, 500);
    } else {
      if (typeof showToast === 'function') {
        showToast(result.message, 'error');
      }
      passwordError.textContent = result.message;
      passwordInput.classList.add('is-invalid');
    }
  });
}

/**
 * Handle Registration Form Validation & Async Submission to REST API
 */
function setupRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passwordInput = document.getElementById('reg-password');
  const confirmPasswordInput = document.getElementById('reg-confirm-password');
  const termsCheckbox = document.getElementById('reg-terms');

  const nameError = document.getElementById('reg-name-error');
  const emailError = document.getElementById('reg-email-error');
  const passwordError = document.getElementById('reg-password-error');
  const confirmError = document.getElementById('reg-confirm-error');
  const termsError = document.getElementById('reg-terms-error');

  const strengthBar = document.getElementById('password-strength-bar');

  // Password strength meter
  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      strengthBar.className = 'password-strength-progress';
      if (val.length === 0) {
        strengthBar.style.width = '0%';
      } else if (val.length < 6) {
        strengthBar.classList.add('strength-weak');
      } else if (val.length >= 6 && /[0-9]/.test(val) && /[A-Z]/.test(val)) {
        strengthBar.classList.add('strength-strong');
      } else {
        strengthBar.classList.add('strength-medium');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;

    // Reset errors
    [nameError, emailError, passwordError, confirmError, termsError].forEach(el => {
      if (el) el.textContent = '';
    });
    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(el => {
      if (el) el.classList.remove('is-invalid', 'is-valid');
    });

    // Name check
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      nameError.textContent = 'Full name is required.';
      nameInput.classList.add('is-invalid');
      isValid = false;
    } else if (nameVal.length < 2) {
      nameError.textContent = 'Name must be at least 2 characters.';
      nameInput.classList.add('is-invalid');
      isValid = false;
    } else {
      nameInput.classList.add('is-valid');
    }

    // Email check
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      emailError.textContent = 'Email address is required.';
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      emailError.textContent = 'Please enter a valid email address.';
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput.classList.add('is-valid');
    }

    // Password check
    const passwordVal = passwordInput.value;
    if (!passwordVal) {
      passwordError.textContent = 'Password is required.';
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else if (passwordVal.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters.';
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      passwordInput.classList.add('is-valid');
    }

    // Confirm password check
    const confirmVal = confirmPasswordInput.value;
    if (!confirmVal) {
      confirmError.textContent = 'Please confirm your password.';
      confirmPasswordInput.classList.add('is-invalid');
      isValid = false;
    } else if (confirmVal !== passwordVal) {
      confirmError.textContent = 'Passwords do not match.';
      confirmPasswordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      confirmPasswordInput.classList.add('is-valid');
    }

    // Terms check
    if (termsCheckbox && !termsCheckbox.checked) {
      termsError.textContent = 'You must agree to the Terms of Service to register.';
      isValid = false;
    }

    if (!isValid) return;

    // Submit state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating account...';

    const result = await registerUser(nameVal, emailVal, passwordVal);

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    if (result.success) {
      if (typeof showToast === 'function') {
        showToast(result.message, 'success');
      }
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } else {
      if (typeof showToast === 'function') {
        showToast(result.message, 'error');
      }
      emailError.textContent = result.message;
      emailInput.classList.add('is-invalid');
    }
  });
}

// Global initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();
  setupDemoLoginHelper();
  setupLoginForm();
  setupRegisterForm();
});
