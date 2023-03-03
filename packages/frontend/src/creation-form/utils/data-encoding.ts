import { Template } from "@carrot-kpi/sdk";
import { BigNumber, utils } from "ethers";
import {
    CollateralData,
    OracleData,
    OutcomeData,
    SpecificationData,
    TokenData,
} from "../types";
import CREATION_PROXY_ABI from "../../abis/creation-proxy.json";
import { unixTimestamp } from "../../utils/dates";

const encodeOraclesData = (
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

const CREATION_PROXY_INTERFACE = new utils.Interface(CREATION_PROXY_ABI);

export const encodeKPITokenData = (
    descriptionCid: string,
    specificationData: SpecificationData,
    collateralsData: CollateralData[],
    tokenData: TokenData,
    oracleTemplatesData: Template[],
    outcomesData: OutcomeData[],
    oraclesData: Required<OracleData>[]
) => {
    return CREATION_PROXY_INTERFACE.encodeFunctionData("createERC20KPIToken", [
        descriptionCid,
        unixTimestamp(specificationData.expiration),
        collateralsData.map((collateral) => ({
            token: collateral.amount.currency.address,
            amount: collateral.amount.raw,
            minimumPayout: collateral.minimumPayout.raw,
        })),
        tokenData.name,
        tokenData.symbol,
        tokenData.supply,
        encodeOraclesData(oracleTemplatesData, outcomesData, oraclesData),
    ]);
};
