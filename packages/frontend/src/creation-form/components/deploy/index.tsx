import { ReactElement, useCallback, useEffect, useState } from "react";
import { Address, erc20ABI, useAccount, useContractReads } from "wagmi";
import { CollateralApproval } from "../collateral-approval";
import {
    CollateralData,
    OracleData,
    OutcomeData,
    SpecificationData,
    TokenData,
} from "../../types";
import { BigNumber, constants, utils } from "ethers";
import { Button } from "@carrot-kpi/ui";
import {
    NamespacedTranslateFunction,
    useDecentralizedStorageUploader,
} from "@carrot-kpi/react";
import CREATION_PROXY_ABI from "../../../abis/creation-proxy.json";
import { Template } from "@carrot-kpi/sdk";
import { PreviousButton } from "../previous-button";

const CREATION_PROXY_INTERFACE = new utils.Interface(CREATION_PROXY_ABI);

interface DeployProps {
    t: NamespacedTranslateFunction;
    targetAddress: Address;
    specificationData: SpecificationData;
    tokenData: TokenData;
    collateralsData: CollateralData[];
    oracleTemplatesData: Template[];
    outcomesData: OutcomeData[];
    oraclesData: OracleData[];
    onPrevious: () => void;
    onNext: (data: string, value: BigNumber) => void;
}

interface ApprovalStatusMap {
    [key: Address]: boolean;
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
    onPrevious,
    onNext,
}: DeployProps): ReactElement => {
    const { address } = useAccount();
    const uploadToDecentralizeStorage = useDecentralizedStorageUploader(
        __DEV__ ? "playground" : "ipfs"
    );
    const { data } = useContractReads({
        contracts: collateralsData.map((collateralData) => {
            return {
                address: collateralData.amount.currency.address,
                abi: erc20ABI,
                functionName: "allowance",
                args: [address ?? constants.AddressZero, targetAddress],
            };
        }),
        watch: true,
    });

    const [approved, setApproved] = useState<ApprovalStatusMap>({});
    const [allApproved, setAllApproved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setApproved(
            collateralsData.reduce(
                (accumulator: ApprovalStatusMap, collateral, index) => {
                    const address = collateral.amount.currency
                        .address as Address;
                    if (!data || data.length === 0 || !data[index]) {
                        accumulator[address] = false;
                        return accumulator;
                    }
                    accumulator[address] = (
                        data[index] as unknown as BigNumber
                    ).gte(collateral.amount.raw);
                    return accumulator;
                },
                {}
            )
        );
    }, [collateralsData, data]);

    useEffect(() => {
        const values = Object.values(approved);
        if (values.length === 0) return;
        for (const approval of values) {
            if (!approval) {
                setAllApproved(false);
                return;
            }
        }
        setAllApproved(true);
    }, [approved]);

    const handleCreate = useCallback(() => {
        if (!tokenData) return;
        const uploadToIpfsAndDone = async () => {
            setLoading(true);
            let cid;
            try {
                cid = await uploadToDecentralizeStorage(
                    JSON.stringify(specificationData)
                );
            } finally {
                setLoading(false);
            }
            onNext(
                CREATION_PROXY_INTERFACE.encodeFunctionData(
                    "createERC20KPIToken",
                    [
                        cid,
                        // TODO: dynamic expiration
                        BigNumber.from(Math.floor(Date.now() + 86_400_000)),
                        collateralsData.map((collateral) => ({
                            token: collateral.amount.currency.address,
                            amount: collateral.amount.raw,
                            minimumPayout: collateral.minimumPayout.raw,
                        })),
                        tokenData.name,
                        tokenData.symbol,
                        tokenData.supply,
                        utils.defaultAbiCoder.encode(
                            [
                                "tuple(uint256 templateId,uint256 lowerBound,uint256 higherBound,uint256 weight,uint256 value,bytes data)[]",
                                "bool",
                            ],
                            [
                                oracleTemplatesData.map(
                                    ({ id: templateId }, index) => {
                                        const { lowerBound, higherBound } =
                                            outcomesData[index];
                                        const { value, data } =
                                            oraclesData[index];
                                        return {
                                            templateId,
                                            lowerBound,
                                            higherBound,
                                            // TODO: dynamic weight
                                            weight: BigNumber.from("1"),
                                            value,
                                            data,
                                        };
                                    }
                                ),
                                false,
                            ]
                        ),
                    ]
                ),
                oraclesData.reduce(
                    (accumulator, { value }) => accumulator.add(value),
                    BigNumber.from("0")
                )
            );
        };
        void uploadToIpfsAndDone();
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
        <>
            {collateralsData.map((collateral) => {
                const address = collateral.amount.currency.address as Address;
                return (
                    <CollateralApproval
                        key={address}
                        disabled={approved[address]}
                        collateral={collateral}
                        spender={targetAddress}
                    />
                );
            })}
            <div className="flex justify-between">
                <PreviousButton t={t} onClick={onPrevious} />
                <Button
                    size="small"
                    onClick={handleCreate}
                    disabled={!allApproved}
                    loading={loading}
                >
                    Create
                </Button>
            </div>
        </>
    );
};
