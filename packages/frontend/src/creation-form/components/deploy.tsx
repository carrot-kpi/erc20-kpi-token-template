import {
    type ReactElement,
    useCallback,
    useMemo,
    useState,
    useEffect,
} from "react";
import {
    type Address,
    useAccount,
    useNetwork,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    usePublicClient,
} from "wagmi";
import type {
    OracleWithInitializationBundle,
    OracleWithInitializationBundleGetter,
    State,
} from "../types";
import { Button, DateTimeInput, ErrorText, Typography } from "@carrot-kpi/ui";
import {
    type KPITokenCreationFormProps,
    type NamespacedTranslateFunction,
    TxType,
    useDevMode,
    useDecentralizedStorageUploader,
    type TemplateComponentStateChangeCallback,
} from "@carrot-kpi/react";
import {
    CHAIN_ADDRESSES,
    ChainId,
    FACTORY_ABI,
    KPI_TOKENS_MANAGER_ABI,
    ResolvedTemplate,
    type KPITokenSpecification,
} from "@carrot-kpi/sdk";
import {
    encodeKPITokenData,
    encodeOracleInitializationData,
} from "../utils/data-encoding";
import { getKPITokenAddressFromReceipt } from "../../utils/logs";
import { zeroAddress, type Hex } from "viem";
import {
    dateToUnixTimestamp,
    isUnixTimestampInThePast,
    unixTimestampToDate,
} from "../../utils/dates";
import { RewardsTable } from "./rewards/table";
import { ApproveRewards } from "./approve-rewards";

interface DeployProps {
    t: NamespacedTranslateFunction;
    template: ResolvedTemplate;
    oraclesWithInitializationBundleGetter: OracleWithInitializationBundleGetter[];
    state: State;
    protocolFeePpm: bigint;
    onStateChange: TemplateComponentStateChangeCallback<State>;
    onNext: (createdKPITokenAddress: Address) => void;
    onCreate: KPITokenCreationFormProps<State>["onCreate"];
    onTx: KPITokenCreationFormProps<State>["onTx"];
}

