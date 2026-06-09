import express, { type Application, type Request, type Response } from "express";
// import cors from "cors"
import { userRoute } from "./modules/users/user.route";
import { issueRoute } from "./modules/issues/issue.route";
import { authRoute } from "./modules/auth/auth.route";
import globalErrorHandler from "./middlewere/globalErrorHandler";


const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
// app.use(cors)





app.get("/", (req: Request, res: Response) => {
    // res.send("Hello world111");
    res.status(200).json({
        "message": "Wellcome To Our Assignmmet",
        "author": "Dishan",
    })
});

app.use('/api/auth/signup', userRoute);
app.use("/api/issues/", issueRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler);





export default app