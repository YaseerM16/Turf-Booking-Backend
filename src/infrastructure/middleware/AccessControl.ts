import { Response, NextFunction, Request } from 'express';
import UserModel from '../database/models/UserModel';
import CompanyModel from '../database/models/CompanyModel';
import { CustomRequest } from "./Authenticator"

class AccessControlMiddleware {
    /**
     * Check if a user's account is blocked
     */
    async isUserBlocked(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req?.user?.id;
            // console.log("Req User in AccessControl :", req.user);


            if (!userId) {
                res.status(401).json({ message: "Unauthorized: No user ID provided." });
                return
            }

            const user = await UserModel.findById(userId).select('isActive').lean();

            if (!user) {
                res.status(404).json({ message: "User not found." });
                return
            }

            if (!user?.isActive) {
                res.status(403).json({ message: "Access denied: Your account is blocked." });
                return
            }

            next();

        } catch (error) {
            console.error("Error checking user blocked status:", error);
            res.status(500).json({ message: "Internal server error." });
            return
        }
    }


    async isCompanyBlocked(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const companyId = req?.user?.id; // Retrieve company ID from request

            if (!companyId) {
                res.status(401).json({ message: "Unauthorized: No company ID provided." });
                return
            }

            const company = await CompanyModel.findById(companyId).select('isActive').lean();
            if (!company) {
                res.status(404).json({ message: "Company not found." });
                return
            }

            if (!company?.isActive) {
                res.status(403).json({ message: "Access denied: Your company account is inactive." });
                return
            }

            next(); // Proceed if the company is active
        } catch (error) {
            console.error("Error checking company inactive status:", error);
            res.status(500).json({ message: "Internal server error." });
            return
        }
    }
}

export default new AccessControlMiddleware();