export const Deploy = ({
    t,
    template,
    oraclesWithInitializationBundleGetter,
    state,
    protocolFeePpm,
    onStateChange,
    onNext,
    onCreate,
    onTx,
}: DeployProps): ReactElement => {
    const { address } = useAccount();
    const { chain } = useNetwork();
    const publicClient = usePublicClient();
    const devMode = useDevMode();
    const uploadToDecentralizedStorage = useDecentralizedStorageUploader();

    const [expirationErrorText, setExpirationErrorText] = useState("");
    const [minimumDate, setMinimumDate] = useState(new Date());
    const [specificationCid, setSpecificationCid] = useState("");
    const [kpiTokenInitializationData, setKPITokenInitializationData] =
        useState<Hex>("0x");
    const [oraclesInitializationData, setOraclesInitializationData] =
        useState<Hex>("0x");
    const [totalValue, setTotalValue] = useState(0n);

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

    // set kpi token and oracle initialization data
    useEffect(() => {
        let cancelled = false;
        const getData = async () => {
            if (
                !state.oracles ||
                state.oracles.length === 0 ||
                !state.rewards ||
                state.rewards.length === 0 ||
                !state.tokenName ||
                !state.tokenSymbol ||
                !state.tokenSupply
            ) {
                if (!cancelled) {
                    setKPITokenInitializationData("0x");
                    setOraclesInitializationData("0x");
                    setTotalValue(0n);
                }
                return;
            }

            if (!cancelled) setLoading(true);
            try {
                const oraclesWithInitializationBundle: OracleWithInitializationBundle[] =
                    [];
                for (const oracle of oraclesWithInitializationBundleGetter) {
                    const initializationBundle =
                        await oracle.getInitializationBundle();

                    if (!initializationBundle) {
                        console.warn(
                            "no initialization bundle for oracle with template id",
                            oracle.templateId,
                        );
                        if (!cancelled) {
                            setKPITokenInitializationData("0x");
                            setOraclesInitializationData("0x");
                            setTotalValue(0n);
                        }
                        return;
                    }

                    oraclesWithInitializationBundle.push({
                        ...oracle,
                        initializationBundle,
                    });
                }

                const { data: oraclesInitializationData, totalValueRequired } =
                    encodeOracleInitializationData(
                        oraclesWithInitializationBundle,
                    );
                const kpiTokenInitializationData = encodeKPITokenData(
                    state.rewards,
                    state.tokenName,
                    state.tokenSymbol,
                    BigInt(state.tokenSupply),
                );

                if (!cancelled) {
                    setKPITokenInitializationData(kpiTokenInitializationData);
                    setOraclesInitializationData(oraclesInitializationData);
                    setTotalValue(totalValueRequired);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        getData();
        return () => {
            cancelled = true;
        };
    }, [
        oraclesWithInitializationBundleGetter,
        state.oracles,
        state.rewards,
        state.tokenName,
        state.tokenSupply,
        state.tokenSymbol,
    ]);

    // upload specification to decentralized storage and get back the cid,
    // but only after having set the kpi token and oracles initializiation data
    useEffect(() => {
        if (specificationCid) return;
        let cancelled = false;
        const uploadAndGetSpecificationCid = async () => {
            if (!state.title || !state.description || !state.tags) {
                if (!cancelled) setSpecificationCid("");
                return;
            }

            if (!cancelled) setLoading(true);
            try {
                const specification: KPITokenSpecification = {
                    title: state.title,
                    description: state.description,
                    tags: state.tags,
                };
                const uploadedSpecificationCid =
                    await uploadToDecentralizedStorage(
                        JSON.stringify(specification),
                    );
                if (!cancelled) setSpecificationCid(uploadedSpecificationCid);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        uploadAndGetSpecificationCid();
        return () => {
            cancelled = true;
        };
    }, [
        specificationCid,
        state.description,
        state.tags,
        state.title,
        uploadToDecentralizedStorage,
    ]);

    const {
        data: predictedKPITokenAddress,
        isLoading: loadingPredictedKPITokenAddress,
    } = useContractRead({
        address: kpiTokensManagerAddress,
        abi: KPI_TOKENS_MANAGER_ABI,
        functionName: "predictInstanceAddress",
        args:
            address && state.expiration
                ? [
                      address,
                      BigInt(template.id),
                      specificationCid,
                      BigInt(state.expiration),
                      kpiTokenInitializationData,
                      oraclesInitializationData,
                  ]
                : undefined,
        enabled:
            !!address &&
            !!specificationCid &&
            kpiTokenInitializationData !== "0x" &&
            oraclesInitializationData !== "0x",
    });

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
        args: state.expiration
            ? [
                  BigInt(template.id),
                  specificationCid,
                  BigInt(state.expiration),
                  kpiTokenInitializationData,
                  oraclesInitializationData,
              ]
            : undefined,
        enabled:
            !!chain?.id &&
            factoryAddress &&
            approved &&
            !!state.expiration &&
            kpiTokenInitializationData !== "0x" &&
            oraclesInitializationData !== "0x",
        value: totalValue,
    });
    const { writeAsync } = useContractWrite(config);

    useEffect(() => {
        const interval = setInterval(() => {
            setMinimumDate(
                state.maximumSuggestedExirationTimestamp &&
                    dateToUnixTimestamp(new Date()) <
                        state.maximumSuggestedExirationTimestamp
                    ? unixTimestampToDate(
                          state.maximumSuggestedExirationTimestamp,
                      )
                    : new Date(),
            );
        }, 1_000);
        return () => {
            clearInterval(interval);
        };
    }, [state.maximumSuggestedExirationTimestamp]);

    const handleApprove = useCallback(() => {
        setApproved(true);
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
                    timestamp: dateToUnixTimestamp(new Date()),
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

    const handleExpirationChange = useCallback(
        (value: Date) => {
            const converted = dateToUnixTimestamp(value);
            setExpirationErrorText(
                isUnixTimestampInThePast(converted)
                    ? t("error.expiration.past")
                    : "",
            );
            onStateChange((state) => ({
                ...state,
                expiration: converted,
            }));
        },
        [onStateChange, t],
    );

    return (
        <div className="flex flex-col gap-6">
            <DateTimeInput
                data-testid="deploy-step-expiration-input"
                label={t("deploy.label.expiration")}
                placeholder={t("deploy.placeholder.expiration")}
                onChange={handleExpirationChange}
                value={
                    state.expiration
                        ? unixTimestampToDate(state.expiration)
                        : null
                }
                error={!!expirationErrorText}
                errorText={expirationErrorText}
                info={
                    <>
                        <Typography variant="sm" className={{ root: "mb-2" }}>
                            {t("deploy.info.expiration.1")}
                        </Typography>
                        <Typography variant="sm">
                            {t("deploy.info.expiration.2")}
                        </Typography>
                    </>
                }
                min={minimumDate}
                className={{
                    root: "w-full",
                    input: "w-full",
                    inputWrapper: "w-full",
                }}
            />
            <div className="rounded-xxl w-full flex flex-col gap-6 border border-black p-4">
                <RewardsTable
                    t={t}
                    noBorder
                    noUSDValue
                    rewards={state.rewards}
                    protocolFeePpm={protocolFeePpm}
                    noEdit
                />
                <div className="flex items-center justify-between">
                    <Typography variant="sm">
                        {t("label.rewards.picker.fee", {
                            fee: `${Number(protocolFeePpm) / 10_000}%`,
                        })}
                    </Typography>
                </div>
                <ApproveRewards
                    t={t}
                    loading={loadingPredictedKPITokenAddress}
                    rewards={state.rewards}
                    protocolFeePpm={protocolFeePpm}
                    spender={predictedKPITokenAddress}
                    onApprove={handleApprove}
                    onTx={onTx}
                />
            </div>
            <div className="flex flex-col gap-3">
                <Button
                    data-testid="deploy-step-create-button"
                    size="small"
                    onClick={handleCreate}
                    disabled={!writeAsync}
                    loading={loading || loadingTxConfig || fetchingTxConfig}
                    className={{ root: "w-full" }}
                >
                    {t("label.create")}
                </Button>
                {isError && !!error && (
                    <ErrorText>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(error as any).shortMessage}
                    </ErrorText>
                )}
            </div>
        </div>
    );
};
