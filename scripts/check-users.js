import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully\n');

    const users = await User.find({}).select('+password');
    
    console.log('📊 Total users in database:', users.length);
    console.log('\n👥 User Details:\n');

    for (const user of users) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Is Active:', user.isActive);
      console.log('Password Hash:', user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD');
      console.log('Password Length:', user.password ? user.password.length : 0);
      
      // Test password comparison with common passwords
      const testPasswords = ['admin123456', 'demo123456', 'staff123456'];
      
      console.log('\n🔐 Testing passwords:');
      for (const testPass of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPass, user.password);
          if (isMatch) {
            console.log(`  ✅ Password "${testPass}" MATCHES!`);
          }
        } catch (err) {
          console.log(`  ❌ Error testing password: ${err.message}`);
        }
      }
      console.log('');
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
