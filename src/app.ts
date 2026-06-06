import express, { type Application, type Request, type Response } from "express"
import { pool } from "./db";



const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }))





app.get("/", (req: Request, res: Response) => {
    // res.send("Hello world111");
    res.status(200).json({
        "message": "Express Server",
        "author": "Dishan",
    })
});

// create user
// ==============

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


// isssue create

app.post("/api/issues", async (req: Request, res: Response) => {
    // console.log(req.body);
    const { title, description, type, status, reporter_id } = req.body;



    try {
        const result = await pool.query(`
            INSERT INTO issues(title, description, type, status,reporter_id) VALUES($1,$2,$3, COALESCE($4, 'open'),$5)
            RETURNING *
        `, [title, description, type, status, reporter_id]);

        // console.log(result);
        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        })
    } catch (error: any) {

        res.status(404).json({
            success: false,
            message: error.message,
            errors: error
        })
    }
});


// get all issues


app.get("/api/issues", async (req: Request, res: Response) => {
    try {

        const { sort = "newest", type, status } = req.query;



        let query = `SELECT * FROM issues`;
        const values = [];

        if (type) {
            values.push(type);
            query += ` WHERE type = $1`;
        }

        if (status) {
            values.push(status);

            if (type) {
                query += ` AND status = $2`;
            } else {
                query += ` WHERE status = $1`;
            }
        }

        if (sort === "oldest") {
            query += ` ORDER BY created_at ASC`;
        } else {
            query += ` ORDER BY created_at DESC`;
        }

        const issuesResult = await pool.query(query, values);

        const data = [];

        for (const issue of issuesResult.rows) {

            const reporterResult = await pool.query(
                `
        SELECT id, name, role
        FROM users
        WHERE id = $1
        `,
                [issue.reporter_id]
            );

            data.push({
                ...issue,
                reporter: reporterResult.rows[0] || null,
            });
        }

        res.status(200).json({
            success: true,
            message: "Issues retrived successfully",
            data
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});

// Get single issue

app.get("/api/issues/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Get single issue
        const issueResult = await pool.query(
            `SELECT * FROM issues WHERE id = $1`,
            [id]
        );

        if (issueResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        const issue = issueResult.rows[0];

        // 2. Get reporter 
        let reporter = null;

        if (issue.reporter_id) {
            const reporterResult = await pool.query(
                `
                SELECT id, name, role
                FROM users
                WHERE id = $1
                `,
                [issue.reporter_id]
            );

            reporter = reporterResult.rows[0] || null;
        }


        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: {
                ...issue,
                reporter,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});



// update issues

app.patch("/api/issues/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, type } = req.body;

    try {
        // 1. Check issue exists
        const issueResult = await pool.query(
            `SELECT * FROM issues WHERE id = $1`,
            [id]
        );

        if (issueResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found!",
            });
        }

        const issue = issueResult.rows[0];

        // 2. Authorization  korta hobe



        const result = await pool.query(
            `
            UPDATE issues 
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
            `,
            [title, description, type, id]
        );

        // 4. Response
        return res.status(200).json({
            success: true,
            message: "Issue updated successfully!",
            data: result.rows[0],
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error,
        });
    }
});



// delete issues

app.delete("/api/issues/:id", async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `
            DELETE FROM issues
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
});


export default app