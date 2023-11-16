import "../global.css";
import "@carrot-kpi/ui/styles.css";

import { Amount, Token } from "@carrot-kpi/sdk";
import { Button, ErrorFeedback, Typography } from "@carrot-kpi/ui";
import { type ReactElement, useEffect, useState } from "react";
import { OraclePage, type KPITokenRemotePageProps } from "@carrot-kpi/react";
import type { RewardData } from "./types";
import {
    type Address,
    useNetwork,
    usePublicClient,
    useToken,
    useWalletClient,
} from "wagmi";
import { ReactComponent as External } from "../assets/external.svg";
import { Loader } from "../ui/loader";
import { CampaignCard } from "./components/campaign-card";
import { WalletPosition } from "./components/wallet-position";
import { ExpandableContent } from "../ui/expandable-content";
import { decodeKPITokenData } from "../utils/data-decoding";
import type { FinalizableOracle } from "./types";

export const Component = ({
    i18n,
    t,
    kpiToken,
    onTx,
}: KPITokenRemotePageProps): ReactElement => {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const { chain } = useNetwork();

    const { data: tokenData } = useToken({
        address: kpiToken?.address as Address,
        staleTime: 2_000,
    });

    const [decodingKPITokenData, setDecodingKPITokenData] = useState(false);
    const [rewards, setRewards] = useState<RewardData[]>([]);
    const [oracles, setOracles] = useState<FinalizableOracle[]>([]);
    const [allOrNone, setAllOrNone] = useState(false);
    const [initialSupply, setInitialSupply] = useState<Amount<Token> | null>(
        null,
    );
    const [openInExplorerHref, setOpenInExplorerHref] = useState("");

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            if (!kpiToken) return;
            if (!cancelled) setDecodingKPITokenData(true);
            let decoded;
            try {
                decoded = await decodeKPITokenData(publicClient, kpiToken.data);
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
            }
            if (!tokenData?.symbol || !tokenData.name) return;
            const erc20KPIToken = new Token(
                kpiToken.chainId,
                kpiToken.address,
                18,
                tokenData.symbol,
                tokenData.name,
            );
            setInitialSupply(new Amount(erc20KPIToken, decoded.initialSupply));
        };
        void fetchData();
        return () => {
            cancelled = true;
        };
    }, [kpiToken, publicClient, tokenData?.name, tokenData?.symbol]);

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
                    address: tokenData.address,
                    decimals: tokenData.decimals,
                    symbol: tokenData.symbol,
                },
                type: "ERC20",
            });
        } catch (error) {
            console.error("could not add KPI token to wallet", error);
        }
    };

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
                        data-testid={"page-open-explorer-button"}
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
                        data-testid={"page-add-reward-button"}
                        size="xsmall"
                        onClick={handleWatchERC20}
                    >
                        {t("erc20.track", {
                            symbol: tokenData?.symbol,
                        })}
                    </Button>
                </div>
                <CampaignCard
                    t={t}
                    loading={decodingKPITokenData}
                    kpiToken={kpiToken}
                    rewards={rewards}
                    allOrNone={allOrNone}
                    initialSupply={initialSupply?.raw}
                    erc20Name={tokenData?.name}
                    erc20Symbol={tokenData?.symbol}
                    erc20Supply={tokenData?.totalSupply.value}
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
                            loading={decodingKPITokenData}
                            kpiToken={kpiToken}
                            rewards={rewards}
                            oracles={oracles}
                            erc20Symbol={tokenData?.symbol}
                            erc20Name={tokenData?.name}
                            initialSupply={initialSupply}
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
