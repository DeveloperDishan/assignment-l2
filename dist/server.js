

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/users/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
               CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor' CHECK (
            role IN (
                'maintainer',
                'contributor'
                
            )
        ),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
               )
            `);
    await pool.query(`
                   
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
            type VARCHAR(30) NOT NULL CHECK (
            type IN (
            'bug', 
            'feature_request'
            )),
            status VARCHAR(30) DEFAULT 'open'  CHECK (
            status IN (
                'open',
                'in_progress',
                'resolved'
            )
        ),
            reporter_id INT REFERENCES users(id) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
);
                
                `);
    console.log("database connected");
  } catch (error2) {
    console.log(error2);
  }
};

// src/modules/users/user.service.ts
import bcrypt from "bcrypt";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
            INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4, 'contributor'))
            RETURNING *
        `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var userService = {
  createUserIntoDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/users/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error2) {
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message: error2.message,
      error: error2
    });
  }
};
var userController = {
  createUser
};

// src/modules/users/user.route.ts
var router = Router();
router.post("/", userController.createUser);
var userRoute = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
import "console";
var createIsssueIntoDB = async (payload) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(`
            INSERT INTO issues(title, description, type, status,reporter_id) VALUES($1,$2,$3, COALESCE($4, 'open'),$5)
            RETURNING *
        `, [title, description, type, status, reporter_id]);
  return result;
};
var getAllIssueIntoDB = async (payload) => {
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
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporterResult.rows[0],
      created_at: issue.created_at,
      updated_at: issue.updated_at
    });
  }
  return data;
};
var getSingleIssueIntoDB = async (id) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
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
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return result;
};
var updateIssueIntoDB = async (id, payload, user) => {
  console.log(user);
  const { title, description, type, status } = payload;
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found!");
  }
  const issue = issueResult.rows[0];
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("Forbidden");
    }
    if (issue.status !== "open") {
      throw new Error(
        "You can update only open issues"
      );
    }
  }
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
  return result;
};
var deleteIssueIntoDB = async (id, user) => {
  if (user.role !== "maintainer") {
    throw new Error("Forbidden only maintainer can delete");
  }
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
};
var issueService = {
  createIsssueIntoDB,
  getAllIssueIntoDB,
  getSingleIssueIntoDB,
  updateIssueIntoDB,
  deleteIssueIntoDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const user = req.user;
    const payload = {
      ...req.body,
      reporter_id: user.id
    };
    const result = await issueService.createIsssueIntoDB(payload);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error2) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: error2.message,
      error: error2
    });
  }
};
var getAllIssue = async (req, res) => {
  try {
    const query = req.query;
    const result = await issueService.getAllIssueIntoDB(query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (error2) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error2.message,
      error: error2
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issueService.getSingleIssueIntoDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error2) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error2.message,
      error: error2
    });
  }
};
var updateIssue = async (req, res) => {
  const id = Number(req.params.id);
  const user = req.user;
  try {
    const result = await issueService.updateIssueIntoDB(id, req.body, user);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully!",
      data: result.rows[0]
    });
  } catch (error2) {
    sendResponse_default(res, {
      statusCode: 403,
      success: false,
      message: error2.message,
      error: error2
    });
  }
};
var deleteIssue = async (req, res) => {
  const id = Number(req.params.id);
  const user = req.user;
  try {
    const result = await issueService.deleteIssueIntoDB(id, user);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error2) {
    sendResponse_default(res, {
      statusCode: 403,
      success: false,
      message: error2.message,
      error: error2
    });
  }
};
var issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middlewere/auth.ts
import jwt from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt.verify(
        token,
        config_default.secret
      );
      ;
      const userData = await pool.query(`
                SELECT *FROM users WHERE email =$1
            `, [decoded.email]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      req.user = decoded;
      next();
    } catch (error2) {
      next(error2);
    }
  };
};
var auth_default = auth;

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issueController.createIssue);
router2.get("/", issueController.getAllIssue);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(), issueController.updateIssue);
router2.delete("/:id", auth_default(), issueController.deleteIssue);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import { Router as Router3 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email =$1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const token = jwt2.sign(jwtPayload, config_default.secret, { expiresIn: "7d" });
  delete user.password;
  return { token, user };
};
var authService = {
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error2) {
    res.status(500).json({
      success: false,
      message: error2.message,
      error: error2
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
var authRoute = router3;

// src/middlewere/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "Wellcome To Our Assignmmet",
    "author": "Dishan"
  });
});
app.use("/api/auth/signup", userRoute);
app.use("/api/issues/", issueRoute);
app.use("/api/auth", authRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server is running on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map