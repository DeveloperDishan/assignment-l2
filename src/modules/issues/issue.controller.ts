import type { Request, Response } from "express";
import { issueService } from "./issue.service";


const createIssue = async (req: Request, res: Response) => {
    // console.log(req.body);
    // const { title, description, type, status, reporter_id } = ;



    try {

        const result = await issueService.createIsssueIntoDB(req.body)

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
    try {

        const result = await issueService.getAllIssueIntoDB(req.query);

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

    try {

        const result = await issueService.updateIssueIntoDB(id, req.body)

        //  Response
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
}


const deleteIssue = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {

        const result = await issueService.deleteIssueIntoDB(id);
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
}

export const issueController = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
} 