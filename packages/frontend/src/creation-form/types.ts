import { Amount, KPITokenSpecification, Token } from "@carrot-kpi/sdk";
import {
    OracleInitializationBundle,
    OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import { BigNumber } from "ethers";
import { TokenInfoWithBalance } from "@carrot-kpi/ui";

export type SpecificationData = Omit<KPITokenSpecification, "ipfsHash"> & {
    expiration: Date;
};

export type GenericDataStepState = Partial<
    SpecificationData & {
        erc20Name: string;
        erc20Symbol: string;
        erc20Supply: NumberFormatValue;
    }
>;

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

export interface CollateralsStepState {
    collaterals: CollateralData[];
    pickerToken?: TokenInfoWithBalance;
    pickerAmount?: NumberFormatValue;
    pickerMinimumPayout?: NumberFormatValue;
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

export type OracleConfigurationState = OracleData & {
    initializationBundleGetter?: OracleInitializationBundleGetter;
};

export type OraclesConfigurationStepState = {
    [id: number]: OracleConfigurationState;
};

export interface OutcomeData {
    lowerBound: BigNumber;
    higherBound: BigNumber;
}

export interface OutcomeConfigurationState {
    automaticallyFilled?: boolean;
    binary: boolean;
    lowerBound: NumberFormatValue;
    higherBound: NumberFormatValue;
}

export type OutcomesConfigurationStepState = {
    [templateId: number]: OutcomeConfigurationState;
};
