import { Company } from "../entities/Company";
import { Turf } from "../entities/Turf";

export interface ICompanyRepository {
    findByEmail(email: string): Promise<Company | null>;
    create(company: Company): Promise<Company>;
    update(id: string, value: any): Promise<Company | null>;
    registerTurf(turf: Turf): Promise<Turf | null>;
    getTurfs(companyId: string): Promise<Turf[] | null>;
    getTurfById(turfId: string): Promise<Turf | null>
}