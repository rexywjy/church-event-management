import { query } from '../config/database.js';

export default async function attendanceRoutes(fastify) {
  fastify.get('/sessions/:id/attendance', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const sessionResult = await query(
        `SELECT s.*, e.title as event_title, e.attendance_enabled
         FROM event_sessions s
         JOIN events e ON s.event_id = e.id
         WHERE s.id = $1`,
        [id]
      );
      
      if (sessionResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Session not found' });
      }
      
      const session = sessionResult.rows[0];
      
      if (!session.attendance_enabled) {
        return reply.code(400).send({ error: 'Attendance is not enabled for this event' });
      }
      
      const registrationsResult = await query(
        `SELECT r.id as registration_id, r.user_id, 
                a.email, 
                p.name, p.nij, p.class, p.gender, p.district, p.phone,
                att.id as attendance_id, att.recorded_at, att.notes
         FROM event_registrations r
         JOIN accounts a ON r.user_id = a.id
         LEFT JOIN user_profiles p ON a.id = p.account_id
         LEFT JOIN attendance_records att ON att.session_id = $1 AND att.user_id = r.user_id
         WHERE r.event_id = $2 AND r.status = 'registered'
         ORDER BY p.name ASC`,
        [id, session.event_id]
      );
      
      return reply.send({
        session,
        attendees: registrationsResult.rows.map(row => ({
          userId: row.user_id,
          registrationId: row.registration_id,
          email: row.email,
          name: row.name,
          nij: row.nij,
          class: row.class,
          gender: row.gender,
          district: row.district,
          phone: row.phone,
          attended: !!row.attendance_id,
          attendanceId: row.attendance_id,
          recordedAt: row.recorded_at,
          notes: row.notes
        }))
      });
    } catch (error) {
      console.error('Get session attendance error:', error);
      return reply.code(500).send({ error: 'Failed to get attendance' });
    }
  });
  
  fastify.post('/attendance', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    const { sessionId, userId, notes } = request.body;
    
    if (!sessionId || !userId) {
      return reply.code(400).send({ error: 'Session ID and User ID are required' });
    }
    
    try {
      const sessionResult = await query(
        `SELECT s.*, e.attendance_enabled
         FROM event_sessions s
         JOIN events e ON s.event_id = e.id
         WHERE s.id = $1`,
        [sessionId]
      );
      
      if (sessionResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Session not found' });
      }
      
      const session = sessionResult.rows[0];
      
      if (!session.attendance_enabled) {
        return reply.code(400).send({ error: 'Attendance is not enabled for this event' });
      }
      
      const registrationResult = await query(
        `SELECT * FROM event_registrations 
         WHERE event_id = $1 AND user_id = $2 AND status = 'registered'`,
        [session.event_id, userId]
      );
      
      if (registrationResult.rows.length === 0) {
        return reply.code(400).send({ error: 'User is not registered for this event' });
      }
      
      const existingAttendance = await query(
        'SELECT * FROM attendance_records WHERE session_id = $1 AND user_id = $2',
        [sessionId, userId]
      );
      
      if (existingAttendance.rows.length > 0) {
        return reply.code(400).send({ error: 'Attendance already recorded for this user' });
      }
      
      const result = await query(
        `INSERT INTO attendance_records (session_id, user_id, recorded_by, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [sessionId, userId, request.user.id, notes || null]
      );
      
      return reply.code(201).send({
        message: 'Attendance recorded successfully',
        attendance: result.rows[0]
      });
    } catch (error) {
      console.error('Record attendance error:', error);
      return reply.code(500).send({ error: 'Failed to record attendance' });
    }
  });
  
  fastify.delete('/attendance/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin', 'superadmin')]
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const result = await query(
        'DELETE FROM attendance_records WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Attendance record not found' });
      }
      
      return reply.send({ message: 'Attendance record removed successfully' });
    } catch (error) {
      console.error('Delete attendance error:', error);
      return reply.code(500).send({ error: 'Failed to delete attendance' });
    }
  });
}
