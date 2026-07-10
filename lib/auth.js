import jwt from 'jsonwebtoken';

export function getUserIdFromRequest(req) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return null;
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return decoded.userId || decoded.id;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

export function requireAuth(req) {
  const userId = getUserIdFromRequest(req);
  
  if (!userId) {
    return {
      error: true,
      response: Response.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    };
  }
  
  return { error: false, userId };
}
