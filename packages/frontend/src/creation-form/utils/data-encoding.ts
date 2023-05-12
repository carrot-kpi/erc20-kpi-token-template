import { Template } from "@carrot-kpi/sdk";
import { BigNumber, utils } from "ethers";
import { CollateralData, OracleData, OutcomeData } from "../types";

export const encodeKPITokenData = (
    collateralsData: CollateralData[],
    erc20Name: string,
    erc20Symbol: string,
    supply: BigNumber
) => {
    return utils.defaultAbiCoder.encode(
        [
            "tuple(address token,uint256 amount,uint256 minimumPayout)[]",
            "string",
            "string",
            "uint256",
        ],
        [
            collateralsData.map((collateralData) => {
                return {
                    token: collateralData.amount.currency.address,
                    amount: collateralData.amount.raw,
                    minimumPayout: collateralData.minimumPayout.raw,
                };
            }),
            erc20Name,
            erc20Symbol,
            supply,
        ]
    );
};

export const encodeOraclesData = (
    templatesData: Template[],
    outcomesData: OutcomeData[],
    oraclesData: Required<OracleData>[]
) => {
    return utils.defaultAbiCoder.encode(
        [
            "tuple(uint256 templateId,uint256 lowerBound,uint256 higherBound,uint256 weight,uint256 value,bytes data)[]",
            "bool",
        ],
        [
            templatesData.map(({ id: templateId }, index) => {
                const { lowerBound, higherBound } = outcomesData[index];
                const { initializationBundle } = oraclesData[index];
                return {
                    templateId,
                    lowerBound,
                    higherBound,
                    // TODO: dynamic weight
                    weight: BigNumber.from("1"),
                    value: initializationBundle.value,
                    data: initializationBundle.data,
                };
            }),
            false,
        ]
    );
};
