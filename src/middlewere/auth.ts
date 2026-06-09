import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { IJwtUser } from "../modules/users/user.interface";

const auth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            // console.log("This is protected route");
            // console.log(req.headers.authorization);
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access!!"
                })
            }

            const decoded = jwt.verify(
                token,
                config.secret as string
            ) as IJwtUser;

            ;
            


            const userData = await pool.query(`
                SELECT *FROM users WHERE email =$1
            `, [decoded.email])


            const user = userData.rows[0];
            // console.log(user);

            if (userData.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                })
            }


            req.user = decoded;

            next();
        }
        catch (error) {
            next(error)
        }
    }
}

export default auth;