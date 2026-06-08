import { pool } from "../../db";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: {
    email: string,
    password: string
}) => {

    const { email, password } = payload;


    const userData = await pool.query(`
        SELECT * FROM users WHERE email =$1
        `,
        [email],
    );

    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials")
    }
    const user = userData.rows[0];
    // console.log(user);

    const matchPassword = await bcrypt.compare(password, user.password);
    console.log(matchPassword);
    if (!matchPassword) {
        throw new Error("Invalid Credentials!")
    }

    // Generate token

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const token = jwt.sign(jwtPayload, config.secret as string, { expiresIn: '7d' });

    delete user.password;

    return { token, user };

}

export const authService = {
    loginUserIntoDB
}