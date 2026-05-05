import { Request, Response, NextFunction } from 'express';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateSessionId = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(401).json({ success: false, error: 'Missing or invalid X-Session-ID header' });
  }

  if (!uuidRegex.test(sessionId)) {
    return res.status(400).json({ success: false, error: 'X-Session-ID must be a valid UUID' });
  }

  next();
};
