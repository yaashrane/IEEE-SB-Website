import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@ieee-sb.org';
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    process.exit(0);
  }

  const user = await User.create({
    name: process.env.ADMIN_NAME || 'IEEE SB Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: process.env.ADMIN_ROLE || 'super-admin',
  });

  console.log(`Admin user created: ${user.email}`);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
