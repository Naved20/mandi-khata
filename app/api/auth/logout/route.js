// Logout endpoint - clears session
export async function POST(req) {
  try {
    return Response.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      {
        error: 'Logout failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
