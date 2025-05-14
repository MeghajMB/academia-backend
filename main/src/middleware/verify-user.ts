import { Request, Response, NextFunction } from "express";

export const verifyUser = (...allowedRoles: ("admin" | "student" | "instructor")[])  => {
  return (req: Request, res: Response, next: NextFunction) : void  => {
    try {
      const user = req.verifiedUser; // Extract user from the verified token

      if (!user || typeof user === "string" || !allowedRoles.includes(user.role)) {
        res.status(403).json({ message: "Access Denied. Insufficient permissions." });
        return 
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Server Error." });
      return 
    }
  };
};
