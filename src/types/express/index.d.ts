import express from "express";

declare global {
  namespace Express {
    interface Request {
      verifiedUser?: {
        role:string;
        email:string;
        id:string
      }
    }
  }
}