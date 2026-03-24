import type { Db } from "mongodb";
export declare function createCounterRepository(db: Db): {
    getNextSequence(counterKey: string): Promise<number>;
};
//# sourceMappingURL=counterRepository.d.ts.map