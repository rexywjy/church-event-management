import argon2 from 'argon2';
import { query } from '../config/database.js';

export async function initSuperadmin() {
  try {
    const existingSuperadmin = await query(
      "SELECT id FROM accounts WHERE role = 'superadmin' LIMIT 1"
    );
    
    if (existingSuperadmin.rows.length > 0) {
      console.log('✅ Superadmin account already exists');
      return;
    }
    
    const defaultEmail = process.env.SUPERADMIN_EMAIL || 'admin@socsa.com';
    const defaultPassword = process.env.SUPERADMIN_PASSWORD || 'admin123';
    const defaultName = process.env.SUPERADMIN_NAME || 'System Administrator';
    
    console.log('🔧 No superadmin found. Creating default superadmin account...');
    
    const emailCheck = await query(
      'SELECT id FROM accounts WHERE email = $1',
      [defaultEmail.toLowerCase()]
    );
    
    if (emailCheck.rows.length > 0) {
      console.log('⚠️  Email already exists but not a superadmin. Skipping auto-creation.');
      return;
    }
    
    const passwordHash = await argon2.hash(defaultPassword);
    
    const accountResult = await query(
      `INSERT INTO accounts (email, password_hash, role, status) 
       VALUES ($1, $2, 'superadmin', 'approved') 
       RETURNING id, email, role, status`,
      [defaultEmail.toLowerCase(), passwordHash]
    );
    
    const account = accountResult.rows[0];
    
    await query(
      `INSERT INTO user_profiles (account_id, name) 
       VALUES ($1, $2)`,
      [account.id, defaultName]
    );
    
    console.log('✅ Default superadmin account created successfully!');
    console.log('📧 Email:', defaultEmail);
    console.log('🔑 Password:', defaultPassword);
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Failed to initialize superadmin:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  Continuing server startup despite superadmin init failure');
    } else {
      throw error;
    }
  }
}
