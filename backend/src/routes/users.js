import { query } from '../config/database.js';

export default async function userRoutes(fastify) {
  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    try {
      const result = await query(
        `SELECT a.id, a.email, a.role, a.status, a.created_at,
                p.name, p.nij, p.class, p.gender, p.district, p.phone
         FROM accounts a
         LEFT JOIN user_profiles p ON a.id = p.account_id
         ORDER BY a.created_at DESC`
      );
      
      return reply.send(result.rows);
    } catch (error) {
      console.error('Get users error:', error);
      return reply.code(500).send({ error: 'Failed to get users' });
    }
  });
  
  fastify.get('/pending', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    try {
      const result = await query(
        `SELECT a.id, a.email, a.role, a.status, a.created_at,
                p.name, p.nij, p.class, p.gender, p.district, p.phone
         FROM accounts a
         LEFT JOIN user_profiles p ON a.id = p.account_id
         WHERE a.status = 'pending'
         ORDER BY a.created_at ASC`
      );
      
      return reply.send(result.rows);
    } catch (error) {
      console.error('Get pending users error:', error);
      return reply.code(500).send({ error: 'Failed to get pending users' });
    }
  });
  
  fastify.put('/:id/approve', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const result = await query(
        `UPDATE accounts SET status = 'approved', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND status = 'pending'
         RETURNING id, email, status`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found or already processed' });
      }
      
      return reply.send({
        message: 'User approved successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Approve user error:', error);
      return reply.code(500).send({ error: 'Failed to approve user' });
    }
  });
  
  fastify.put('/:id/reject', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const result = await query(
        `UPDATE accounts SET status = 'rejected', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND status = 'pending'
         RETURNING id, email, status`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found or already processed' });
      }
      
      return reply.send({
        message: 'User rejected',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Reject user error:', error);
      return reply.code(500).send({ error: 'Failed to reject user' });
    }
  });
  
  fastify.put('/:id/disable', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    if (id === request.user.id) {
      return reply.code(400).send({ error: 'Cannot disable your own account' });
    }
    
    try {
      const result = await query(
        `UPDATE accounts SET status = 'disabled', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1
         RETURNING id, email, status`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return reply.send({
        message: 'User disabled',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Disable user error:', error);
      return reply.code(500).send({ error: 'Failed to disable user' });
    }
  });
  
  fastify.put('/:id/enable', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const result = await query(
        `UPDATE accounts SET status = 'approved', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND status = 'disabled'
         RETURNING id, email, status`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found or not disabled' });
      }
      
      return reply.send({
        message: 'User enabled',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Enable user error:', error);
      return reply.code(500).send({ error: 'Failed to enable user' });
    }
  });
  
  fastify.put('/:id/role', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    const { role } = request.body;
    
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return reply.code(400).send({ error: 'Invalid role' });
    }
    
    if (id === request.user.id) {
      return reply.code(400).send({ error: 'Cannot change your own role' });
    }
    
    try {
      const result = await query(
        `UPDATE accounts SET role = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2
         RETURNING id, email, role`,
        [role, id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return reply.send({
        message: 'User role updated',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Update role error:', error);
      return reply.code(500).send({ error: 'Failed to update role' });
    }
  });
}
