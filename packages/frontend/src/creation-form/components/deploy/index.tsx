import {
    type ReactElement,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import {
    type Address,
    erc20ABI,
    useAccount,
    useNetwork,
    useContractRead,
    useContractReads,
    useContractWrite,
    usePrepareContractWrite,
    usePublicClient,
} from "wagmi";
import type { CollateralData, OracleData, TokenData } from "../../types";
import { Button, ErrorText } from "@carrot-kpi/ui";
import {
    type KPITokenCreationFormProps,
    type NamespacedTranslateFunction,
    TxType,
    useDevMode,
} from "@carrot-kpi/react";
import {
    CHAIN_ADDRESSES,
    ChainId,
    FACTORY_ABI,
    KPI_TOKENS_MANAGER_ABI,
    Template,
} from "@carrot-kpi/sdk";
import { CollateralsTable } from "../collaterals/table";
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
    oraclesData,
    onNext,
    onCreate,
    onTx,
}: DeployProps): ReactElement => {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const publicClient = usePublicClient();
    const devMode = useDevMode();

    const { factoryAddress, kpiTokensManagerAddress } = useMemo(() => {
        if (!chain)
            return {
                factoryAddress: undefined,
                kpiTokensManagerAddress: undefined,
            };
        const chainAddresses = CHAIN_ADDRESSES[chain.id as ChainId];
        return chainAddresses
            ? {
                  factoryAddress: chainAddresses.factory,
                  kpiTokensManagerAddress: chainAddresses.kpiTokensManager,
              }
            : { factoryAddress: undefined, kpiTokensManagerAddress: undefined };
    }, [chain]);

    const { encodedOraclesData, encodedKPITokenData, totalValueRequired } =
        useMemo(() => {
            const { data: encodedOraclesData, totalValueRequired } =
                encodeOraclesData(oracleTemplatesData, oraclesData);
            return {
                encodedOraclesData,
                encodedKPITokenData: encodeKPITokenData(
                    collateralsData,
                    tokenData.name,
                    tokenData.symbol,
                    tokenData.supply,
                ),
                totalValueRequired,
            };
        }, [
            collateralsData,
            oracleTemplatesData,
            oraclesData,
            tokenData.name,
            tokenData.supply,
            tokenData.symbol,
        ]);

    const { data: predictedKPITokenAddress } = useContractRead({
        address: kpiTokensManagerAddress,
        abi: KPI_TOKENS_MANAGER_ABI,
        functionName: "predictInstanceAddress",
        args: address && [
            address,
            BigInt(templateId),
            specificationCID,
            BigInt(unixTimestamp(expiration)),
            encodedKPITokenData,
            encodedOraclesData,
        ],
        enabled: !!address,
    });
    const { data: allowances } = useContractReads({
        contracts:
            address &&
            predictedKPITokenAddress &&
            collateralsData.map((collateralData) => {
                return {
                    address: collateralData.amount.currency.address,
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
        error,
        isError,
    } = usePrepareContractWrite({
        chainId: chain?.id,
        address: factoryAddress,
        abi: FACTORY_ABI,
        functionName: "createToken",
        args: [
            BigInt(templateId),
            specificationCID,
            BigInt(unixTimestamp(expiration)),
            encodedKPITokenData,
            encodedOraclesData,
        ],
        enabled: !!chain?.id && approved,
        value: totalValueRequired,
    });
    const { writeAsync } = useContractWrite(config);

    useLayoutEffect(() => {
        if (!allowances || allowances.length !== collateralsData.length) return;
        const newToApprove = [];
        for (let i = 0; i < collateralsData.length; i++) {
            const collateralData = collateralsData[i];
            if (
                allowances[i]?.result === null ||
                allowances[i]?.result === undefined
            )
                return;
            if ((allowances[i].result as bigint) >= collateralData.amount.raw)
                continue;
            newToApprove.push(collateralData);
        }
        setToApprove(newToApprove);
    }, [allowances, collateralsData]);

    useEffect(() => {
        if (!allowances || allowances.length !== collateralsData.length) return;
        setApproved(toApprove.length === 0);
    }, [allowances, collateralsData.length, toApprove.length]);

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
                    confirmations: devMode ? 1 : 3,
                });
                if (receipt.status === "reverted") {
                    console.warn("creation transaction reverted");
                    return;
                }
                const createdKPITokenAddress =
                    getKPITokenAddressFromReceipt(receipt);
                if (!createdKPITokenAddress) {
                    console.warn(
                        "could not extract created kpi token address from logs",
                    );
                    return;
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
                        from: receipt.from,
                        transactionIndex: receipt.transactionIndex,
                        blockHash: receipt.blockHash,
                        transactionHash: receipt.transactionHash,
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
    }, [devMode, onCreate, onNext, onTx, publicClient, writeAsync]);

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-xxl w-full flex flex-col gap-6 border border-black p-4">
                <CollateralsTable
                    noBorder
                    t={t}
                    collaterals={collateralsData}
                    noEdit
                />
                <div className="h-px w-full bg-black" />
                <div className="flex justify-center">
                    <ApproveCollateralsButton
                        t={t}
                        toApprove={toApprove}
                        spender={predictedKPITokenAddress as Address}
                        onApproved={handleApproved}
                        onTx={onTx}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-3 items-center">
                <Button
                    size="small"
                    onClick={handleCreate}
                    disabled={!writeAsync}
                    loading={loading || loadingTxConfig || fetchingTxConfig}
                >
                    {t("label.deploy")}
                </Button>
                {isError && !!error && (
                    <ErrorText>
                        {/* FIXME: error type returned by wagmi is not complete */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(error as any).shortMessage}
                    </ErrorText>
                )}
            </div>
        </div>
    );
};
