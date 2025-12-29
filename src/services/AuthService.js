const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthService {
  async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await db.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    // Create session in Redis
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await db.redis.setEx(`session:${user.id}`, 86400, token);
    
    return { user, token };
  }

  async login(email, password) {
    const user = await db.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true
      }
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Store session
    await db.redis.setEx(`session:${user.id}`, 86400, token);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async validateSession(userId) {
    return await db.redis.get(`session:${userId}`);
  }
}

module.exports = new AuthService();