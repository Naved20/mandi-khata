import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    console.log('Login attempt for:', email);

    // Validate required fields
    if (!email || !password) {
      return Response.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email, 'IsActive:', user.isActive);

    // Check if user is active
    if (!user.isActive) {
      console.log('User account disabled:', email);
      return Response.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }

    // Check password
    console.log('Checking password for:', email);
    console.log('Stored hash length:', user.password?.length);
    const isPasswordValid = await user.matchPassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login without triggering password re-hash
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate token
    const token = generateToken(user._id);

    // Get user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    console.log('Login successful for:', email);

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
    console.error('Login error:', error);
    return Response.json(
      {
        error: 'Login failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
