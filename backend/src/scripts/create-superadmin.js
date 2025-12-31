import argon2 from 'argon2';
import { query } from '../config/database.js';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createSuperadmin() {
  console.log('=== Create Superadmin Account ===\n');
  
  const email = await question('Email: ');
  const password = await question('Password: ');
  const name = await question('Name: ');
  
  if (!email || !password || !name) {
    console.error('❌ Email, password, and name are required');
    rl.close();
    process.exit(1);
  }
  
  try {
    console.log('Checking if superadmin already exists...');
    const existingUser = await query(
      'SELECT id FROM accounts WHERE email = $1',
      [email.toLowerCase()]
    );
    console.log('Existing user:', existingUser.rows);
    
    if (existingUser.rows.length > 0) {
      console.error('❌ Email already exists');
      rl.close();
      process.exit(1);
    }
    
    const passwordHash = await argon2.hash(password);
    
    const accountResult = await query(
      `INSERT INTO accounts (email, password_hash, role, status) 
       VALUES ($1, $2, 'superadmin', 'approved') 
       RETURNING id, email, role, status`,
      [email.toLowerCase(), passwordHash]
    );
    
    const account = accountResult.rows[0];
    
    await query(
      `INSERT INTO user_profiles (account_id, name) 
       VALUES ($1, $2)`,
      [account.id, name]
    );
    
    console.log('\n✅ Superadmin account created successfully!');
    console.log(`Email: ${account.email}`);
    console.log(`Role: ${account.role}`);
    console.log(`Status: ${account.status}`);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create superadmin:', error.message);
    rl.close();
    process.exit(1);
  }
}

createSuperadmin();
