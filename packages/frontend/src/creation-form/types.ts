import { Amount, KpiTokenSpecification, Token } from "@carrot-kpi/sdk";
import { BigNumber } from "ethers";

export type SpecificationData = Omit<KpiTokenSpecification, "ipfsHash">;

export interface NumberFormatValue {
    formattedValue: string;
    value: string;
}

export interface CollateralData {
    amount: Amount<Token>;
    minimumPayout: Amount<Token>;
}

export interface TokenData {
    name: string;
    symbol: string;
    supply: BigNumber;
}

export interface OracleData {
    data: string;
    value: BigNumber;
}

export interface OutcomeData {
    lowerBound: BigNumber;
    higherBound: BigNumber;
}
