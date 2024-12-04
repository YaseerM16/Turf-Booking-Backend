import { Company } from "../../../../domain/entities/Company";
import { Turf } from "../../../../domain/entities/Turf";

export interface ICompanyUseCase {
    RegisterCompany(company: Company): Promise<Company>;
    verifyMail(
        type: string,
        token: string,
        email: string
    ): Promise<Company | null>;
    companyLogin(email: string, password: string): Promise<Company | null>
    registerTurf(turfDetails: any): Promise<Turf | null>;
    getTurfs(companyId: string): Promise<Turf[] | null>;
    getTurfById(turfId: string): Promise<Turf | null>
    // updateProfileImage(_id: string, url: string): Promise<User | null>
    // userLogin(email: string, password: string): Promise<User | null>
    // updateProfileDetails(_id: string, data: string): Promise<User | null>
    // forgotPassword(email: string): Promise<void>
    // updatePassword(email: string, password: string): Promise<User | null>
}
