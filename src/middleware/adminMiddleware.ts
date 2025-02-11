import { Request, Response, NextFunction } from 'express';

export const isServiceProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'provider') {
            return res.status(403).json({ message: "You are not authorized to perform this action" ,success:false, error:true });
        }
        next();
    } catch (error: any) {
        res.status(500).json({ error: true, success: false, message: error.message });
    }
}