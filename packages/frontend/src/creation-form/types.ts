import { Template } from "@carrot-kpi/sdk";
import { BigNumber } from "ethers";
import { Address } from "wagmi";

export interface SpecificationData {
    title: string;
    description: string;
    tags: string[];
}

export interface CollateralData {
    address: Address;
    amount: BigNumber;
    minimumPayout: BigNumber;
}

export interface ERC20Data {
    name: string;
    symbol: string;
    supply: BigNumber;
}

export interface OracleData {
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
