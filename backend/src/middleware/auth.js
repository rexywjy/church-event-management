import { query } from '../config/database.js';

export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
    
    const result = await query(
      'SELECT id, email, role, status FROM accounts WHERE id = $1',
      [request.user.id]
    );
    
    if (result.rows.length === 0) {
      return reply.code(401).send({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    if (user.status !== 'approved') {
      return reply.code(403).send({ error: 'Account not approved or disabled' });
    }
    
    request.user = user;
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return async function (request, reply) {
    if (!request.user) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }
  };
}
