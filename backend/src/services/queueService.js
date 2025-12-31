import { query } from '../config/database.js';

export async function promoteFromWaitlist(eventId) {
  const client = await query('SELECT 1').then(() => null);
  
  try {
    const eventResult = await query(
      'SELECT registration_limit FROM events WHERE id = $1',
      [eventId]
    );
    
    if (eventResult.rows.length === 0 || !eventResult.rows[0].registration_limit) {
      return;
    }
    
    const limit = eventResult.rows[0].registration_limit;
    
    const registeredCount = await query(
      `SELECT COUNT(*) as count FROM event_registrations 
       WHERE event_id = $1 AND status = 'registered'`,
      [eventId]
    );
    
    const currentCount = parseInt(registeredCount.rows[0].count);
    const availableSlots = limit - currentCount;
    
    if (availableSlots <= 0) {
      return;
    }
    
    const waitlistedUsers = await query(
      `SELECT id, user_id FROM event_registrations 
       WHERE event_id = $1 AND status = 'waitlisted' 
       ORDER BY queue_position ASC, registered_at ASC
       LIMIT $2`,
      [eventId, availableSlots]
    );
    
    for (const registration of waitlistedUsers.rows) {
      await query(
        `UPDATE event_registrations 
         SET status = 'registered', queue_position = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [registration.id]
      );
      
      console.log(`Promoted user ${registration.user_id} from waitlist for event ${eventId}`);
    }
    
    await reorderWaitlist(eventId);
    
  } catch (error) {
    console.error('Error promoting from waitlist:', error);
    throw error;
  }
}

export async function reorderWaitlist(eventId) {
  try {
    const waitlisted = await query(
      `SELECT id FROM event_registrations 
       WHERE event_id = $1 AND status = 'waitlisted' 
       ORDER BY registered_at ASC`,
      [eventId]
    );
    
    for (let i = 0; i < waitlisted.rows.length; i++) {
      await query(
        'UPDATE event_registrations SET queue_position = $1 WHERE id = $2',
        [i + 1, waitlisted.rows[i].id]
      );
    }
  } catch (error) {
    console.error('Error reordering waitlist:', error);
    throw error;
  }
}

export async function checkRegistrationStatus(eventId) {
  const eventResult = await query(
    'SELECT registration_limit, registration_open FROM events WHERE id = $1',
    [eventId]
  );
  
  if (eventResult.rows.length === 0) {
    throw new Error('Event not found');
  }
  
  const event = eventResult.rows[0];
  
  if (!event.registration_open) {
    return { canRegister: false, reason: 'Registration is closed' };
  }
  
  if (!event.registration_limit) {
    return { canRegister: true, willBeWaitlisted: false };
  }
  
  const registeredCount = await query(
    `SELECT COUNT(*) as count FROM event_registrations 
     WHERE event_id = $1 AND status = 'registered'`,
    [eventId]
  );
  
  const currentCount = parseInt(registeredCount.rows[0].count);
  const isFull = currentCount >= event.registration_limit;
  
  return {
    canRegister: true,
    willBeWaitlisted: isFull,
    availableSlots: isFull ? 0 : event.registration_limit - currentCount
  };
}
