import { BigNumber } from "ethers";

export interface FinalizableOracle {
    addrezz: string;
    lowerBound: BigNumber;
    higherBound: BigNumber;
    finalResult: BigNumber;
    weight: BigNumber;
    finalized: boolean;
}
