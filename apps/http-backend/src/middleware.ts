import { NextFunction,Request,Response } from "express";
const { JWT_SECRET } = require("@repo/backend-common/config");
import jwt from "jsonwebtoken"

export function middleware(req:Request,res:Response,next:NextFunction){
    const token=req.headers["authorization"] ?? "";
    const decoded=jwt.verify(token,JWT_SECRET);
    console.log("Decoded token:", decoded);

    if(decoded){
        //@ts-ignore
        req.userId=decoded.userId;
        next();

    }else{
        res.status(403).json({
            message:"Unauthorized"
        })
    }
}