import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

export function validateBody(schema: ZodType<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        return res.status(400).json({
          success: false,
          message: issues[0]?.message || 'Validation failed',
          errors: issues,
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }
  };
}
