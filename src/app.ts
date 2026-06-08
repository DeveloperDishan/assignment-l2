import express, { type Application, type Request, type Response } from "express"
import { pool } from "./db";

import bcrypt from "bcrypt";
import { userRoute } from "./modules/users/user.route";
import { issueRoute } from "./modules/issues/issue.route";
import { authRoute } from "./modules/auth/auth.route";


const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));





app.get("/", (req: Request, res: Response) => {
    // res.send("Hello world111");
    res.status(200).json({
        "message": "Express Server",
        "author": "Dishan",
    })
});

app.use('/api/auth/signup', userRoute);
app.use("/api/issues/", issueRoute);
app.use("/api/auth", authRoute);





export default app