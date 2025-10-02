const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const setupMiddleware = (app) => {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://stackpath.bootstrapcdn.com", 
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com"
        ],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://ajax.googleapis.com", 
          "https://stackpath.bootstrapcdn.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com"
        ],
        fontSrc: [
          "'self'", 
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            frameSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: [
          "'self'",
          "https://ajax.googleapis.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com"
        ]
      }
    }
  }));

  // CORS configuration (supports multiple origins via ALLOWED_ORIGINS)
  const parseOrigins = (val) =>
    (val || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

  const defaultDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? parseOrigins(process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL)
    : [...defaultDevOrigins, ...parseOrigins(process.env.ALLOWED_ORIGINS)];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server and tools
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging in development
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }
};

module.exports = { setupMiddleware };