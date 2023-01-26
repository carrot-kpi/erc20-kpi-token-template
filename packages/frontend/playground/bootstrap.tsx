import { Fetcher, KpiToken } from "@carrot-kpi/sdk";
import { useLocalStorage } from "react-use";
import {
    Campaign,
    CarrotCoreProvider,
    CreationForm,
    useKpiTokenTemplates,
} from "@carrot-kpi/react";
import { Button, CarrotUIProvider } from "@carrot-kpi/ui";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Wallet, providers, Signer, BigNumber, utils, constants } from "ethers";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
    Address,
    Connector,
    ConnectorData,
    useAccount,
    useConnect,
    usePrepareSendTransaction,
    useProvider,
    useSendTransaction,
} from "wagmi";
import { Chain } from "wagmi/chains";
import * as chains from "wagmi/chains";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { Loader } from "../src/ui/loader";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@carrot-kpi/ui/styles.css";

import "./global.css";

type View = "creation" | "view";

class CarrotConnector extends Connector<
    providers.JsonRpcProvider,
    unknown,
    Signer
> {
    readonly id = "carrot";
    readonly name = "Carrot";
    readonly ready = true;

    private readonly provider: providers.JsonRpcProvider;
    private readonly signer: Signer;

    constructor(config: { chains: Chain[]; options: object }) {
        super(config);
        this.provider = new providers.JsonRpcProvider(CCT_RPC_URL);
        this.signer = new Wallet(CCT_DEPLOYMENT_ACCOUNT_PRIVATE_KEY).connect(
            this.provider
        );
    }

    async connect({} = {}): Promise<Required<ConnectorData>> {
        this.emit("message", { type: "connecting" });

        const data = {
            account: (await this.signer.getAddress()) as Address,
            chain: { id: CCT_CHAIN_ID, unsupported: false },
            provider: this.provider,
        };

        return data;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async disconnect(): Promise<void> {}

    async getAccount(): Promise<Address> {
        return (await this.signer.getAddress()) as Address;
    }

    async getChainId(): Promise<number> {
        return CCT_CHAIN_ID;
    }

    async getProvider({} = {}): Promise<providers.JsonRpcProvider> {
        return this.provider;
    }

    async getSigner(): Promise<Signer> {
        return this.signer;
    }

    async isAuthorized(): Promise<boolean> {
        return true;
    }

    async watchAsset({} = {}): Promise<boolean> {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onAccountsChanged = (): void => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onChainChanged = (): void => {};

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onDisconnect = (): void => {};

    toJSON(): string {
        return "<CarrotConnector>";
    }
}

i18next.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

const forkedChain = Object.values(chains).find(
    (chain) => chain.id === CCT_CHAIN_ID
);
if (!forkedChain) {
    console.log(`unsupported chain id ${CCT_CHAIN_ID}`);
    process.exit(0);
}
const supportedChains = [forkedChain];

const App = (): ReactElement => {
    const cctTemplateIds = useMemo(() => [CCT_TEMPLATE_ID], []);

    const provider = useProvider();
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect({
        chainId: CCT_CHAIN_ID,
    });
    const { loading: isLoadingTemplates, templates } =
        useKpiTokenTemplates(cctTemplateIds);

    const [creationTx, setCreationTx] = useState<
        providers.TransactionRequest & {
            to: string;
        }
    >({
        to: "",
        data: "",
        value: BigNumber.from("0"),
    });
    const [kpiToken, setKpiToken] = useLocalStorage<KpiToken | null>(
        "latest-kpi-token",
        null
    );
    const [activeView, setActiveView] = useState<View>("creation");

    const { config } = usePrepareSendTransaction({
        request: creationTx,
    });
    const { sendTransactionAsync } = useSendTransaction(config);

    useEffect(() => {
        if (!isConnected) connect({ connector: connectors[0] });
    }, [connect, connectors, isConnected]);

    useEffect(() => {
        let cancelled = false;
        if (sendTransactionAsync) {
            const fetch = async (): Promise<void> => {
                const tx = await sendTransactionAsync();
                const receipt = await tx.wait();
                const createTokenEventHash = utils.keccak256(
                    utils.toUtf8Bytes("CreateToken(address)")
                );
                let createdKpiTokenAddress = constants.AddressZero;
                for (const log of receipt.logs) {
                    const [hash] = log.topics;
                    if (hash !== createTokenEventHash) continue;
                    createdKpiTokenAddress = utils.defaultAbiCoder.decode(
                        ["address"],
                        log.data
                    )[0];
                    break;
                }
                const kpiTokens = await Fetcher.fetchKpiTokens(provider, [
                    createdKpiTokenAddress,
                ]);
                if (!cancelled) setKpiToken(kpiTokens[createdKpiTokenAddress]);
            };
            void fetch();
        }
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, sendTransactionAsync]);

    const handleDone = useCallback(
        (to: Address, data: string, value: BigNumber) => {
            setCreationTx({ to, data, value, gasLimit: 10_000_000 });
        },
        []
    );

    const handleViewChange = useCallback((view: View) => {
        setActiveView(view);
    }, []);

    return (
        <div className="scrollbar h-screen w-screen overflow-x-hidden">
            <div className="absolute rounded-xl top-0 left-0 p-1 z-10 flex gap-1 bg-gray-100 bg-opacity-50">
                <Button
                    size="xsmall"
                    onClick={() => handleViewChange("creation")}
                >
                    Creation
                </Button>
                <Button size="xsmall" onClick={() => handleViewChange("view")}>
                    View
                </Button>
            </div>
            {activeView === "creation" && !isLoadingTemplates && (
                <CreationForm
                    i18n={i18next}
                    fallback={<Loader />}
                    template={templates[0]}
                    customBaseUrl="http://localhost:9002/"
                    onDone={handleDone}
                />
            )}
            {activeView === "view" && !!kpiToken && (
                <Campaign
                    i18n={i18next}
                    fallback={<Loader />}
                    address={kpiToken.address}
                    customBaseUrl="http://localhost:9002/"
                />
            )}
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
    <CarrotCoreProvider
        supportedChains={supportedChains}
        providers={[
            jsonRpcProvider({
                rpc: () => ({
                    http: CCT_RPC_URL,
                }),
            }),
        ]}
        getConnectors={(chains: Chain[]) => [
            new CarrotConnector({ chains, options: {} }) as Connector,
        ]}
        ipfsGateway={CCT_IPFS_GATEWAY_URL}
    >
        <CarrotUIProvider>
            <App />
        </CarrotUIProvider>
    </CarrotCoreProvider>
);
