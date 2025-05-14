import express from "express";

declare global {
  namespace Express {
    interface Request {
      verifiedUser?: {
        role:"admin" | "student" | "instructor";
        email:string;
        id:string
      }
    }
  }
}