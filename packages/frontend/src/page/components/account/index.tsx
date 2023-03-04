import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { KPIToken } from "@carrot-kpi/sdk";
import { Skeleton, Typography } from "@carrot-kpi/ui";
import { commify, formatUnits } from "ethers/lib/utils.js";
import { ReactElement } from "react";
import { Address, useAccount, useBalance } from "wagmi";
import { Loader } from "../../../ui/loader";

interface AccountProps {
    t: NamespacedTranslateFunction;
    loading?: boolean;
    kpiToken: KPIToken;
    erc20Symbol?: string;
}

export const Account = ({
    t,
    loading,
    kpiToken,
    erc20Symbol,
}: AccountProps): ReactElement => {
    const { isConnected, address } = useAccount();
    const { data: kpiTokenBalance, isLoading } = useBalance({
        address,
        token: kpiToken.address as Address,
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
                                {t("position.balance.label")}
                            </Typography>
                            {loading || !kpiTokenBalance || !erc20Symbol ? (
                                <Skeleton width="60px" />
                            ) : (
                                <Typography weight="medium">
                                    {`${commify(
                                        formatUnits(kpiTokenBalance.value, 18)
                                    )}
                                    ${erc20Symbol}`}
                                </Typography>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
