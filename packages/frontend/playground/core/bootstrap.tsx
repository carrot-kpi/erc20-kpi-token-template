import { ReactElement, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  addBundleForTemplate,
  CarrotCoreProvider,
  NamespacedTranslateFunction,
  TemplateComponent,
  useOracleTemplates,
} from '@carrot-kpi/react'
import { Wallet, providers, Signer } from 'ethers'
import i18n from 'i18next'
import { bundle as creationFormBundle } from '../../src/creation-form/i18n'
import { bundle as pageBundle } from '../../src/page/i18n'
import { useTranslation } from 'react-i18next'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import {
  Address,
  chain,
  Chain,
  Connector,
  ConnectorData,
  useConnect,
} from 'wagmi'

class CarrotConnector extends Connector<
  providers.JsonRpcProvider,
  any,
  Signer
> {
  readonly id = 'carrot'
  readonly name = 'Carrot'
  readonly ready = true

  private readonly provider: providers.JsonRpcProvider
  private readonly signer: Signer

  constructor(config: { chains: Chain[]; options: {} }) {
    super(config)
    this.provider = new providers.JsonRpcProvider(CCT_RPC_URL)
    this.signer = new Wallet(CCT_DEPLOYMENT_ACCOUNT_PRIVATE_KEY).connect(
      this.provider
    )
  }

  async connect({ chainId }: { chainId?: number } = {}): Promise<
    Required<ConnectorData>
  > {
    this.emit('message', { type: 'connecting' })

    const data = {
      account: (await this.signer.getAddress()) as Address,
      chain: { id: CCT_CHAIN_ID, unsupported: false },
      provider: this.provider,
    }

    return data
  }

  async disconnect(): Promise<void> {}

  async getAccount(): Promise<Address> {
    return (await this.signer.getAddress()) as Address
  }

  async getChainId(): Promise<number> {
    return CCT_CHAIN_ID
  }

  async getProvider({
    chainId,
  }: { chainId?: number } = {}): Promise<providers.JsonRpcProvider> {
    return this.provider
  }

  async getSigner(): Promise<Signer> {
    return this.signer
  }

  async isAuthorized(): Promise<boolean> {
    return true
  }

  async watchAsset(asset: {
    address: string
    decimals?: number
    image?: string
    symbol: string
  }): Promise<boolean> {
    return false
  }

  protected onAccountsChanged = (): void => {}

  protected onChainChanged = (): void => {}

  protected onDisconnect = (): void => {}

  toJSON(): string {
    return '<CarrotConnector>'
  }
}

const forkedChain = Object.values(chain).find(
  (chain) => chain.id === CCT_CHAIN_ID
)
if (!forkedChain) {
  console.log(`unsupported chain id ${CCT_CHAIN_ID}`)
  process.exit(0)
}
const supportedChains = [forkedChain]

const App = (): ReactElement => {
  const { connect, connectors } = useConnect({ chainId: CCT_CHAIN_ID })
  const { loading: isLoadingTemplates, templates } = useOracleTemplates()
  const { t } = useTranslation()

  console.log(isLoadingTemplates, templates)

  const [creationFormT, setCreationFormT] =
    useState<NamespacedTranslateFunction | null>(null)
  const [pageT, setPageT] = useState<NamespacedTranslateFunction | null>(null)

  useEffect(() => {
    connect({ connector: connectors[0] })
    addBundleForTemplate(i18n, 'creationForm', creationFormBundle)
    addBundleForTemplate(i18n, 'page', pageBundle)
    setCreationFormT(() => (key: any, options?: any) => {
      return t(key, { ...options, ns: 'creationForm' })
    })
    setPageT(() => (key: any, options?: any) => {
      return t(key, { ...options, ns: 'page' })
    })
  }, [t, connect, connectors])

  if (!creationFormT || !pageT) return <>Loading...</>
  return (
    <>
      <h1>Core Application</h1>
      <h2>Creation form</h2>
      <TemplateComponent
        type="creationForm"
        template={isLoadingTemplates ? undefined : templates[0]}
      />
      {/* TODO: add page component */}
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <CarrotCoreProvider
    i18nInstance={i18n}
    i18nResources={{}}
    i18nDefaultNamespace={''}
    supportedChains={supportedChains}
    providers={[
      jsonRpcProvider({
        rpc: () => ({
          http: CCT_RPC_URL,
        }),
      }),
    ]}
    getConnectors={(chains: Chain[]) => [
      new CarrotConnector({ chains, options: {} }),
    ]}
    ipfsGateway={CCT_IPFS_GATEWAY_URL}
  >
    <App />
  </CarrotCoreProvider>
)
