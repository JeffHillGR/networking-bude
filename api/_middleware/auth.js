/**
 * API Authentication Middleware
 * Verifies Supabase JWT tokens for authenticated API endpoints
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Verify authentication token and return user
 * @param {Request} req - HTTP request object
 * @returns {Object|null} - User object if authenticated, null otherwise
 */
export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.split(' ')[1];

  // Create Supabase client with anon key
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  // Verify the token and get user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: error?.message || 'Invalid token' };
  }

  return { user, error: null };
}

/**
 * Middleware wrapper for authenticated routes
 * Usage: export default requireAuth(handler)
 */
export function requireAuth(handler) {
  return async (req, res) => {
    const { user, error } = await verifyAuth(req);

    if (error || !user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: error || 'Please log in to access this endpoint'
      });
    }

    // Attach user to request object
    req.user = user;

    // Call the actual handler
    return handler(req, res);
  };
}

/**
 * Middleware wrapper for admin-only routes
 * Requires user to have admin role
 */
export function requireAdmin(handler) {
  return async (req, res) => {
    const { user, error } = await verifyAuth(req);

    if (error || !user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: error || 'Please log in to access this endpoint'
      });
    }

    // Create Supabase client to check user role
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    // Attach user to request object
    req.user = user;
    req.isAdmin = true;

    // Call the actual handler
    return handler(req, res);
  };
}

/**
 * Middleware wrapper for service role operations
 * Verifies service role key (not user token)
 */
export function requireServiceRole(handler) {
  return async (req, res) => {
    const serviceKey = req.headers['x-service-key'];

    if (!serviceKey || serviceKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid service key'
      });
    }

    // Call the actual handler
    return handler(req, res);
  };
}

/**
 * Get Supabase client with service role (for admin operations)
 */
export function getServiceRoleClient() {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

/**
 * Set secure CORS headers
 */
export function setCorsHeaders(res, origin = null) {
  const allowedOrigins = [
    'https://networking-bude.vercel.app',
    'https://networkingbude.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const requestOrigin = origin || 'https://networking-bude.vercel.app';

  if (allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://networking-bude.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Service-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
}
