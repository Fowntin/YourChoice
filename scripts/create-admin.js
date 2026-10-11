#!/usr/bin/env node
/**
 * CLI Tool to securely create or reset admin credentials.
 * Usage: node scripts/create-admin.js [username] [password]
 */
require('dotenv').config({ override: true });
const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.model('Admin', adminSchema);

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function main() {
  const args = process.argv.slice(2);
  let username = args[0];
  let password = args[1];

  if (!username) {
    username = await askQuestion('Enter admin username: ');
  }
  if (!password) {
    password = await askQuestion('Enter admin password: ');
  }

  if (!username || !password) {
    console.error('❌ Error: Both username and password are required.');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌ Error: MONGODB_URI not set in environment or .env.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`✅ Admin user '${username}' password successfully updated with salted bcrypt hash.`);
    } else {
      const newAdmin = new Admin({ username, password: hashedPassword });
      await newAdmin.save();
      console.log(`✅ New admin user '${username}' successfully created with salted bcrypt hash.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create/update admin:', err.message);
    process.exit(1);
  }
}

main();
