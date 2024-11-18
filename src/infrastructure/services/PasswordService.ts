import bcryptjs from "bcryptjs";
import { ErrorResponse } from "../../utils/errors";

export const generateHashPassword = async (
    password: string
): Promise<string> => {
    try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        return hashedPassword;
    } catch (error: any) {
        throw new ErrorResponse(error.message, error.status);
    }
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    try {
        return bcryptjs.compare(password, hashedPassword);
    } catch (error: any) {
        throw new ErrorResponse(error.message, error.status);
    }
};