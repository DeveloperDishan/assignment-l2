import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import type { IJwtUser } from "../users/user.interface";
import type { IissuesQuery } from "./issue.interface";
import sendResponse from "../../utility/sendResponse";


const createIssue = async (req: Request, res: Response) => {




    try {

        const user = req.user as IJwtUser;

        const payload = {
            ...req.body,
            reporter_id: user.id
        };

        const result = await issueService.createIsssueIntoDB(payload)

        // console.log(result);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        })
    } catch (error: any) {

        sendResponse(res, {
            statusCode: 404,
            success: false,
            message: error.message,
            error: error
        })

    }
}


const getAllIssue = async (req: Request, res: Response) => {

    try {
        const query: IissuesQuery = req.query;

        const result = await issueService.getAllIssueIntoDB(query);



        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues retrived successfully",
            data: result
        })
    } catch (error: any) {


        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}



const getSingleIssue = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await issueService.getSingleIssueIntoDB(id)


        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue retrieved successfully",
            data: result
        })
    } catch (error: any) {

        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}


const updateIssue = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    // const { title, description, type } = req.body;
    const user = req.user as IJwtUser;

    try {

        const result = await issueService.updateIssueIntoDB(id, req.body, user)

        //  Response


        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue updated successfully!",
            data: result.rows[0],
        })

    } catch (error: any) {

        sendResponse(res, {
            statusCode: 403,
            success: false,
            message: error.message,
            error,
        })
    }
}


const deleteIssue = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = req.user as IJwtUser;

    try {

        const result = await issueService.deleteIssueIntoDB(id, user);


        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue deleted successfully",
        })

    } catch (error: any) {

        sendResponse(res, {
            statusCode: 403,
            success: false,
            message: error.message,
            error: error,
        })
    }
}

export const issueController = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
} 