import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
  try {
    await connectDB();

    // Get all users (excluding passwords)
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    return Response.json(
      {
        success: true,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      {
        error: 'Failed to fetch users',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password, phone, role } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return Response.json(
        { error: 'Please provide all required fields: name, email, password, role' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone: phone || '',
      role,
      isActive: true,
    });

    await user.save();

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return Response.json(
      {
        success: true,
        message: 'User created successfully',
        user: userData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json(
      {
        error: 'Failed to create user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
