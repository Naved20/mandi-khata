import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '365d' }
  );
};

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return Response.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive || !await user.matchPassword(password)) {
      console.log('❌ Login failed for:', email);
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      phone: user.phone || '',
    };

    console.log('✅ Login successful for:', email);

    return Response.json(
      {
        success: true,
        message: 'Login successful',
        user: userData,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return Response.json(
      {
        error: 'Login failed',
        message: 'Please try again later',
      },
      { status: 500 }
    );
  }
}
