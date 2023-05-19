export interface FinalizableOracle {
    addrezz: string;
    lowerBound: bigint;
    higherBound: bigint;
    finalResult: bigint;
    weight: bigint;
    finalized: boolean;
}
