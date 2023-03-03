import { ReactElement, useCallback, useLayoutEffect, useState } from "react";
import { Address, erc20ABI, useAccount, useContractReads } from "wagmi";
import { CollateralApproval } from "../collateral-approval";
import {
    CollateralData,
    OracleData,
    OutcomeData,
    SpecificationData,
    TokenData,
} from "../../types";
import { BigNumber, constants } from "ethers";
import { Button, Typography } from "@carrot-kpi/ui";
import {
    NamespacedTranslateFunction,
    useDecentralizedStorageUploader,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { CollateralsTable } from "../collaterals/table";
import { ReactComponent as Info } from "../../../assets/info.svg";
import { encodeKPITokenData } from "../../utils/data-encoding";

type Assert = (data: OracleData[]) => asserts data is Required<OracleData>[];
const assertRequiredOraclesData: Assert = (data) => {
    for (const item of data) if (!item.initializationBundle) throw new Error();
};

interface DeployProps {
    t: NamespacedTranslateFunction;
    targetAddress: Address;
    specificationData: SpecificationData;
    tokenData: TokenData;
    collateralsData: CollateralData[];
    oracleTemplatesData: Template[];
    outcomesData: OutcomeData[];
    oraclesData: OracleData[];
    onNext: () => void;
}

export const Deploy = ({
    t,
    targetAddress,
    specificationData,
    tokenData,
    collateralsData,
    oracleTemplatesData,
    outcomesData,
    oraclesData,
    onNext,
}: DeployProps): ReactElement => {
    const { address } = useAccount();
    const uploadToDecentralizeStorage = useDecentralizedStorageUploader("ipfs");
    const { data: allowances } = useContractReads({
        contracts: collateralsData.map((collateralData) => {
            return {
                address: collateralData.amount.currency.address,
                abi: erc20ABI,
                functionName: "allowance",
                args: [address ?? constants.AddressZero, targetAddress],
            };
        }),
    });

    const [toApprove, setToApprove] = useState<CollateralData[]>([]);
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        if (!allowances || allowances.length !== collateralsData.length) return;
        const newToApprove = [];
        for (let i = 0; i < collateralsData.length; i++) {
            const collateralData = collateralsData[i];
            if (
                (allowances[i] as unknown as BigNumber).gte(
                    collateralData.amount.raw
                )
            )
                continue;
            newToApprove.push(collateralData);
        }
        setToApprove(newToApprove);
    }, [allowances, collateralsData]);

    const handleApproved = useCallback(() => {
        setToApprove([]);
    }, []);

    const handleCreate = useCallback(() => {
        if (!tokenData) return;
        const create = async () => {
            setLoading(true);
            try {
                assertRequiredOraclesData(oraclesData);
                // TODO: implement the actual deployment
                const descriptionCid = await uploadToDecentralizeStorage(
                    JSON.stringify(specificationData)
                );
                encodeKPITokenData(
                    descriptionCid,
                    specificationData,
                    collateralsData,
                    tokenData,
                    oracleTemplatesData,
                    outcomesData,
                    oraclesData
                );
                oraclesData.reduce(
                    (accumulator, { initializationBundle }) =>
                        accumulator.add(initializationBundle.value),
                    BigNumber.from("0")
                );
                onNext();
            } catch (error) {
                console.warn("error while creating", error);
            } finally {
                setLoading(false);
            }
        };
        void create();
    }, [
        collateralsData,
        onNext,
        oracleTemplatesData,
        oraclesData,
        outcomesData,
        specificationData,
        tokenData,
        uploadToDecentralizeStorage,
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xxl w-full flex flex-col gap-6 border border-black p-4">
                <CollateralsTable
                    noBorder
                    t={t}
                    collaterals={collateralsData}
                    noEdit
                />
                <div className="w-full rounded-xxl flex items-center gap-4 border border-gray-600 p-3">
                    <Info className="w-6 h-6 text-gray-600" />
                    <Typography
                        variant="sm"
                        className={{ root: "flex-1 text-gray-600" }}
                    >
                        {t("info.approve")}
                    </Typography>
                </div>
                <CollateralApproval
                    t={t}
                    toApprove={toApprove}
                    spender={targetAddress}
                    onApproved={handleApproved}
                />
            </div>
            <div className="flex justify-between">
                <Button
                    size="small"
                    onClick={handleCreate}
                    disabled={toApprove.length > 0}
                    loading={loading}
                >
                    {t("label.create")}
                </Button>
            </div>
        </div>
    );
};
