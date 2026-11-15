/**
 * ============================================================================
 * BLOGVERSE - AUTHENTICATION MODULE (auth.js)
 * Handles user registration, login, logout, password visibility, and route guards.
 * Uses localStorage for persistent client-side session management.
 * ============================================================================
 */

// Storage Keys
const USERS_STORAGE_KEY = 'blogverse_users';
const CURRENT_USER_KEY = 'blogverse_current_user';

// Default Demo User for easy testing and evaluation
const DEFAULT_DEMO_USER = {
  id: 'usr_demo_01',
  name: 'Alex Rivera',
  email: 'demo@example.com',
  password: 'password123',
  avatar: 'AR',
  role: 'Author & Senior Engineer',
  joinedDate: '2024-01-15'
};

/**
 * Initialize default users in localStorage if not already present
 */
function initUsersStorage() {
  const users = getUsersFromStorage();
  if (users.length === 0) {
    saveUsersToStorage([DEFAULT_DEMO_USER]);
  }
}

/**
 * Retrieve all registered users from localStorage
 * @returns {Array} Array of user objects
 */
function getUsersFromStorage() {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading users from localStorage:', err);
    return [];
  }
}

/**
 * Save users list to localStorage
 * @param {Array} users 
 */
function saveUsersToStorage(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
}

/**
 * Get current authenticated user
 * @returns {Object|null} User object or null if not logged in
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
 * Set current authenticated user
 * @param {Object} user 
 */
function setCurrentUser(user) {
  try {
    // Save without password
    const safeUser = { ...user };
    delete safeUser.password;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  } catch (err) {
    console.error('Error saving current user:', err);
  }
}

/**
 * Log out current user and redirect to home
 */
function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  if (typeof showToast === 'function') {
    showToast('You have been logged out successfully.', 'info');
  }
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

/**
 * Authenticate user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { success: boolean, message: string, user?: Object }
 */
function loginUser(email, password) {
  initUsersStorage();
  const users = getUsersFromStorage();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, message: 'No account found with this email address.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  setCurrentUser(user);
  return { success: true, message: `Welcome back, ${user.name}!`, user };
}

/**
 * Register a new user
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { success: boolean, message: string, user?: Object }
 */
function registerUser(name, email, password) {
  initUsersStorage();
  const users = getUsersFromStorage();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  // Generate initials for avatar
  const initials = name
    .trim()
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'U';

  const newUser = {
    id: 'usr_' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password: password,
    avatar: initials,
    role: 'Member & Writer',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  saveUsersToStorage(users);
  setCurrentUser(newUser);

  return { success: true, message: 'Account created successfully! Welcome to Blogverse.', user: newUser };
}

/**
 * Require authentication guard: redirects to login if user is guest
 */
function requireAuth(redirectBack = true) {
  const user = getCurrentUser();
  if (!user) {
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
 * Redirect away if already logged in (used on login and register pages)
 */
function redirectIfAuth() {
  const user = getCurrentUser();
  if (user) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || 'dashboard.html';
    window.location.href = redirect;
  }
}

/**
 * Helper to setup password show/hide toggles on inputs
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

      // Switch icon
      btn.innerHTML = isPassword
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
}

/**
 * Setup Demo Account Quick Fill Button
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
        showToast('Demo credentials filled! Click Log In to continue.', 'info');
      }
    }
  });
}

/**
 * Handle Login Form Validation & Submission
 */
function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    let isValid = true;

    // Reset errors
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

    // Perform Login
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Signing in...';

    const result = loginUser(emailVal, passwordVal);

    setTimeout(() => {
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
        }, 600);
      } else {
        if (typeof showToast === 'function') {
          showToast(result.message, 'error');
        }
        passwordError.textContent = result.message;
        passwordInput.classList.add('is-invalid');
      }
    }, 400);
  });
}

/**
 * Handle Registration Form Validation & Submission
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

  // Live password strength indicator
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

  form.addEventListener('submit', (e) => {
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

    // Terms agreement check
    if (termsCheckbox && !termsCheckbox.checked) {
      termsError.textContent = 'You must agree to the Terms of Service to register.';
      isValid = false;
    }

    if (!isValid) return;

    // Submit
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating account...';

    const result = registerUser(nameVal, emailVal, passwordVal);

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      if (result.success) {
        if (typeof showToast === 'function') {
          showToast(result.message, 'success');
        }
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      } else {
        if (typeof showToast === 'function') {
          showToast(result.message, 'error');
        }
        emailError.textContent = result.message;
        emailInput.classList.add('is-invalid');
      }
    }, 450);
  });
}

// Global initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initUsersStorage();
  setupPasswordToggles();
  setupDemoLoginHelper();
  setupLoginForm();
  setupRegisterForm();
});
