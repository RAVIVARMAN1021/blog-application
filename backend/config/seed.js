const User = require('../models/User');
const Blog = require('../models/Blog');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('🌱 Seeding initial demo users and articles into database...');

    // Create demo user
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'demo@example.com',
      password: 'password123',
      role: 'Author & Senior Engineer',
      avatar: 'AR'
    });

    const elena = await User.create({
      name: 'Elena Rostova',
      email: 'elena@example.com',
      password: 'password123',
      role: 'UI/UX Architect',
      avatar: 'ER'
    });

    const sarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'Tech Lead',
      avatar: 'SJ'
    });

    // Create initial blogs
    await Blog.create([
      {
        title: 'The Future of Frontend Development: Trends to Watch in 2025 and Beyond',
        category: 'Technology',
        excerpt: 'Explore how WebAssembly, edge rendering, component-driven architectures, and AI-assisted tooling are reshaping how modern user interfaces are crafted.',
        content: `
          <p>The frontend ecosystem never stands still. Over the past few years, the velocity of innovation in web standards, browser rendering engines, and developer toolchains has reached an extraordinary peak. As engineers building experiences for millions of users worldwide, staying ahead of these shifts is no longer optional—it is essential.</p>
          <h2>1. The Rise of Sub-Millisecond Edge Rendering</h2>
          <p>Modern users demand instant responsiveness. Traditional server-side rendering often suffered from latency bottlenecks when servers were physically distant from the user. Edge computing has turned this model upside down by running compute nodes at hundreds of globally distributed points of presence.</p>
          <blockquote>"The fastest request is the one that travels the shortest geographical distance. Compute at the edge is the new default baseline."</blockquote>
          <h2>2. WebAssembly and Native Performance on the Web</h2>
          <p>WebAssembly (WASM) is continuing its progression from experimental feature to production workhorse. From in-browser video editors like Figma to heavy 3D rendering engines and database clients, WASM unlocks speeds previously reserved strictly for compiled desktop software.</p>
        `,
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        author: demoUser._id,
        status: 'published',
        featured: true,
        likes: 42,
        views: 310
      },
      {
        title: 'Mastering Modern CSS: From Flexbox and Grid to Container Queries',
        category: 'Design',
        excerpt: 'A deep dive into building bulletproof responsive layouts without needing bloated CSS frameworks or excessive media query breakpoints.',
        content: `
          <p>CSS has evolved drastically over the last decade. Modern vanilla CSS provides native layout systems that are cleaner, faster, and dramatically easier to maintain.</p>
          <h2>Flexbox vs. CSS Grid: Knowing When to Choose What</h2>
          <p>Flexbox is inherently one-dimensional—it aligns items along either a row or a column. CSS Grid is two-dimensional—handling rows and columns simultaneously with mathematical precision.</p>
        `,
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        author: elena._id,
        status: 'published',
        featured: false,
        likes: 29,
        views: 185
      },
      {
        title: 'Building Resilient Web Applications with Vanilla JavaScript and Web APIs',
        category: 'Coding',
        excerpt: 'Learn how to leverage native browser APIs, DOM events, and client-side storage to build lightning-fast web applications with zero external dependencies.',
        content: `
          <p>Framework fatigue is real. While React, Vue, and Angular certainly have their place, understanding the fundamental mechanics of the browser DOM and modern JavaScript standards makes you an extraordinarily more versatile engineer.</p>
        `,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        author: demoUser._id,
        status: 'published',
        featured: false,
        likes: 38,
        views: 240
      },
      {
        title: 'Architecting Scalable Microservices with Event-Driven Design',
        category: 'Technology',
        excerpt: 'Draft notes on decoupling distributed systems, asynchronous message queues, and designing fault-tolerant communication pipelines.',
        content: `
          <p>This draft outlines core tenets of asynchronous messaging patterns, idempotency keys, and avoiding distributed transactions across decoupled boundaries.</p>
        `,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        author: demoUser._id,
        status: 'draft',
        featured: false,
        likes: 0,
        views: 12
      },
      {
        title: 'A Remote Worker’s Guide to Peak Focus and Burnout Prevention',
        category: 'Lifestyle',
        excerpt: 'Actionable strategies for structuring your day, establishing ruthless boundaries between work and rest, and maintaining creative energy.',
        content: `
          <p>Working remotely grants unmatched autonomy, but without intentional structure, the home can quickly become a 24-hour workplace. Setting physical and psychological boundaries protects both your career trajectory and mental wellbeing.</p>
        `,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        author: sarah._id,
        status: 'published',
        featured: false,
        likes: 54,
        views: 380
      }
    ]);

    console.log('✅ Initial database seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedDatabase;
