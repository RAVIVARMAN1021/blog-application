# Blogverse – Modern Responsive Blog Application

> A complete, modern, responsive frontend Blog Application built strictly using **vanilla HTML5, CSS3, and JavaScript (ES6+)** with zero external framework dependencies.

---

## 🌟 Project Highlights & Features

- **100% Vanilla Tech Stack**: Pure HTML5, modern CSS3 (Custom Properties, Flexbox, Grid), and modular JavaScript. No React, no Bootstrap, no Tailwind CSS.
- **Client-Side Persistence**: Complete CRUD operations, authentication sessions, like counters, views, and comments saved in `localStorage`.
- **Pre-Loaded Demo User & Sample Content**: Ready to test immediately without manual database setup.
- **Dark & Light Mode**: Seamless theme switcher persisted across page reloads.
- **Fully Responsive**: Crafted with modern mobile-first principles, optimized for desktop, tablet, and mobile screens.
- **Full Article Reader Modal**: Read complete stories, leave interactive comments, and like articles without leaving the page.
- **Rich Content Editor**: Markdown-style formatting toolbar (Bold, Italic, H2, H3, Blockquotes, Code Blocks, Lists, Links) with a Live Preview tab.
- **Image Flexibility**: Supports remote web URLs, one-click preset collections, or local image file uploads via `FileReader` (Base64).

---

## 📂 Project Structure

```text
blog-application/
│
├── index.html            # Home page (Hero, search, categories, featured, latest posts)
├── login.html            # User login with form validation & demo auto-fill
├── register.html         # User registration with password strength meter
├── dashboard.html        # Author dashboard with dynamic stats & post management
├── create-blog.html      # Create and edit blog posts with rich formatting & preview
│
├── css/
│   └── style.css         # Complete CSS stylesheet with design tokens & responsive queries
│
├── js/
│   ├── auth.js           # Authentication, session guards, and user store
│   ├── blog.js           # Blog CRUD operations, seed data, and editor logic
│   ├── dashboard.js      # Dashboard stats, table rendering, search, and delete modal
│   └── main.js           # Theme switcher, navbar state, toasts, and article reader modal
│
└── assets/
    └── images/
        └── logo.svg      # Custom brand vector logo
```

---

## 📄 Pages Breakdown

### 1. Home Page (`index.html`)
- **Sticky Glassmorphic Navigation Bar**: Responsive brand logo, navigation links, theme toggle, dynamic auth buttons (or user profile dropdown if signed in), and mobile hamburger drawer.
- **Hero Section**: Engaging headline, description, quick CTA buttons, and an interactive live search bar.
- **Category Filter Bar**: Dynamic category pills (`All`, `Technology`, `Design`, `Coding`, `Lifestyle`, `Career`, `AI & Data`) showing live post counts.
- **Editor's Spotlight**: Highlighted featured story with reading time and author credentials.
- **Latest Articles Grid**: Responsive card grid with lazy-loaded thumbnails, category badges, author avatars, reading times, and smooth hover micro-interactions.
- **Full Article Reader Modal**: Clicking any card opens the article overlay with styled typography, like counter, and a persistent comments section.
- **Newsletter Subscription**: Callout box with feedback toast notification.
- **Modern Footer**: Multi-column footer with social media icons and navigation shortcuts.

### 2. Login Page (`login.html`)
- Email & password input fields with clean floating focus rings.
- **Show/Hide Password** toggle button.
- **1-Click Auto-Fill Demo Button**: Evaluators can instantly test the demo account (`demo@example.com` / `password123`) without typing.
- Real-time client-side form validation with inline error messages and toast alerts.
- Smooth redirection to destination page upon successful authentication.

### 3. Register Page (`register.html`)
- Full Name, Email, Password, and Confirm Password fields.
- **Interactive Password Strength Meter**: Live color progress bar (Weak, Medium, Strong) as the user types.
- Password matching validation and minimum length checks.
- Terms of service agreement checkbox.
- Automatically initializes user session and redirects to the author dashboard.

### 4. Author Dashboard (`dashboard.html`)
- **Personalized Greeting**: Welcomes the authenticated user by name.
- **4 Live Metric Cards**:
  - Total Blogs
  - Published Blogs
  - Draft Blogs
  - Total Reads / Views
- **Status Filter Tabs**: Switch between `All Posts`, `Published`, and `Drafts`.
- **Search Within Posts**: Instant filtering of user-created content.
- **Interactive Post Table**:
  - Thumbnail, title, category badge, and status pill.
  - **Preview Button**: Opens full reader modal.
  - **Quick Status Toggle**: Instantly switch between *Published* and *Draft*.
  - **Edit Button**: Navigates to `create-blog.html?id=[postId]` with pre-filled fields.
  - **Delete Button**: Opens custom confirmation modal before deleting from `localStorage`.

### 5. Create & Edit Blog Page (`create-blog.html`)
- **Dual Mode**: Handles both creating new posts and editing existing posts.
- **Formatting Toolbar**: Quick-insert buttons for Bold, Italic, H2, H3, Blockquotes, Code Blocks, Bullet Lists, and Web Links.
- **Live HTML Preview Tab**: Switch between "Write" and "Live Preview" to inspect typography and layout before publishing.
- **Featured Image Options**:
  - Web Image URL input with instant preview.
  - Local Image Upload (`<input type="file">` converted to Base64 data URL).
  - One-click Preset Tags (Tech, Code, Design, Desk, AI, Nature).
- **Publish vs Draft**: Choose to publish immediately or save as a draft.

---

## 🔑 Pre-Configured Demo Credentials

For quick evaluation and testing:

| Role | Email | Password |
|---|---|---|
| **Senior Engineer & Author** | `demo@example.com` | `password123` |

*(You can also register any new account on the Register page).*

---

## 🚀 How to Run the Application

Because this project is built entirely with pure client-side web standards, **no build step or `npm install` is required**.

1. **Option A (Direct in Browser)**:
   - Double-click `index.html` or open `blog-application/index.html` in Chrome, Firefox, Edge, or Safari.

2. **Option B (Using Live Server / Local HTTP Server)**:
   - In VS Code, right-click `index.html` and select **"Open with Live Server"**.
   - Or run any static web server:
     ```bash
     npx serve blog-application
     # or
     python -m http.server 8000
     ```
   - Visit `http://localhost:8000` in your browser.

---

## 🎨 Design System & CSS Architecture

- **Color Tokens**:
  - Primary: `#6366f1` (Modern Indigo)
  - Secondary: `#8b5cf6` (Vibrant Violet)
  - Accent: `#ec4899` (Pink/Magenta)
  - Published Status: `#10b981` (Emerald Green)
  - Draft Status: `#f59e0b` (Amber)
  - Danger / Error: `#ef4444` (Rose Red)
- **Typography**: Clean humanist sans-serif (`Plus Jakarta Sans` with `Inter` fallback) and monospace (`JetBrains Mono` for code blocks).
- **Responsive Layout**: Fluid breakpoints at `1024px`, `768px`, and `480px`.
