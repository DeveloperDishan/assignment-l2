import { error } from "node:console";
import { pool } from "../../db";
import { Result } from "pg";

const createIsssueIntoDB = async (payload: any) => {

    const { title, description, type, status, reporter_id } = payload

    const result = await pool.query(`
            INSERT INTO issues(title, description, type, status,reporter_id) VALUES($1,$2,$3, COALESCE($4, 'open'),$5)
            RETURNING *
        `, [title, description, type, status, reporter_id]);


    return result;

}


const getAllIssueIntoDB = async (payload: any) => {


    const { sort = "newest", type, status } = payload;



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

        delete issue.reporter_id;

        data.push({
            ...issue,
            reporter: reporterResult.rows[0],
        });
    }

    return data;
}



const getSingleIssueIntoDB = async (id: number) => {



    // 1. Get single issue
    const issueResult = await pool.query(
        `SELECT * FROM issues WHERE id = $1`,
        [id]
    );

    if (issueResult.rows.length === 0) {
        throw new Error("Issue not found")
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

        delete issue.reporter_id;

        reporter = reporterResult.rows[0];
    }

    const result = {
        ...issue,
        reporter,
    }
    return result;

}


const updateIssueIntoDB = async (id: number, payload: any) => {

    const { title, description, type, status } = payload;


    //  Check issue exists
    const issueResult = await pool.query(
        `SELECT * FROM issues WHERE id = $1`,
        [id]
    );

    if (issueResult.rows.length === 0) {
        throw new Error("Issue not found!");
    }

    // const issue = issueResult.rows[0];

    // Authorization  korta hobe



    const result = await pool.query(
        `
            UPDATE issues 
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status=COALESCE($4, status),
                updated_at = NOW()
            WHERE id = $5
            RETURNING *
            `,
        [title, description, type, status, id]
    );

    return result

}


const deleteIssueIntoDB = async (id: number) => {
    const result = await pool.query(
        `
            DELETE FROM issues
            WHERE id = $1
            RETURNING *
            `,
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error("Issue not found");
    }
    return result;
}



export const issueService = {
    createIsssueIntoDB,
    getAllIssueIntoDB,
    getSingleIssueIntoDB,
    updateIssueIntoDB,
    deleteIssueIntoDB
}