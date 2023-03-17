import { Amount, Token } from "@carrot-kpi/sdk";
import { Button, Typography } from "@carrot-kpi/ui";
import { ReactElement, useEffect, useState } from "react";
import { useWatchData, OraclePage, KPITokenPageProps } from "@carrot-kpi/react";

import "../global.css";
import { CollateralData } from "../creation-form/types";
import { Address, useNetwork, useProvider, useToken } from "wagmi";
import { ReactComponent as External } from "../assets/external.svg";
import { Loader } from "../ui/loader";
import { CampaignCard } from "./components/campaign-card";
import { WalletPosition } from "./components/wallet-position";
import { ExpandableContent } from "../ui/expandable-content";
import { decodeKPITokenData } from "../utils/data-decoding";
import { FinalizableOracle } from "./types";

export const Component = ({
    i18n,
    t,
    kpiToken,
    onTx,
}: KPITokenPageProps): ReactElement => {
    const provider = useProvider();
    const { chain } = useNetwork();

    const { loading: loadingERC20Data, data } = useWatchData(kpiToken?.address);

    const { data: tokenData } = useToken({
        address: kpiToken?.address as Address,
    });

    const [decodingKPITokenData, setDecodingKPITokenData] = useState(false);
    const [collaterals, setCollaterals] = useState<CollateralData[]>([]);
    const [oracles, setOracles] = useState<FinalizableOracle[]>([]);
    const [allOrNone, setAllOrNone] = useState(false);
    const [initialSupply, setInitialSupply] = useState<Amount<Token> | null>(
        null
    );
    const [openInExplorerHref, setOpenInExplorerHref] = useState("");

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            if (!data) return;
            if (!kpiToken) return;
            if (!cancelled) setDecodingKPITokenData(true);
            let decoded;
            try {
                decoded = await decodeKPITokenData(provider, data);
            } catch (error) {
                console.warn("could not decode kpi token data", error);
            } finally {
                if (!cancelled) setDecodingKPITokenData(false);
            }
            if (!decoded) return;
            if (!cancelled) setCollaterals(decoded.collaterals);
            if (!cancelled) setOracles(decoded.finalizableOracles);
            if (!cancelled) setAllOrNone(decoded.allOrNone);
            if (!tokenData?.symbol || !tokenData.name) return;
            const erc20KPIToken = new Token(
                kpiToken.chainId,
                kpiToken.address,
                18,
                tokenData.symbol,
                tokenData.name
            );
            setInitialSupply(new Amount(erc20KPIToken, decoded.initialSupply));
        };
        void fetchData();
        return () => {
            cancelled = true;
        };
    }, [data, kpiToken, provider, tokenData?.name, tokenData?.symbol]);

    useEffect(() => {
        if (!chain || !chain.blockExplorers || !kpiToken) return;
        setOpenInExplorerHref(
            `${chain.blockExplorers.default.url}/address/${kpiToken.address}`
        );
    }, [chain, kpiToken]);

    if (!kpiToken) {
        return (
            <div className="bg-orange py-10 text-black flex justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="overflow-x-hidden">
            <div className="bg-grid-light bg-orange flex flex-col items-center gap-6 px-3 py-4 sm:px-9 sm:py-5 md:items-start lg:px-36 md:py-24">
                <Typography
                    variant="h2"
                    className={{ root: "dark:text-black" }}
                >
                    {kpiToken.specification.title}
                </Typography>
                <div className="flex gap-6">
                    <Button
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
                </div>
                <CampaignCard
                    t={t}
                    loading={decodingKPITokenData || loadingERC20Data}
                    kpiToken={kpiToken}
                    collaterals={collaterals}
                    allOrNone={allOrNone}
                    initialSupply={tokenData?.totalSupply.value}
                    erc20Name={tokenData?.name}
                    erc20Symbol={tokenData?.symbol}
                    erc20Supply={tokenData?.totalSupply.value}
                />
            </div>
            <div className="bg-white dark:bg-black">
                <div className="bg-grid-light dark:bg-grid-dark flex flex-col gap-7 md:gap-9 lg:gap-28 bg-white px-4 py-4 dark:bg-black sm:px-9 sm:py-6 lg:px-36 md:py-24">
                    <div className="flex flex-col mt-5 sm:mt-0 gap-6 md:gap-8 max-w-6xl">
                        <Typography variant="h2">
                            {t("position.title")}
                        </Typography>
                        <WalletPosition
                            t={t}
                            loading={loadingERC20Data || decodingKPITokenData}
                            kpiToken={kpiToken}
                            collaterals={collaterals}
                            oracles={oracles}
                            erc20Symbol={tokenData?.symbol}
                            erc20Name={tokenData?.name}
                            initialSupply={initialSupply}
                        />
                    </div>
                    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl">
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
                                        <div className="w-full max-w-6xl p-10 bg-white dark:bg-black">
                                            <OraclePage
                                                i18n={i18n}
                                                fallback={<Loader />}
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
