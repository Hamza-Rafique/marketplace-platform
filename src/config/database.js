const { PrismaClient } = require('@prisma/client');
const mongoose = require('mongoose');
const Redis = require('redis');

class DatabaseManager {
  constructor() {
    this.prisma = null;
    this.mongo = null;
    this.redis = null;
  }

  async connectPostgreSQL() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    await this.prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
  }

  async connectMongoDB() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.mongo = mongoose.connection;
    console.log('✅ MongoDB connected');
  }

  async connectRedis() {
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL,
    });
    
    this.redis.on('error', (err) => console.error('Redis error:', err));
    
    await this.redis.connect();
    console.log('✅ Redis connected');
  }

  async connectAll() {
    await this.connectPostgreSQL();
    await this.connectMongoDB();
    await this.connectRedis();
  }

  async disconnectAll() {
    await this.prisma?.$disconnect();
    await mongoose.disconnect();
    await this.redis?.quit();
  }
}

module.exports = new DatabaseManager();