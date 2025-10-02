// Demo Data Seeder
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
const Project = require('./server/models/Project');
const Blog = require('./server/models/Blog');
const Resume = require('./server/models/Resume');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/portfolio-cms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...');

    // Check if demo user already exists
    let demoUser = await User.findOne({ username: 'demo-user' });
    if (demoUser) {
      console.log('✅ Demo user already exists');
    } else {
      // Create demo user
      const hashedPassword = await bcrypt.hash('demo123', 12);
      
      demoUser = new User({
        username: 'demo-user',
        email: 'demo@portfoliocms.com',
        password: hashedPassword,
        role: 'user',
        isActive: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          title: 'Full Stack Developer',
          bio: 'Passionate full-stack developer with 5+ years of experience building modern web applications. I love creating efficient, scalable solutions and learning new technologies.',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          website: 'https://johndoe.dev',
          skills: [
            'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js',
            'MongoDB', 'PostgreSQL', 'Python', 'Docker', 'AWS',
            'GraphQL', 'Redux', 'Next.js', 'Vue.js', 'Angular'
          ],
          socialLinks: {
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe',
            twitter: 'https://twitter.com/johndoe',
            instagram: 'https://instagram.com/johndoe_dev'
          }
        }
      });

      await demoUser.save();
      console.log('✅ Created demo user');
    }

    // Check if projects already exist
    const existingProjects = await Project.find({ userId: demoUser._id });
    if (existingProjects.length === 0) {
      // Create demo projects
      const projects = [
      {
        title: 'E-Commerce Platform',
        description: 'A modern e-commerce platform built with React and Node.js, featuring real-time inventory management, payment processing, and admin dashboard.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux'],
        category: 'web',
        status: 'completed',
        featured: true,
        liveUrl: 'https://demo-ecommerce.com',
        githubUrl: 'https://github.com/johndoe/ecommerce-platform',
        userId: demoUser._id
      },
      {
        title: 'Task Management App',
        description: 'A collaborative task management application with real-time updates, team collaboration features, and advanced project tracking.',
        technologies: ['Vue.js', 'Express.js', 'PostgreSQL', 'Socket.io'],
        category: 'web',
        status: 'completed',
        featured: false,
        liveUrl: 'https://demo-taskmanager.com',
        githubUrl: 'https://github.com/johndoe/task-manager',
        userId: demoUser._id
      },
      {
        title: 'Mobile Weather App',
        description: 'Cross-platform mobile application providing detailed weather forecasts, interactive maps, and personalized weather alerts.',
        technologies: ['React Native', 'TypeScript', 'Redux', 'Weather API'],
        category: 'mobile',
        status: 'completed',
        featured: true,
        githubUrl: 'https://github.com/johndoe/weather-app',
        userId: demoUser._id
      }
    ];

    for (const projectData of projects) {
      const project = new Project(projectData);
      await project.save();
    }
    console.log('✅ Created demo projects');

    // Create demo blog posts
    const blogs = [
      {
        title: 'Building Scalable Web Applications with Node.js',
        slug: 'building-scalable-web-applications-with-nodejs',
        content: `
          <h2>Introduction</h2>
          <p>Node.js has revolutionized server-side development by bringing JavaScript to the backend. In this post, we'll explore best practices for building scalable applications.</p>
          
          <h2>Key Principles</h2>
          <ul>
            <li>Asynchronous programming patterns</li>
            <li>Microservices architecture</li>
            <li>Proper error handling</li>
            <li>Database optimization</li>
          </ul>
          
          <h2>Performance Optimization</h2>
          <p>Performance is crucial for scalable applications. Here are some strategies:</p>
          <p>1. Use clustering to take advantage of multi-core systems</p>
          <p>2. Implement caching strategies with Redis</p>
          <p>3. Optimize database queries and use indexing</p>
          
          <h2>Conclusion</h2>
          <p>Building scalable Node.js applications requires careful planning and implementation of best practices. Start with a solid foundation and iterate as you grow.</p>
        `,
        excerpt: 'Learn best practices for building scalable web applications with Node.js, including performance optimization and architectural patterns.',
        category: 'programming',
        tags: ['Node.js', 'JavaScript', 'Backend', 'Scalability'],
        status: 'published',
        featured: true,
        userId: demoUser._id
      },
      {
        title: 'The Future of Frontend Development',
        slug: 'the-future-of-frontend-development',
        content: `
          <h2>Evolution of Frontend</h2>
          <p>Frontend development has come a long way from simple HTML and CSS. Today's frontend developers work with complex frameworks and tools.</p>
          
          <h2>Emerging Trends</h2>
          <ul>
            <li>Component-based architecture</li>
            <li>JAMstack approach</li>
            <li>Progressive Web Apps</li>
            <li>WebAssembly integration</li>
          </ul>
          
          <h2>Tools and Frameworks</h2>
          <p>The modern frontend ecosystem includes powerful tools like React, Vue, Angular, and build tools like Vite and Webpack.</p>
          
          <h2>What's Next?</h2>
          <p>The future holds exciting possibilities with AI-assisted development, better performance optimization, and more intuitive developer experiences.</p>
        `,
        excerpt: 'Explore the current state and future trends in frontend development, from modern frameworks to emerging technologies.',
        category: 'technology',
        tags: ['Frontend', 'React', 'Web Development', 'Future'],
        status: 'published',
        featured: false,
        userId: demoUser._id
      }
    ];

    for (const blogData of blogs) {
      const blog = new Blog(blogData);
      await blog.save();
    }
    console.log('✅ Created demo blog posts');

    console.log('🎉 Demo data seeded successfully!');
    console.log('📄 You can now visit: http://localhost:3000/#!/portfolio/demo-user');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();