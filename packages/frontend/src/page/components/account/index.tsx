import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { Skeleton, Typography } from "@carrot-kpi/ui";
import { commify, formatUnits } from "ethers/lib/utils.js";
import { ReactElement } from "react";
import { Address, useAccount, useBalance } from "wagmi";
import { CollateralData } from "../../../creation-form/types";
import { Loader } from "../../../ui/loader";
import { KpiTokenData } from "../../types";
import { CollateralRow } from "../collateral-row";

interface AccountProps {
    t: NamespacedTranslateFunction;
    kpiTokenData: Pick<KpiTokenData, "address" | "initialSupply" | "symbol">;
    collaterals: CollateralData[];
}

export const Account = ({
    t,
    kpiTokenData,
    collaterals,
}: AccountProps): ReactElement => {
    const { isConnected, address } = useAccount();
    const { data: kpiTokenBalance, isLoading } = useBalance({
        address,
        token: kpiTokenData.address as Address,
    });

    return (
        <div className="flex flex-col w-full max-w-6xl items-center justify-center bg-white dark:bg-black border border-black dark:border-gray-400">
            {isLoading ? (
                <Loader />
            ) : !isConnected ? (
                <div className="p-6">
                    <Typography variant="2xl" uppercase>
                        WALLET NOT CONNECTED
                    </Typography>
                </div>
            ) : (
                <>
                    <div className="w-full p-6 bg-gray-300 dark:bg-gray-700 border-b border-black dark:border-gray-400">
                        <Typography
                            weight="medium"
                            className={{
                                root: "text-ellipsis overflow-hidden ...",
                            }}
                        >
                            {address}
                        </Typography>
                    </div>
                    <div className="w-full p-6 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-col">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("account.supply.label")}
                            </Typography>
                            {kpiTokenData.initialSupply ? (
                                <Typography variant="md" weight="medium">
                                    {`${commify(
                                        formatUnits(
                                            kpiTokenData.initialSupply,
                                            18
                                        )
                                    )}
                                    ${kpiTokenData.symbol}`}
                                </Typography>
                            ) : (
                                <Skeleton />
                            )}
                        </div>
                        <div className="flex-col">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("account.balance.label")}
                            </Typography>
                            {kpiTokenBalance ? (
                                <Typography variant="md" weight="medium">
                                    {`${commify(
                                        formatUnits(kpiTokenBalance.value, 18)
                                    )}
                                    ${kpiTokenData.symbol}`}
                                </Typography>
                            ) : (
                                <Skeleton />
                            )}
                        </div>
                        <div className="flex-col">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("account.totalRewards.label")}
                            </Typography>
                            <div className="flex flex-col gap-2">
                                {collaterals.map((collateral) => {
                                    return (
                                        <CollateralRow
                                            key={
                                                collateral.amount.currency
                                                    .address
                                            }
                                            collateral={collateral}
                                            display={"amount"}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex-col">
                            <Typography
                                variant="xs"
                                uppercase
                                className={{ root: "mb-2" }}
                            >
                                {t("account.remaninng.label")}
                            </Typography>
                            <div className="flex flex-col gap-2">
                                {collaterals.map((collateral) => {
                                    return (
                                        <CollateralRow
                                            key={
                                                collateral.amount.currency
                                                    .address
                                            }
                                            collateral={collateral}
                                            display={"amount"}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
