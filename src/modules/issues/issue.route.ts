import { Router } from "express";
import { issueController } from "./issue.controller";



const router = Router();

router.post('/', issueController.createIssue);

// get all issues

router.get("/", issueController.getAllIssue);

// Get single issue

router.get("/:id", issueController.getSingleIssue);


// update issues

router.patch("/:id", issueController.updateIssue);



// delete issues

router.delete("/:id", issueController.deleteIssue);


export const issueRoute = router;