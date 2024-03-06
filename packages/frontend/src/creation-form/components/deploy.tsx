import {
    type ReactElement,
    useCallback,
    useMemo,
    useState,
    useEffect,
} from "react";
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useSimulateContract,
    usePublicClient,
} from "wagmi";
import type {
    OracleWithInitializationBundle,
    OracleWithInitializationBundleGetter,
    State,
} from "../types";
import {
    Button,
    DateTimeInput,
    ErrorText,
    FeedbackBox,
    Typography,
} from "@carrot-kpi/ui";
import {
    type KPITokenCreationFormProps,
    type NamespacedTranslateFunction,
    TxType,
    useDevMode,
    useJSONUploader,
    type TemplateComponentStateChangeCallback,
} from "@carrot-kpi/react";
import {
    ChainId,
    FACTORY_ABI,
    KPI_TOKENS_MANAGER_ABI,
    ResolvedTemplate,
    type KPITokenSpecification,
    SUPPORTED_CHAIN,
} from "@carrot-kpi/sdk";
import {
    encodeKPITokenData,
    encodeOracleInitializationData,
} from "../utils/data-encoding";
import { getKPITokenAddressFromReceipt } from "../../utils/logs";
import { zeroAddress, type Hex, type Address } from "viem";
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
    const { address, chain } = useAccount();
    const publicClient = usePublicClient();
    const devMode = useDevMode();
    const uploadJSON = useJSONUploader();

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
        const chainAddresses = SUPPORTED_CHAIN[chain.id as ChainId];
        return chainAddresses
            ? {
                  factoryAddress: chainAddresses.contracts.factory.address,
                  kpiTokensManagerAddress:
                      chainAddresses.contracts.kpiTokensManager.address,
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
                    state.jitFundingFeatureEnabled,
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
        state.jitFundingFeatureEnabled,
    ]);

    // upload specification to decentralized storage and get back the cid,
    // but only after having set the kpi token and oracles initializiation data
    useEffect(() => {
        if (specificationCid) return;
        let cancelled = false;
        const uploadAndGetSpecificationCid = async () => {
            if (!state.title || !state.description) {
                if (!cancelled) setSpecificationCid("");
                return;
            }

            if (!cancelled) setLoading(true);
            try {
                const specification: KPITokenSpecification = {
                    title: state.title,
                    description: state.description,
                    // TODO: add the tags back once they need to be used
                    // tags: state.tags,
                    tags: [],
                };
                const uploadedSpecificationCid =
                    await uploadJSON(specification);
                if (!cancelled) setSpecificationCid(uploadedSpecificationCid);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        uploadAndGetSpecificationCid();
        return () => {
            cancelled = true;
        };
    }, [specificationCid, state.description, state.title, uploadJSON]);

    const {
        data: predictedKPITokenAddress,
        isLoading: loadingPredictedKPITokenAddress,
    } = useReadContract({
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
        query: {
            enabled:
                !!address &&
                !!specificationCid &&
                kpiTokenInitializationData !== "0x" &&
                oraclesInitializationData !== "0x",
        },
    });

    const [approved, setApproved] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        data: simulatedCreateToken,
        isLoading: simulatingCreateToken,
        error,
        isError,
    } = useSimulateContract({
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
        query: {
            enabled:
                !!chain?.id &&
                factoryAddress &&
                approved &&
                !!state.expiration &&
                kpiTokenInitializationData !== "0x" &&
                oraclesInitializationData !== "0x",
        },
        value: totalValue,
    });
    const { writeContractAsync } = useWriteContract();

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
        if (
            !writeContractAsync ||
            !publicClient ||
            !simulatedCreateToken?.request
        )
            return;
        const create = async () => {
            setLoading(true);
            try {
                const tx = await writeContractAsync(
                    simulatedCreateToken.request,
                );
                const receipt = await publicClient.waitForTransactionReceipt({
                    hash: tx,
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
                    hash: tx,
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
    }, [
        simulatedCreateToken?.request,
        devMode,
        onCreate,
        onNext,
        onTx,
        publicClient,
        writeContractAsync,
    ]);

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
            {state.jitFundingFeatureEnabled && (
                <FeedbackBox variant="info">
                    <Typography>{t("deploy.info.jit.funding")}</Typography>
                </FeedbackBox>
            )}
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
                <FeedbackBox variant="info">
                    <Typography>
                        {t("deploy.info.fees", {
                            protocolFee:
                                (Number(protocolFeePpm) / 1_000_000) * 100,
                        })}
                    </Typography>
                </FeedbackBox>
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
                    disabled={!simulatedCreateToken?.request}
                    loading={loading || simulatingCreateToken}
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
