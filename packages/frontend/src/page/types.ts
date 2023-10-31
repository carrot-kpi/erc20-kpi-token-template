import { Token, type Amount } from "@carrot-kpi/sdk";
import type { Address } from "viem";

export interface FinalizableOracle {
    addrezz: string;
    finalResult: bigint;
    weight: bigint;
    finalized: boolean;
}

export class TokenWithLogoURI extends Token {
    public readonly logoURI?: string;

    constructor(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
        logoURI?: string,
    ) {
        super(chainId, address, decimals, symbol, name);
        this.logoURI = logoURI;
    }
}

export interface CollateralData {
    amount: Amount<TokenWithLogoURI>;
    minimumPayout: Amount<TokenWithLogoURI>;
}
