import {
    ReactElement,
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import {
    Address,
    erc20ABI,
    useAccount,
    useContractReads,
    useContractWrite,
    usePrepareContractWrite,
} from "wagmi";
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
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
    TxType,
    useDecentralizedStorageUploader,
} from "@carrot-kpi/react";
import { Template } from "@carrot-kpi/sdk";
import { CollateralsTable } from "../collaterals/table";
import { ReactComponent as Info } from "../../../assets/info.svg";
import { encodeOraclesData } from "../../utils/data-encoding";
import CREATION_PROXY_ABI from "../../../abis/creation-proxy.json";
import { ApproveCollateralsButton } from "../approve-collaterals-button";
import { unixTimestamp } from "../../../utils/dates";
import { getKPITokenAddressFromReceipt } from "../../../utils/logs";

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
    onNext: (address: string) => void;
    onCreate: KPITokenCreationFormProps["onCreate"];
    onTx: KPITokenCreationFormProps["onTx"];
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
    onCreate,
    onTx,
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
    const [approved, setApproved] = useState(false);
    const [specificationCID, setSpecificationCID] = useState("");
    const [creationArgs, setCreationArgs] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(false);

    const { config, isLoading: loadingTxConfig } = usePrepareContractWrite({
        address: targetAddress,
        abi: CREATION_PROXY_ABI,
        functionName: "createERC20KPIToken",
        args: creationArgs,
        enabled: creationArgs.length > 0,
    });
    const { writeAsync } = useContractWrite(config);

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

    useEffect(() => {
        if (!allowances) return;
        setApproved(toApprove.length === 0);
    }, [allowances, toApprove.length]);

    // once the collaterals are approved, this uploads the question spec
    // to ipfs and sets creation args
    useEffect(() => {
        if (specificationCID || !approved) return;
        let cancelled = false;
        const uploadAndSetSpecificationCid = async () => {
            if (!cancelled) setLoading(true);
            try {
                const specificationCID = await uploadToDecentralizeStorage(
                    JSON.stringify(specificationData)
                );
                if (!cancelled) setSpecificationCID(specificationCID);
            } catch (error) {
                console.warn(
                    "error while uploading specification to ipfs",
                    error
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void uploadAndSetSpecificationCid();
        return () => {
            cancelled = true;
        };
    }, [
        approved,
        collateralsData,
        oracleTemplatesData,
        oraclesData,
        outcomesData,
        specificationCID,
        specificationData,
        tokenData.name,
        tokenData.supply,
        tokenData.symbol,
        uploadToDecentralizeStorage,
    ]);

    useEffect(() => {
        if (!specificationCID) return;

        try {
            assertRequiredOraclesData(oraclesData);
        } catch (error) {
            console.warn("not all required oracles data is present");
            return;
        }

        setCreationArgs([
            specificationCID,
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
    }, [
        collateralsData,
        oracleTemplatesData,
        oraclesData,
        outcomesData,
        specificationCID,
        specificationData.expiration,
        tokenData.name,
        tokenData.supply,
        tokenData.symbol,
    ]);

    const handleApproved = useCallback(() => {
        setToApprove([]);
    }, []);

    const handleCreate = useCallback(() => {
        if (!writeAsync) return;
        const create = async () => {
            setLoading(true);
            try {
                const tx = await writeAsync();
                const receipt = await tx.wait();
                let createdKPITokenAddress =
                    getKPITokenAddressFromReceipt(receipt);
                if (!createdKPITokenAddress) {
                    console.warn(
                        "could not extract created kpi token address from logs"
                    );
                    createdKPITokenAddress = constants.AddressZero;
                }
                onCreate();
                onTx({
                    type: TxType.KPI_TOKEN_CREATION,
                    from: receipt.from,
                    hash: tx.hash,
                    payload: {
                        address: createdKPITokenAddress,
                    },
                    receipt,
                    timestamp: unixTimestamp(new Date()),
                });
                onNext(createdKPITokenAddress);
            } catch (error) {
                console.warn("could not create kpi token", error);
            } finally {
                setLoading(false);
            }
        };
        void create();
    }, [onCreate, onNext, onTx, writeAsync]);

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
                <ApproveCollateralsButton
                    t={t}
                    toApprove={toApprove}
                    spender={targetAddress}
                    onApproved={handleApproved}
                    onTx={onTx}
                />
            </div>
            <div className="flex justify-between">
                <Button
                    size="small"
                    onClick={handleCreate}
                    disabled={!writeAsync}
                    loading={loading || loadingTxConfig}
                >
                    {t("label.create")}
                </Button>
            </div>
        </div>
    );
};
