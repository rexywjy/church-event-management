import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { authenticate, requireRole } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';
import attendanceRoutes from './routes/attendance.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
});

fastify.decorate('authenticate', authenticate);
fastify.decorate('requireRole', requireRole);

fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(userRoutes, { prefix: '/api/users' });
await fastify.register(adminRoutes, { prefix: '/api/admin' });
await fastify.register(profileRoutes, { prefix: '/api/profile' });
await fastify.register(eventRoutes, { prefix: '/api/events' });
await fastify.register(registrationRoutes, { prefix: '/api' });
await fastify.register(attendanceRoutes, { prefix: '/api' });

const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    await fastify.listen({ port, host });
    
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📝 Health check: http://${host}:${port}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
