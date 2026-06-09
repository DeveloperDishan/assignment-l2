import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { IJwtUser } from "../users/user.interface";
import type { IissuesQuery } from "./issue.interface";


const createIssue = async (req: Request, res: Response) => {
    // console.log(req.body);
    // const { title, description, type, status, reporter_id } = ;



    try {

        const user = req.user as IJwtUser;

        const payload = {
            ...req.body,
            reporter_id: user.id
        };

        const result = await issueService.createIsssueIntoDB(payload)

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
}


const getAllIssue = async (req: Request, res: Response) => {
    // console.log("controller", req.user);
    try {
        const query: IissuesQuery = req.query;

        const result = await issueService.getAllIssueIntoDB(query);

        res.status(200).json({
            success: true,
            message: "Issues retrived successfully",
            data: result
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
}



const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await issueService.getSingleIssueIntoDB(id)

        res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
}


const updateIssue = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    // const { title, description, type } = req.body;
    const user = req.user as IJwtUser;

    try {

        const result = await issueService.updateIssueIntoDB(id, req.body, user)

        //  Response
        return res.status(200).json({
            success: true,
            message: "Issue updated successfully!",
            data: result.rows[0],
        });

    } catch (error: any) {



        return res.status(403).json({
            success: false,
            message: error.message,
            error,
        });
    }
}


const deleteIssue = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user as IJwtUser;

    try {

        const result = await issueService.deleteIssueIntoDB(id, user);
        return res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
        });

    } catch (error: any) {
        return res.status(403).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
}

export const issueController = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
} 