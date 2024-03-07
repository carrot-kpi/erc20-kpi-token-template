import type { SupportedChain } from "@carrot-kpi/sdk";
import type { Config } from "wagmi";

declare module "wagmi" {
    interface Register {
        config: Config<readonly [SupportedChain, ...SupportedChain[]]>;
    }
}
