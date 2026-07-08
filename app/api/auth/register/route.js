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

    const { name, email, password, confirmPassword, phone, role } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return Response.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return Response.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'staff',
    });

    await user.save();

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

    return Response.json(
      {
        success: true,
        message: 'Account created successfully',
        user: userData,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      {
        error: 'Failed to create account',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
