import {
    ReactElement,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import {
    Address,
    erc20ABI,
    useAccount,
    useNetwork,
    useContractRead,
    useContractReads,
    useContractWrite,
    usePrepareContractWrite,
    usePublicClient,
} from "wagmi";
import {
    CollateralData,
    OracleData,
    OutcomeData,
    TokenData,
} from "../../types";
import { Button, Typography } from "@carrot-kpi/ui";
import {
    KPITokenCreationFormProps,
    NamespacedTranslateFunction,
    TxType,
} from "@carrot-kpi/react";
import {
    CHAIN_ADDRESSES,
    ChainId,
    FACTORY_ABI,
    KPI_TOKENS_MANAGER_ABI,
    Template,
} from "@carrot-kpi/sdk";
import { CollateralsTable } from "../collaterals/table";
import { ReactComponent as Info } from "../../../assets/info.svg";
import {
    encodeKPITokenData,
    encodeOraclesData,
} from "../../utils/data-encoding";
import { ApproveCollateralsButton } from "../approve-collaterals-button";
import { unixTimestamp } from "../../../utils/dates";
import { getKPITokenAddressFromReceipt } from "../../../utils/logs";
import { zeroAddress } from "viem";

type Assert = (data: OracleData[]) => asserts data is Required<OracleData>[];
export const assertRequiredOraclesData: Assert = (data) => {
    for (const item of data) if (!item.initializationBundle) throw new Error();
};

interface DeployProps {
    t: NamespacedTranslateFunction;
    templateId: number;
    specificationCID: string;
    expiration: Date;
    tokenData: TokenData;
    collateralsData: CollateralData[];
    oracleTemplatesData: Template[];
    outcomesData: OutcomeData[];
    oraclesData: Required<OracleData>[];
    onNext: (address: string) => void;
    onCreate: KPITokenCreationFormProps["onCreate"];
    onTx: KPITokenCreationFormProps["onTx"];
}

export const Deploy = ({
    t,
    templateId,
    specificationCID,
    expiration,
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
    const { chain } = useNetwork();
    const publicClient = usePublicClient();

    const { factoryAddress, kpiTokensManagerAddress } = useMemo(() => {
        if (!chain)
            return {
                factoryAddress: undefined,
                kpiTokensManagerAddress: undefined,
            };
        const chainAddresses = CHAIN_ADDRESSES[chain.id as ChainId];
        return chainAddresses
            ? {
                  factoryAddress: chainAddresses.factory as Address,
                  kpiTokensManagerAddress:
                      chainAddresses.kpiTokensManager as Address,
              }
            : { factoryAddress: undefined, kpiTokensManagerAddress: undefined };
    }, [chain]);

    const { data: predictedKPITokenAddress } = useContractRead({
        address: kpiTokensManagerAddress,
        abi: KPI_TOKENS_MANAGER_ABI,
        functionName: "predictInstanceAddress",
        args: address && [
            address,
            BigInt(templateId),
            specificationCID,
            BigInt(unixTimestamp(expiration)),
            encodeKPITokenData(
                collateralsData,
                tokenData.name,
                tokenData.symbol,
                tokenData.supply
            ),
            encodeOraclesData(oracleTemplatesData, outcomesData, oraclesData),
        ],
        enabled: !!address,
    });
    const { data: allowances } = useContractReads({
        contracts:
            address &&
            predictedKPITokenAddress &&
            collateralsData.map((collateralData) => {
                return {
                    address: collateralData.amount.currency.address as Address,
                    abi: erc20ABI,
                    functionName: "allowance",
                    args: [address, predictedKPITokenAddress],
                };
            }),
        enabled: !!address && !!predictedKPITokenAddress,
    });

    const [toApprove, setToApprove] = useState<CollateralData[]>([]);
    const [approved, setApproved] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        config,
        isLoading: loadingTxConfig,
        isFetching: fetchingTxConfig,
    } = usePrepareContractWrite({
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "createToken",
        args: [
            BigInt(templateId),
            specificationCID,
            BigInt(unixTimestamp(expiration)),
            encodeKPITokenData(
                collateralsData,
                tokenData.name,
                tokenData.symbol,
                tokenData.supply
            ) as `0x${string}`,
            encodeOraclesData(
                oracleTemplatesData,
                outcomesData,
                oraclesData
            ) as `0x${string}`,
        ],
        enabled: approved,
        value: 0n,
    });
    const { writeAsync } = useContractWrite(config);

    useLayoutEffect(() => {
        if (!allowances || allowances.length !== collateralsData.length) return;
        const newToApprove = [];
        for (let i = 0; i < collateralsData.length; i++) {
            const collateralData = collateralsData[i];
            if (!allowances[i]?.result) return;
            if ((allowances[i].result as bigint) >= collateralData.amount.raw)
                continue;
            newToApprove.push(collateralData);
        }
        setToApprove(newToApprove);
    }, [allowances, collateralsData]);

    useEffect(() => {
        if (!allowances) return;
        setApproved(toApprove.length === 0);
    }, [allowances, toApprove.length]);

    const handleApproved = useCallback(() => {
        setToApprove([]);
    }, []);

    const handleCreate = useCallback(() => {
        if (!writeAsync) return;
        const create = async () => {
            setLoading(true);
            try {
                const tx = await writeAsync();
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx.hash,
                    confirmations: __DEV__ ? 1 : 3,
                });
                let createdKPITokenAddress =
                    getKPITokenAddressFromReceipt(receipt);
                if (!createdKPITokenAddress) {
                    console.warn(
                        "could not extract created kpi token address from logs"
                    );
                    createdKPITokenAddress = zeroAddress;
                }
                onCreate();
                onTx({
                    type: TxType.KPI_TOKEN_CREATION,
                    from: receipt.from,
                    hash: tx.hash,
                    payload: {
                        address: createdKPITokenAddress,
                    },
                    receipt: {
                        ...receipt,
                        to: receipt.to || zeroAddress,
                        contractAddress: receipt.contractAddress || zeroAddress,
                        blockNumber: Number(receipt.blockNumber),
                        status: receipt.status === "success" ? 1 : 0,
                    },
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
    }, [onCreate, onNext, onTx, publicClient, writeAsync]);

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
                    spender={predictedKPITokenAddress as Address}
                    onApproved={handleApproved}
                    onTx={onTx}
                />
            </div>
            <div className="flex justify-between">
                <Button
                    size="small"
                    onClick={handleCreate}
                    disabled={!writeAsync}
                    loading={loading || loadingTxConfig || fetchingTxConfig}
                >
                    {t("label.create")}
                </Button>
            </div>
        </div>
    );
};
