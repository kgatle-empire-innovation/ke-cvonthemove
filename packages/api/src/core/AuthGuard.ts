import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

/**
 * JWT Payload shape attached to the request after verification.
 */
export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

/**
 * Express middleware that validates the Bearer JWT token on incoming requests.
 * Attaches the decoded payload to `req.user` on success.
 */
export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: missing token' });
    return;
  }

  const token = authHeader.slice(7);
  const payload = authService.verifyToken(token);

  if (!payload) {
    res.status(401).json({ success: false, error: 'Unauthorized: invalid or expired token' });
    return;
  }

  req.user = payload as { userId: string };
  next();
};

/**
 * Custom property decorator that marks a controller method as protected.
 *
 * This is a METADATA-ONLY decorator — actual request enforcement is handled
 * by the `requireAuth` middleware registered on each route in index.ts.
 *
 * Declared as a property decorator (using `PropertyDecorator`) so that it
 * works correctly with TypeScript 5 class arrow-function field declarations:
 *
 *   @Protected()
 *   public getMyCvs = async (req: AuthenticatedRequest, res: Response) => { ... }
 */
export function Protected(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    Reflect.defineMetadata('isProtected', true, target, propertyKey);
  };
}

