import { Amount, Token } from "@carrot-kpi/sdk";
import { BigNumber } from "ethers";

export interface Collateral {
    amount: Amount<Token>;
    minimumPayout: Amount<Token>;
}

export interface FinalizableOracle {
    address: string;
    lowerBound: BigNumber;
    higherBound: BigNumber;
    finalResult: BigNumber;
    weight: BigNumber;
    finalized: boolean;
}

export interface KpiTokenData {
    address: string;
    symbol: string;
    name: string;
    initialSupply: BigNumber | null;
    expiration: number;
    allOrNone: boolean;
}
