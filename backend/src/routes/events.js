import { query } from '../config/database.js';

export default async function eventRoutes(fastify) {
  fastify.get('/', { preHandler: fastify.authenticate }, async (request, reply) => {
    try {
      let eventsQuery;
      let params = [];
      
      if (request.user.role === 'admin' || request.user.role === 'superadmin') {
        eventsQuery = `
          SELECT e.*, 
                 (SELECT COUNT(*) FROM event_sessions WHERE event_id = e.id) as session_count,
                 (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registered_count,
                 (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'waitlisted') as waitlisted_count
          FROM events e
          ORDER BY e.created_at DESC
        `;
      } else {
        eventsQuery = `
          SELECT e.*, 
                 (SELECT COUNT(*) FROM event_sessions WHERE event_id = e.id) as session_count,
                 (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registered_count,
                 (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'waitlisted') as waitlisted_count
          FROM events e
          WHERE e.enabled = true
          ORDER BY e.created_at DESC
        `;
      }
      
      const result = await query(eventsQuery, params);
      
      return reply.send(result.rows);
    } catch (error) {
      console.error('Get events error:', error);
      return reply.code(500).send({ error: 'Failed to get events' });
    }
  });
  
  fastify.get('/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const eventResult = await query(
        `SELECT e.*, 
                (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registered_count,
                (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'waitlisted') as waitlisted_count
         FROM events e
         WHERE e.id = $1`,
        [id]
      );
      
      if (eventResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Event not found' });
      }
      
      const event = eventResult.rows[0];
      
      if (!event.enabled && request.user.role === 'user') {
        return reply.code(404).send({ error: 'Event not found' });
      }
      
      const sessionsResult = await query(
        `SELECT * FROM event_sessions 
         WHERE event_id = $1 
         ORDER BY start_time ASC`,
        [id]
      );
      
      event.sessions = sessionsResult.rows;
      
      const userRegistration = await query(
        `SELECT * FROM event_registrations 
         WHERE event_id = $1 AND user_id = $2`,
        [id, request.user.id]
      );
      
      event.user_registration = userRegistration.rows[0] || null;
      
      return reply.send(event);
    } catch (error) {
      console.error('Get event error:', error);
      return reply.code(500).send({ error: 'Failed to get event' });
    }
  });
  
  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    const { title, description, enabled, registrationOpen, registrationLimit, attendanceEnabled, contactPersons, eventUrl, location, sessions } = request.body;
    
    if (!title) {
      return reply.code(400).send({ error: 'Title is required' });
    }
    
    if (!sessions || sessions.length === 0) {
      return reply.code(400).send({ error: 'At least one session is required' });
    }
    
    try {
      const eventResult = await query(
        `INSERT INTO events (title, description, enabled, registration_open, registration_limit, attendance_enabled, contact_persons, event_url, location, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [title, description || null, enabled ?? true, registrationOpen ?? false, registrationLimit || null, attendanceEnabled ?? true, contactPersons ? JSON.stringify(contactPersons) : null, eventUrl || null, location || null, request.user.id]
      );
      
      const event = eventResult.rows[0];
      
      for (const session of sessions) {
        await query(
          `INSERT INTO event_sessions (event_id, session_name, start_time, end_time)
           VALUES ($1, $2, $3, $4)`,
          [event.id, session.sessionName || null, session.startTime, session.endTime]
        );
      }
      
      const sessionsResult = await query(
        `SELECT * FROM event_sessions WHERE event_id = $1 ORDER BY start_time ASC`,
        [event.id]
      );
      
      event.sessions = sessionsResult.rows;
      
      return reply.code(201).send({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      return reply.code(500).send({ error: 'Failed to create event' });
    }
  });
  
  fastify.put('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    const { title, description, enabled, registrationOpen, registrationLimit, attendanceEnabled, contactPersons, eventUrl, location, sessions } = request.body;
    
    // Check if event is disabled and user is not superadmin
    const eventCheck = await query('SELECT enabled FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length > 0 && eventCheck.rows[0].enabled === false && request.user.role !== 'superadmin') {
      return reply.code(403).send({ error: 'Only superadmin can edit disabled events' });
    }
    
    try {
      const eventResult = await query(
        `UPDATE events 
         SET title = COALESCE($1, title), 
             description = COALESCE($2, description),
             enabled = COALESCE($3, enabled),
             registration_open = COALESCE($4, registration_open),
             registration_limit = $5,
             attendance_enabled = COALESCE($6, attendance_enabled),
             contact_persons = COALESCE($7, contact_persons),
             event_url = COALESCE($8, event_url),
             location = COALESCE($9, location),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $10
         RETURNING *`,
        [title, description, enabled, registrationOpen, registrationLimit, attendanceEnabled, contactPersons ? JSON.stringify(contactPersons) : null, eventUrl, location, id]
      );
      
      if (eventResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Event not found' });
      }
      
      if (sessions && sessions.length > 0) {
        await query('DELETE FROM event_sessions WHERE event_id = $1', [id]);
        
        for (const session of sessions) {
          await query(
            `INSERT INTO event_sessions (event_id, session_name, start_time, end_time)
             VALUES ($1, $2, $3, $4)`,
            [id, session.sessionName || null, session.startTime, session.endTime]
          );
        }
      }
      
      const event = eventResult.rows[0];
      
      const sessionsResult = await query(
        `SELECT * FROM event_sessions WHERE event_id = $1 ORDER BY start_time ASC`,
        [id]
      );
      
      event.sessions = sessionsResult.rows;
      
      return reply.send({
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      console.error('Update event error:', error);
      return reply.code(500).send({ error: 'Failed to update event' });
    }
  });
  
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole('superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const result = await query(
        'DELETE FROM events WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Event not found' });
      }
      
      return reply.send({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      return reply.code(500).send({ error: 'Failed to delete event' });
    }
  });
}
