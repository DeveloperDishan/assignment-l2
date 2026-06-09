import type { JwtPayload } from "jsonwebtoken";
import type { IJwtUser } from "../modules/users/user.interface";

declare global {
    namespace Express {
        interface Request {
            user?: IJwtUser;
        }
    }
}
