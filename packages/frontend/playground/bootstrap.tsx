import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/700.css";
import "@carrot-kpi/switzer-font/400.css";
import "@carrot-kpi/switzer-font/500.css";
import "@carrot-kpi/switzer-font/700.css";
import "@carrot-kpi/ui/styles.css";
import "@carrot-kpi/host-frontend/styles.css";

import { Root } from "@carrot-kpi/host-frontend";
import { createRoot } from "react-dom/client";
import { SUPPORTED_CHAIN } from "@carrot-kpi/sdk";
import { ReactComponent as Plus } from "../src/assets/plus.svg";

const forkedChain = Object.values(SUPPORTED_CHAIN).find(
    (chain) => chain.id === CCT_CHAIN_ID,
);
if (!forkedChain) {
    console.log(`unsupported chain id ${CCT_CHAIN_ID}`);
    process.exit(0);
}

createRoot(document.getElementById("root")!).render(
    <Root
        supportedChain={{
            ...forkedChain,
            icon: { backgroundColor: "orange", logo: Plus },
        }}
        rpcURL={CCT_RPC_URL}
        privateKey={CCT_DEPLOYMENT_ACCOUNT_PRIVATE_KEY}
        ipfsGatewayURL={CCT_IPFS_GATEWAY_URL}
        kpiTokenTemplateBaseURL={CCT_TEMPLATE_URL}
        templateId={CCT_TEMPLATE_ID}
        enableTemplatePreviewMode={ENVIRONMENT !== "prod"}
    />,
);
