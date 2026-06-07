import type { Request, Response } from "express";
import { pool } from "../../db";

import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    // console.log(req.body);
    // const { name, email, password, role } = req.body;

    

    try {

        const result = await userService.createUserIntoDB(req.body)

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        })
    } catch (error: any) {

        res.status(400).json({
            success: false,
            message: error.message,
            errors: error
        })
    }
}

export const userController = {
    createUser
}