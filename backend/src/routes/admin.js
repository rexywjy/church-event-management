import argon2 from 'argon2';
import { query } from '../config/database.js';

export default async function adminRoutes(fastify) {
  fastify.post('/create-user', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { email, password, name, role, nij, class: userClass, gender, district, address, dateOfBirth, phone } = request.body;
    
    if (!email || !password || !name) {
      return reply.code(400).send({ error: 'Email, password, and name are required' });
    }
    
    if (!['user', 'admin'].includes(role)) {
      return reply.code(400).send({ error: 'Invalid role. Must be user or admin' });
    }
    
    try {
      const existingUser = await query(
        'SELECT id FROM accounts WHERE email = $1',
        [email.toLowerCase()]
      );
      
      if (existingUser.rows.length > 0) {
        return reply.code(400).send({ error: 'Email already exists' });
      }
      
      const passwordHash = await argon2.hash(password);
      
      const accountResult = await query(
        `INSERT INTO accounts (email, password_hash, role, status) 
         VALUES ($1, $2, $3, 'approved') 
         RETURNING id, email, role, status`,
        [email.toLowerCase(), passwordHash, role]
      );
      
      const account = accountResult.rows[0];
      
      await query(
        `INSERT INTO user_profiles (account_id, name, nij, class, gender, district, address, date_of_birth, phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [account.id, name, nij || null, userClass || null, gender || null, district || null, address || null, dateOfBirth || null, phone || null]
      );
      
      return reply.code(201).send({
        message: 'User created successfully',
        user: {
          id: account.id,
          email: account.email,
          role: account.role,
          status: account.status
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      return reply.code(500).send({ error: 'Failed to create user' });
    }
  });

  fastify.put('/edit-user/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    const { email, password, name, role, nij, class: userClass, gender, district, address, dateOfBirth, phone, status } = request.body;
    
    if (!email || !name) {
      return reply.code(400).send({ error: 'Email and name are required' });
    }
    
    if (role && !['user', 'admin'].includes(role)) {
      return reply.code(400).send({ error: 'Invalid role. Must be user or admin' });
    }

    if (status && !['pending', 'approved', 'rejected', 'disabled'].includes(status)) {
      return reply.code(400).send({ error: 'Invalid status' });
    }
    
    try {
      const existingUser = await query(
        'SELECT id FROM accounts WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      
      if (existingUser.rows.length > 0) {
        return reply.code(400).send({ error: 'Email already exists' });
      }

      let updateQuery = 'UPDATE accounts SET email = $1';
      let params = [email.toLowerCase()];
      let paramCount = 1;

      if (role) {
        paramCount++;
        updateQuery += `, role = $${paramCount}`;
        params.push(role);
      }

      if (status) {
        paramCount++;
        updateQuery += `, status = $${paramCount}`;
        params.push(status);
      }

      if (password) {
        const argon2 = await import('argon2');
        const passwordHash = await argon2.default.hash(password);
        paramCount++;
        updateQuery += `, password_hash = $${paramCount}`;
        params.push(passwordHash);
      }

      paramCount++;
      updateQuery += `, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, email, role, status`;
      params.push(id);

      const accountResult = await query(updateQuery, params);
      
      if (accountResult.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      await query(
        `UPDATE user_profiles 
         SET name = $1, nij = $2, class = $3, gender = $4, district = $5, 
             address = $6, date_of_birth = $7, phone = $8, updated_at = CURRENT_TIMESTAMP
         WHERE account_id = $9`,
        [name, nij || null, userClass || null, gender || null, district || null, address || null, dateOfBirth || null, phone || null, id]
      );
      
      return reply.send({
        message: 'User updated successfully',
        user: accountResult.rows[0]
      });
    } catch (error) {
      console.error('Edit user error:', error);
      return reply.code(500).send({ error: 'Failed to update user' });
    }
  });
}
