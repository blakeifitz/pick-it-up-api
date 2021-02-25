module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://blakefitzpatrick@localhost/pick-it-up',
  JWT_SECRET: process.env.JWT_SECRET || 'pick-it-up-jwt-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
};
