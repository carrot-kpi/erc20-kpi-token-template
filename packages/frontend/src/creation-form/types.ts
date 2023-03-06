import { Amount, KPITokenSpecification, Token } from "@carrot-kpi/sdk";
import { OracleInitializationBundle } from "@carrot-kpi/react";
import { BigNumber } from "ethers";

export type SpecificationData = Omit<KPITokenSpecification, "ipfsHash"> & {
    expiration: Date;
};

export interface NumberFormatValue {
    formattedValue: string;
    value: string;
}

export class TokenWithLogoURI extends Token {
    public readonly logoURI?: string;

    constructor(
        chainId: number,
        address: string,
        decimals: number,
        symbol: string,
        name: string,
        logoURI?: string
    ) {
        super(chainId, address, decimals, symbol, name);
        this.logoURI = logoURI;
    }
}

export interface CollateralData {
    amount: Amount<TokenWithLogoURI>;
    minimumPayout: Amount<TokenWithLogoURI>;
}

export interface TokenData {
    name: string;
    symbol: string;
    supply: BigNumber;
}

export interface OracleData {
    state: Partial<unknown>;
    initializationBundle?: OracleInitializationBundle;
}

export interface OutcomeData {
    lowerBound: BigNumber;
    higherBound: BigNumber;
}
