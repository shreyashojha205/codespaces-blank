const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('Connected to Redis');
});

module.exports = {
  redisClient,
};
