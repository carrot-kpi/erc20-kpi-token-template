import { Template } from "@carrot-kpi/sdk";
import { BigNumber } from "ethers";
import { Address } from "wagmi";

export interface SpecificationData {
    title: string;
    description: string;
    tags: string[];
}

export interface NumberFormatValue {
    floatValue: number | undefined;
    formattedValue: string;
    value: string;
}

export interface CollateralData {
    address: Address;
    decimals: number;
    symbol: string;
    amount: NumberFormatValue;
    minimumPayout: NumberFormatValue;
}

export interface ERC20Data {
    name: string;
    symbol: string;
    supply: BigNumber;
}

export interface OracleData {
    isPicked: boolean;
    template: Template;
    initializationData: string;
    value: BigNumber;
    lowerBound: BigNumber;
    higherBound: BigNumber;
    weight: BigNumber;
}

export interface CreationData {
    step: number;
    specification: SpecificationData;
    erc20: ERC20Data;
    collaterals: CollateralData[];
    oracles: OracleData[];
}
