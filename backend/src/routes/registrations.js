import { query } from '../config/database.js';
import { checkRegistrationStatus, promoteFromWaitlist, reorderWaitlist } from '../services/queueService.js';

export default async function registrationRoutes(fastify) {
  fastify.get('/events/:id/registrations', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const result = await query(
        `SELECT r.*, 
                a.email, 
                p.name, p.nij, p.class, p.gender, p.district, p.phone
         FROM event_registrations r
         JOIN accounts a ON r.user_id = a.id
         LEFT JOIN user_profiles p ON a.id = p.account_id
         WHERE r.event_id = $1
         ORDER BY 
           CASE r.status 
             WHEN 'registered' THEN 1
             WHEN 'waitlisted' THEN 2
             WHEN 'cancelled' THEN 3
           END,
           r.queue_position ASC NULLS LAST,
           r.registered_at ASC`,
        [id]
      );
      
      return reply.send(result.rows);
    } catch (error) {
      console.error('Get registrations error:', error);
      return reply.code(500).send({ error: 'Failed to get registrations' });
    }
  });
  
  fastify.post('/events/:id/register', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { id } = request.params;
    const registrationData = request.body;
    
    try {
      const eventResult = await query(
        'SELECT * FROM events WHERE id = $1',
        [id]
      );
      
      if (eventResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Event not found' });
      }
      
      const event = eventResult.rows[0];
      
      if (!event.enabled) {
        return reply.code(400).send({ error: 'Event is not available' });
      }
      
      const existingRegistration = await query(
        'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2',
        [id, request.user.id]
      );
      
      if (existingRegistration.rows.length > 0) {
        const reg = existingRegistration.rows[0];
        if (reg.status === 'cancelled') {
          return reply.code(400).send({ error: 'You have cancelled this registration. Please contact admin to re-register.' });
        }
        return reply.code(400).send({ error: 'You have already registered for this event' });
      }
      
      const status = await checkRegistrationStatus(id);
      
      if (!status.canRegister) {
        return reply.code(400).send({ error: status.reason });
      }
      
      let registrationStatus = 'registered';
      let queuePosition = null;
      
      if (status.willBeWaitlisted) {
        registrationStatus = 'waitlisted';
        
        const queueResult = await query(
          `SELECT COALESCE(MAX(queue_position), 0) + 1 as next_position
           FROM event_registrations
           WHERE event_id = $1 AND status = 'waitlisted'`,
          [id]
        );
        
        queuePosition = queueResult.rows[0].next_position;
      }
      
      const result = await query(
        `INSERT INTO event_registrations (event_id, user_id, status, queue_position, registration_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, request.user.id, registrationStatus, queuePosition, JSON.stringify(registrationData)]
      );
      
      const registration = result.rows[0];
      
      return reply.code(201).send({
        message: registrationStatus === 'waitlisted' 
          ? `You have been added to the waiting list at position ${queuePosition}`
          : 'Registration successful',
        registration: {
          ...registration,
          status: registrationStatus,
          queuePosition
        }
      });
    } catch (error) {
      console.error('Register event error:', error);
      return reply.code(500).send({ error: 'Failed to register for event' });
    }
  });
  
  fastify.delete('/registrations/:id', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const registrationResult = await query(
        'SELECT * FROM event_registrations WHERE id = $1',
        [id]
      );
      
      if (registrationResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Registration not found' });
      }
      
      const registration = registrationResult.rows[0];
      
      if (registration.user_id !== request.user.id && 
          request.user.role !== 'admin' && 
          request.user.role !== 'superadmin') {
        return reply.code(403).send({ error: 'Not authorized to cancel this registration' });
      }
      
      if (registration.status === 'cancelled') {
        return reply.code(400).send({ error: 'Registration already cancelled' });
      }
      
      await query(
        `UPDATE event_registrations 
         SET status = 'cancelled', queue_position = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );
      
      if (registration.status === 'registered') {
        await promoteFromWaitlist(registration.event_id);
      } else if (registration.status === 'waitlisted') {
        await reorderWaitlist(registration.event_id);
      }
      
      return reply.send({ message: 'Registration cancelled successfully' });
    } catch (error) {
      console.error('Cancel registration error:', error);
      return reply.code(500).send({ error: 'Failed to cancel registration' });
    }
  });
  
  fastify.get('/registrations/my', {
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const result = await query(
        `SELECT r.*, e.title, e.description, e.enabled, e.registration_open,
                (SELECT COUNT(*) FROM event_sessions WHERE event_id = e.id) as session_count
         FROM event_registrations r
         JOIN events e ON r.event_id = e.id
         WHERE r.user_id = $1 AND r.status != 'cancelled'
         ORDER BY r.registered_at DESC`,
        [request.user.id]
      );
      
      return reply.send(result.rows);
    } catch (error) {
      console.error('Get my registrations error:', error);
      return reply.code(500).send({ error: 'Failed to get registrations' });
    }
  });
}
