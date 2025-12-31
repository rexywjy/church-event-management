import argon2 from 'argon2';
import { query } from '../config/database.js';

export default async function authRoutes(fastify) {
  fastify.post('/signup', async (request, reply) => {
    const { email, password, name, nij, class: userClass, gender, district, address, dateOfBirth, phone } = request.body;
    
    if (!email || !password || !name) {
      return reply.code(400).send({ error: 'Email, password, and name are required' });
    }
    
    try {
      const existingUser = await query(
        'SELECT id FROM accounts WHERE email = $1',
        [email.toLowerCase()]
      );
      
      if (existingUser.rows.length > 0) {
        return reply.code(400).send({ error: 'Email already registered' });
      }
      
      const passwordHash = await argon2.hash(password);
      
      const accountResult = await query(
        `INSERT INTO accounts (email, password_hash, role, status) 
         VALUES ($1, $2, 'user', 'pending') 
         RETURNING id, email, role, status, created_at`,
        [email.toLowerCase(), passwordHash]
      );
      
      const account = accountResult.rows[0];
      
      await query(
        `INSERT INTO user_profiles (account_id, name, nij, class, gender, district, address, date_of_birth, phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [account.id, name, nij || null, userClass || null, gender || null, district || null, address || null, dateOfBirth || null, phone || null]
      );
      
      return reply.code(201).send({
        message: 'Account created successfully. Waiting for admin approval.',
        account: {
          id: account.id,
          email: account.email,
          status: account.status
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      return reply.code(500).send({ error: 'Failed to create account' });
    }
  });
  
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }
    
    try {
      const result = await query(
        `SELECT a.id, a.email, a.password_hash, a.role, a.status, 
                p.name, p.nij, p.class, p.gender, p.district, p.address, p.date_of_birth, p.phone
         FROM accounts a
         LEFT JOIN user_profiles p ON a.id = p.account_id
         WHERE a.email = $1`,
        [email.toLowerCase()]
      );
      
      if (result.rows.length === 0) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }
      
      const user = result.rows[0];
      
      const validPassword = await argon2.verify(user.password_hash, password);
      
      if (!validPassword) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }
      
      if (user.status === 'pending') {
        return reply.code(403).send({ error: 'Account pending approval' });
      }
      
      if (user.status === 'rejected') {
        return reply.code(403).send({ error: 'Account has been rejected' });
      }
      
      if (user.status === 'disabled') {
        return reply.code(403).send({ error: 'Account has been disabled' });
      }
      
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
      });
      
      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          profile: {
            name: user.name,
            nij: user.nij,
            class: user.class,
            gender: user.gender,
            district: user.district,
            address: user.address,
            dateOfBirth: user.date_of_birth,
            phone: user.phone
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return reply.code(500).send({ error: 'Failed to login' });
    }
  });
  
  fastify.get('/me', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      const result = await query(
        `SELECT a.id, a.email, a.role, a.status, 
                p.name, p.nij, p.class, p.gender, p.district, p.address, p.date_of_birth, p.phone
         FROM accounts a
         LEFT JOIN user_profiles p ON a.id = p.account_id
         WHERE a.id = $1`,
        [request.user.id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      const user = result.rows[0];
      
      return reply.send({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: {
          name: user.name,
          nij: user.nij,
          class: user.class,
          gender: user.gender,
          district: user.district,
          address: user.address,
          dateOfBirth: user.date_of_birth,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      return reply.code(500).send({ error: 'Failed to get user' });
    }
  });
}
