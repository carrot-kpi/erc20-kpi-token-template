import { Template } from "@carrot-kpi/sdk";
import { BigNumber, utils } from "ethers";
import { OracleData, OutcomeData } from "../types";

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
