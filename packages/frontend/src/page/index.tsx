import "../global.css";
import "@carrot-kpi/ui/styles.css";

import { Amount, Token, type SupportedChain } from "@carrot-kpi/sdk";
import { Button, ErrorFeedback, Typography } from "@carrot-kpi/ui";
import { type ReactElement, useEffect, useState } from "react";
import {
    OraclePage,
    type KPITokenRemotePageProps,
    useWagmiPassiveHook,
} from "@carrot-kpi/react";
import type { RewardData } from "./types";
import {
    usePublicClient,
    useWalletClient,
    useReadContract,
    useAccount,
    useReadContracts,
} from "wagmi";
import { ReactComponent as External } from "../assets/external.svg";
import { Loader } from "../ui/loader";
import { CampaignCard } from "./components/campaign-card";
import { WalletPosition } from "./components/wallet-position";
import { ExpandableContent } from "../ui/expandable-content";
import { decodeKPITokenData } from "../utils/data-decoding";
import type { FinalizableOracle } from "./types";
import ERC20_KPI_TOKEN_ABI from "../abis/erc20-kpi-token";
import { useWatchKPITokenData } from "./hooks/useWatchKPITokenData";
import {
    erc20Abi,
    type Address,
    type PublicClient,
    type Transport,
} from "viem";

