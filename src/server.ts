import express, { type Application, type Request, type Response } from "express"
import { Pool } from 'pg'
import config from "./config";

const app: Application = express();
const port = config.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// neon database connection
const pool = new Pool({
    connectionString: config.connection_string
})



const initDB = async () => {
    try {

        await pool.query(`
               CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
               ); 
            `)
        console.log("database connected");
    } catch (error) {
        console.log(error);
    }
}

initDB();

app.get("/", (req: Request, res: Response) => {
    // res.send("Hello world111");
    res.status(200).json({
        "message": "Express Server",
        "author": "Dishan",
    })
});


app.post("/api/auth/signup", async (req: Request, res: Response) => {
    // console.log(req.body);
    const { name, email, password, role } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4, 'contributor'))
            RETURNING *
        `, [name, email, password, role]);

        // console.log(result);
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
})

// app.get('/api/')

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})