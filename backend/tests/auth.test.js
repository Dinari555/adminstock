import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/User.model.js';
import mongoose from 'mongoose';

describe('Auth API', () => {
  beforeAll(async () => {
    // Connect to test database
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/depot_dashboard_test?authSource=admin';
    await mongoose.connect(MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = new User({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        passwordHash: 'password123',
        role: 'employee',
      });
      await user.save();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});



