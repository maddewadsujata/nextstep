import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.ts';
import { fallbackUsers } from '../db.ts';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  status: 'active' | 'suspended';
  avatarUrl?: string;
  isDemo?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// In-memory token store mapping token to user ID
export const activeSessions = new Map<string, AuthenticatedUser>();

export function generateToken(user: AuthenticatedUser): string {
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: Date.now(),
    random: Math.random().toString(36).substring(2),
  })).toString('base64');
  activeSessions.set(payload, user);
  return payload;
}

export function parseToken(token: string): AuthenticatedUser | null {
  if (!token) return null;
  // Check active memory sessions
  if (activeSessions.has(token)) {
    return activeSessions.get(token) || null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decoded && decoded.userId && decoded.role) {
      return {
        id: decoded.userId,
        name: decoded.email?.split('@')[0] || 'User',
        email: decoded.email,
        role: decoded.role,
        status: 'active',
      };
    }
  } catch {
    // invalid token format
  }
  return null;
}

// Auth Middleware: extracts and verifies user
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const customUserId = req.headers['x-user-id'] as string;
  const customRole = req.headers['x-user-role'] as string;

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  let user: AuthenticatedUser | null = parseToken(token);

  if (!user && customUserId) {
    // Fallback look-up
    const isLive = mongoose.connection.readyState === 1;
    if (isLive) {
      try {
        const dbUser = mongoose.Types.ObjectId.isValid(customUserId)
          ? await UserModel.findById(customUserId)
          : await UserModel.findOne({ email: customUserId });
        if (dbUser) {
          user = {
            id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            status: dbUser.status,
            avatarUrl: dbUser.avatarUrl,
            isDemo: dbUser.isDemo,
          };
        }
      } catch {
        // pass
      }
    } else {
      const fb = fallbackUsers.find(u => u._id === customUserId || u.email === customUserId);
      if (fb) {
        user = {
          id: fb._id,
          name: fb.name,
          email: fb.email,
          role: fb.role,
          status: fb.status,
          avatarUrl: fb.avatarUrl,
          isDemo: fb.isDemo,
        };
      }
    }

    if (!user && customRole) {
      user = {
        id: customUserId,
        name: customUserId.split('@')[0],
        email: customUserId.includes('@') ? customUserId : `${customUserId}@nextstep.org`,
        role: (['student', 'recruiter', 'admin'].includes(customRole) ? customRole : 'student') as any,
        status: 'active',
      };
    }
  }

  if (user) {
    req.user = user;
  }
  next();
}

// Role Authorization Guard: rejects if user doesn't possess required role
export function requireRole(allowedRoles: Array<'student' | 'recruiter' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to access this resource.',
        code: 'UNAUTHENTICATED',
      });
      return;
    }

    if (req.user.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: 'Your account has been suspended by an administrator.',
        code: 'ACCOUNT_SUSPENDED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access Denied: You do not have permissions for this dashboard. Requires [${allowedRoles.join(', ')}], but your role is [${req.user.role}].`,
        code: 'FORBIDDEN_ROLE',
      });
      return;
    }

    next();
  };
}
