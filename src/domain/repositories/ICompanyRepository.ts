import { Company } from "../entities/Company";
import { Slot } from "../entities/Slot";
import { Turf } from "../entities/Turf";

export interface ICompanyRepository {
    findByEmail(email: string): Promise<Company | null>;
    create(company: Company): Promise<Company>;
    update(id: string, value: any): Promise<Company | null>;
    registerTurf(turf: Turf): Promise<Turf | null>;
    getTurfs(companyId: string): Promise<Turf[] | null>;
    getTurfById(turfId: string): Promise<Turf | null>;
    deleteTurfImage(turfId: string, index: number): Promise<String[] | null>;
    editTurfById(turfId: string, turf: Turf): Promise<Turf | null>;
    getSlotByDay(turfId: string, day: string): Promise<Slot[] | null>;
    makeSlotUnavail(slotId: string, turfId: string): Promise<object>;
    makeSlotAvail(slotId: string, turfId: string): Promise<object>;
    blockTurf(turfId: string): Promise<object>;
    unBlockTurf(turfId: string): Promise<object>;
}