import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middlewere/auth";



const router = Router();




router.post('/', auth(), issueController.createIssue);

// get all issues

router.get("/", issueController.getAllIssue);

// Get single issue

router.get("/:id", issueController.getSingleIssue);


// update issues

router.patch("/:id", auth(), issueController.updateIssue);



// delete issues

router.delete("/:id", auth(), issueController.deleteIssue);


export const issueRoute = router;