export const Component = ({
    i18n,
    t,
    kpiToken,
    onTx,
}: KPITokenRemotePageProps): ReactElement => {
    const publicClient = usePublicClient() as PublicClient<
        Transport,
        SupportedChain | undefined
    >;
    const { data: walletClient } = useWalletClient();
    const { chain } = useAccount();

    const { data: tokenData, isLoading: loadingTokenData } = useReadContracts({
        contracts: [
            {
                address: kpiToken?.address,
                abi: erc20Abi,
                functionName: "name",
            },
            {
                address: kpiToken?.address,
                abi: erc20Abi,
                functionName: "decimals",
            },
            {
                address: kpiToken?.address,
                abi: erc20Abi,
                functionName: "symbol",
            },
        ],
        allowFailure: false,
        query: { enabled: !!kpiToken?.address },
    });
    const kpiTokenData = useWatchKPITokenData({
        kpiTokenAddress: kpiToken?.address,
    });
    const { data: rawTotalSupply, isLoading: loadingRawTotalSupply } =
        useWagmiPassiveHook({
            hook: useReadContract,
            params: {
                address: kpiToken?.address as Address,
                abi: ERC20_KPI_TOKEN_ABI,
                functionName: "totalSupply",
            },
        });

    const [decodingKPITokenData, setDecodingKPITokenData] = useState(false);
    const [erc20KPIToken, setERC20KPIToken] = useState<Token>();
    const [rewards, setRewards] = useState<RewardData[]>([]);
    const [oracles, setOracles] = useState<FinalizableOracle[]>([]);
    const [allOrNone, setAllOrNone] = useState(false);
    const [jitFunding, setJitFunding] = useState(false);
    const [initialSupply, setInitialSupply] = useState<Amount<Token> | null>(
        null,
    );
    const [currentSupply, setCurrentSupply] = useState<Amount<Token> | null>(
        null,
    );
    const [openInExplorerHref, setOpenInExplorerHref] = useState("");

    useEffect(() => {
        if (
            !kpiToken?.chainId ||
            !kpiToken.address ||
            !tokenData?.[2] ||
            !tokenData?.[0]
        )
            return;
        setERC20KPIToken(
            new Token(
                kpiToken.chainId,
                kpiToken.address,
                18,
                tokenData[2],
                tokenData[0],
            ),
        );
    }, [kpiToken?.address, kpiToken?.chainId, tokenData]);

    useEffect(() => {
        let cancelled = false;
        const decodeData = async () => {
            if (!kpiTokenData?.data || !publicClient || !erc20KPIToken) return;
            if (!cancelled) setDecodingKPITokenData(true);
            let decoded;
            try {
                decoded = await decodeKPITokenData(
                    publicClient,
                    kpiTokenData.data,
                );
            } catch (error) {
                console.warn("could not decode kpi token data", error);
            } finally {
                if (!cancelled) setDecodingKPITokenData(false);
            }
            if (!decoded) return;
            if (!cancelled) {
                setRewards(decoded.rewards);
                setOracles(decoded.finalizableOracles);
                setAllOrNone(decoded.allOrNone);
                setJitFunding(decoded.jitFunding);
                setInitialSupply(
                    new Amount(erc20KPIToken, decoded.initialSupply),
                );
            }
        };
        void decodeData();
        return () => {
            cancelled = true;
        };
    }, [kpiTokenData?.data, publicClient, erc20KPIToken]);

    useEffect(() => {
        if (
            !kpiToken?.chainId ||
            !kpiToken?.address ||
            !erc20KPIToken ||
            rawTotalSupply === undefined
        )
            return;
        setCurrentSupply(new Amount(erc20KPIToken, rawTotalSupply as bigint));
    }, [kpiToken?.chainId, kpiToken?.address, rawTotalSupply, erc20KPIToken]);

    useEffect(() => {
        if (!chain || !chain.blockExplorers || !kpiToken) return;
        setOpenInExplorerHref(
            `${chain.blockExplorers.default.url}/address/${kpiToken.address}`,
        );
    }, [chain, kpiToken]);

    if (!kpiToken) {
        return (
            <div className="h-screen py-20 bg-orange text-black flex justify-center">
                <Loader />
            </div>
        );
    }

    const handleWatchERC20 = async () => {
        if (!walletClient || !tokenData) return;
        try {
            await walletClient.watchAsset({
                options: {
                    address: kpiToken?.address,
                    decimals: tokenData[1],
                    symbol: tokenData[2],
                },
                type: "ERC20",
            });
        } catch (error) {
            console.error("could not add KPI token to wallet", error);
        }
    };

    const loading =
        decodingKPITokenData || loadingTokenData || loadingRawTotalSupply;

    return (
        <div className="overflow-x-hidden">
            <div className="bg-grid-light bg-orange flex flex-col items-center gap-6 px-4 sm:px-9 lg:px-20 pb-16 sm:pb-16 md:pb-16  pt-8">
                <div className="w-full max-w-screen-2xl">
                    <Typography
                        variant="h1"
                        className={{
                            root: "dark:text-black",
                        }}
                        truncate
                    >
                        {kpiToken.specification.title}
                    </Typography>
                </div>
                <div className="w-full max-w-screen-2xl flex gap-6">
                    <Button
                        data-testid="page-open-explorer-button"
                        size="xsmall"
                        iconPlacement="right"
                        icon={External}
                        variant="primary"
                        href={openInExplorerHref}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("open.explorer")}
                    </Button>
                    <Button
                        data-testid="page-add-reward-button"
                        size="xsmall"
                        onClick={handleWatchERC20}
                    >
                        {t("erc20.track", {
                            symbol: tokenData?.[2],
                        })}
                    </Button>
                </div>
                <CampaignCard
                    t={t}
                    loading={loading}
                    kpiToken={kpiToken}
                    rewards={rewards}
                    allOrNone={allOrNone}
                    initialSupply={initialSupply}
                    currentSupply={currentSupply}
                />
            </div>
            <div className="bg-white dark:bg-black">
                <div className="bg-grid-light dark:bg-grid-dark flex flex-col items-center gap-7 md:gap-9 lg:gap-28 bg-white px-4 pt-4 pb-20 dark:bg-black sm:px-9 sm:pt-6 sm:pb-28 lg:px-20 md:pt-24 md:pb-40">
                    <div className="w-full max-w-screen-2xl flex flex-col mt-5 sm:mt-0 gap-6 md:gap-8">
                        <Typography variant="h2">
                            {t("position.title")}
                        </Typography>
                        <WalletPosition
                            t={t}
                            onTx={onTx}
                            loading={loading}
                            kpiToken={kpiToken}
                            rewards={rewards}
                            oracles={oracles}
                            erc20Symbol={tokenData?.[2]}
                            erc20Name={tokenData?.[0]}
                            initialSupply={initialSupply}
                            currentSupply={currentSupply}
                            jitFunding={jitFunding}
                        />
                    </div>
                    <div className="w-full max-w-screen-2xl flex flex-col gap-6 md:gap-8">
                        <Typography variant="h2">
                            {t("oracle.title", {
                                count: kpiToken.oracles.length,
                            })}
                        </Typography>
                        {kpiToken.oracles.length === 1 ? (
                            <div className="bg-white dark:bg-black border border-black">
                                <OraclePage
                                    i18n={i18n}
                                    fallback={
                                        <div className="p-6">
                                            <Loader />
                                        </div>
                                    }
                                    error={
                                        <div className="flex justify-center">
                                            <ErrorFeedback
                                                messages={{
                                                    title: t(
                                                        "error.initializing.creation.title",
                                                    ),
                                                    description: t(
                                                        "error.initializing.creation.description",
                                                    ),
                                                }}
                                            />
                                        </div>
                                    }
                                    kpiToken={kpiToken}
                                    oracle={kpiToken.oracles[0]}
                                    onTx={onTx}
                                />
                            </div>
                        ) : (
                            kpiToken.oracles.map((oracle) => {
                                return (
                                    <ExpandableContent
                                        key={oracle.address}
                                        summary="Oracle template"
                                    >
                                        <div className="w-full max-w-screen-2xl p-10 bg-white dark:bg-black">
                                            <OraclePage
                                                i18n={i18n}
                                                fallback={<Loader />}
                                                error={
                                                    <div className="flex justify-center">
                                                        <ErrorFeedback
                                                            messages={{
                                                                title: t(
                                                                    "error.initializing.oraclePage.title",
                                                                ),
                                                                description: t(
                                                                    "error.initializing.oraclePage.description",
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                }
                                                kpiToken={kpiToken}
                                                oracle={kpiToken.oracles[0]}
                                                onTx={onTx}
                                            />
                                        </div>
                                    </ExpandableContent>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
