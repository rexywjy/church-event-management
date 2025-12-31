import { query } from '../config/database.js';

export default async function profileRoutes(fastify) {
  fastify.get('/', { preHandler: fastify.authenticate }, async (request, reply) => {
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
        return reply.code(404).send({ error: 'Profile not found' });
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
      console.error('Get profile error:', error);
      return reply.code(500).send({ error: 'Failed to get profile' });
    }
  });
  
  fastify.put('/', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { name, nij, class: userClass, gender, district, address, dateOfBirth, phone } = request.body;
    
    if (!name) {
      return reply.code(400).send({ error: 'Name is required' });
    }
    
    try {
      const result = await query(
        `UPDATE user_profiles 
         SET name = $1, nij = $2, class = $3, gender = $4, district = $5, 
             address = $6, date_of_birth = $7, phone = $8, updated_at = CURRENT_TIMESTAMP
         WHERE account_id = $9
         RETURNING *`,
        [name, nij || null, userClass || null, gender || null, district || null, 
         address || null, dateOfBirth || null, phone || null, request.user.id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Profile not found' });
      }
      
      return reply.send({
        message: 'Profile updated successfully',
        profile: result.rows[0]
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return reply.code(500).send({ error: 'Failed to update profile' });
    }
  });
}
