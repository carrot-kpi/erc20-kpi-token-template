import { ReactElement } from "react";
import { NamespacedTranslateFunction } from "@carrot-kpi/react";
import { ReactComponent as WalletDisconnected } from "../../../assets/wallet-disconnected.svg";
import { Typography } from "@carrot-kpi/ui";

interface GenericDataProps {
    t: NamespacedTranslateFunction;
}

export const ConnectWallet = ({ t }: GenericDataProps): ReactElement => {
    return (
        <div className="flex flex-col gap-6 items-center">
            <WalletDisconnected className="w-52" />
            <div className="flex flex-col gap-3 items-center">
                <Typography variant="h4">
                    {t("wallet.disconnected.title")}
                </Typography>
                <Typography>{t("wallet.disconnected.description")}</Typography>
            </div>
        </div>
    );
};
