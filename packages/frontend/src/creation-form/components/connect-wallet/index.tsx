import type { ReactElement } from "react";

import { ReactComponent as WalletDisconnected } from "../../../assets/wallet-disconnected.svg";
import { Typography } from "@carrot-kpi/ui";

export const ConnectWallet = (): ReactElement => {
    return (
        <div className="flex flex-col gap-6 items-center">
            <WalletDisconnected className="w-52" />
            <div className="flex flex-col gap-3 items-center">
                <Typography variant="h4">{"test"}</Typography>
                <Typography>{"test"}</Typography>
            </div>
        </div>
    );
};
