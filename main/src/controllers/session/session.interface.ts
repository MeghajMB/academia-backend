import { Request, Response, NextFunction } from "express";

export interface ISessionController {
    getSessionsOfUser(req: Request, res: Response, next: NextFunction):Promise<void>
}
