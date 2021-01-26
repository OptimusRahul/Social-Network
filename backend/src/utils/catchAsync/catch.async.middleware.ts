import { Request, Response, NextFunction } from 'express';

export const catchAsyncMiddleware = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    }
}