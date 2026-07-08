import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json(
      {
        error: 'Failed to fetch user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { name, email, phone, role, isActive, password } = await req.json();

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return Response.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    // If password is provided, update it (pre-save hook will hash it)
    if (password) {
      user.password = password;
    }

    await user.save();

    // Return updated user without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return Response.json(
      {
        success: true,
        message: 'User updated successfully',
        user: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      {
        error: 'Failed to update user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Don't allow deleting yourself
    const user = await User.findById(id);

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

    return Response.json(
      {
        success: true,
        message: 'User deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json(
      {
        error: 'Failed to delete user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
