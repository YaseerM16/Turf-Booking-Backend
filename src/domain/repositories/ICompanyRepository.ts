import { Company } from "../entities/Company";

export interface ICompanyRepository {
    findByEmail(email: string): Promise<Company | null>;
    create(company: Company): Promise<Company>;
    update(id: string, value: any): Promise<Company | null>
}