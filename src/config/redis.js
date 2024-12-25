// config/redis.js
const Redis = require('ioredis');

// Create a Redis instance
const redis = new Redis({
  host: 'localhost',  // Redis host
  port: 6379,         // Redis port
 // password: 'your-password', // Redis password if required
  db: 0,              // Database number (default is 0)
});

// Error handling for Redis connection
redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Optionally, log a successful connection
redis.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redis; // Export the redis instance
