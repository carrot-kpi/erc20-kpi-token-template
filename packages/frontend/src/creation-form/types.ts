import { Amount, type KPITokenSpecification, Token } from "@carrot-kpi/sdk";
import type {
    OracleInitializationBundle,
    OracleInitializationBundleGetter,
} from "@carrot-kpi/react";
import type { SelectOption, TokenInfoWithBalance } from "@carrot-kpi/ui";
import { type Address } from "viem";

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

export interface CollateralsStepState {
    collaterals: CollateralData[];
    pickerToken?: TokenInfoWithBalance;
    pickerAmount?: NumberFormatValue;
    pickerMinimumPayout?: NumberFormatValue;
}

export interface TokenData {
    name: string;
    symbol: string;
    supply: bigint;
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
    lowerBound: bigint;
    higherBound: bigint;
}

export interface OutcomeConfigurationState {
    automaticallyFilled?: boolean;
    binaryTogglable: boolean;
    binary: boolean;
    lowerBound: NumberFormatValue;
    higherBound: NumberFormatValue;
}

export type OutcomesConfigurationStepState = {
    [templateId: number]: OutcomeConfigurationState;
};

export interface OptionForCollateral extends SelectOption<Address> {
    amount: Amount<Token>;
}
