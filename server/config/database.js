const mongoose = require('mongoose');

// Helper: sanitize connection string for logs
function maskMongoUri(uri) {
  if (!uri) return '';
  return uri.replace(/(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)@/i, (m, p1, _p2, user) => `${p1}${user}:****@`);
}

function validateMongoUri(uri) {
  if (!uri) return { ok: false, reason: 'Missing MONGODB_URI' };
  const isSrv = uri.startsWith('mongodb+srv://');
  try {
    // Extract host portion between scheme and first '/'
    const afterScheme = uri.replace(/^mongodb(\+srv)?:\/\//i, '');
    const host = afterScheme.split('/')[0];
    if (isSrv) {
      // SRV requires a DNS name with a dot
      if (!host.includes('.')) {
        return { ok: false, reason: 'mongodb+srv URI must use a DNS hostname with a TLD (e.g., cluster0.abcde.mongodb.net)' };
      }
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'Invalid MongoDB URI format' };
  }
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://localhost:27017/portfolio-cms');
  const validation = validateMongoUri(uri);
  if (!validation.ok) {
    console.error('❌ MongoDB URI validation failed:', validation.reason);
    console.error('Set a valid Atlas connection string in MONGODB_URI, e.g.:');
    console.error('  mongodb+srv://<user>:<pass>@cluster0.abcde.mongodb.net/portfolio_cms?retryWrites=true&w=majority');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`📦 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Tried connecting with:', maskMongoUri(uri));
    process.exit(1);
  }
};

// Connection lifecycle logs (optional)
mongoose.connection.on('error', (err) => console.error('Mongo connection error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('Mongo disconnected'));

module.exports = { connectDB };