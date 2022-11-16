import {
  CreationForm,
  NamespacedTranslateFunction,
  useDecentralizedStorageUploader,
} from '@carrot-kpi/react'
import { ChainId, Template } from '@carrot-kpi/sdk'
import { BigNumber, constants, utils } from 'ethers'
import { defaultAbiCoder } from 'ethers/lib/utils'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { BaseData } from './components/base-data'
import { OracleConfiguration } from './components/oracle-configuration'
import { OraclesPicker } from './components/oracles-picker'
import { OnchainPreparations } from './components/onchain-preparations'
import {
  CollateralData,
  CreationData,
  ERC20Data,
  SpecificationData,
} from './types'
import CREATION_PROXY_ABI from '../abis/creation-proxy.json'
import { Address, useNetwork } from 'wagmi'

const CREATION_PROXY_INTERFACE = new utils.Interface(CREATION_PROXY_ABI)

const CREATION_PROXY_ADDRESS: Record<ChainId, Address> = {
  [ChainId.GOERLI]: constants.AddressZero,
  [ChainId.SEPOLIA]: '0x4300d4C410f87c7c1824Cbc2eF67431030106604',
}

interface CreationFormProps {
  t: NamespacedTranslateFunction
  onDone: (to: Address, data: string, value: BigNumber) => void
}

// TODO: add a check that displays an error message if the creation
// proxy address is 0 for more than x time
export const Component = ({ t, onDone }: CreationFormProps): ReactElement => {
  const { chain } = useNetwork()
  const uploadToDecentralizeStorage = useDecentralizedStorageUploader(
    __DEV__ ? 'playground' : 'ipfs'
  )
  const creationProxyAddress = useMemo(() => {
    if (__DEV__) return CCT_CREATION_PROXY_ADDRESS
    return chain && chain.id in ChainId
      ? CREATION_PROXY_ADDRESS[chain.id as ChainId]
      : constants.AddressZero
  }, [chain])

  const [data, setData] = useState<CreationData>({
    specification: {
      title: '',
      description: '',
      tags: [],
    },
    erc20: {
      name: '',
      symbol: '',
      supply: BigNumber.from('0'),
    },
    collaterals: [],
    oracles: [],
  })
  const [specificationCid, setSpecificationCid] = useState('')

  const handleBaseDataNext = useCallback(
    (
      specificationData: SpecificationData,
      collateralsData: CollateralData[],
      erc20Data: ERC20Data
    ) => {
      setData({
        ...data,
        specification: specificationData,
        collaterals: collateralsData,
        erc20: erc20Data,
      })
    },
    [data]
  )

  const handleOraclePick = useCallback(
    (oracleTemplate: Template) => {
      if (data.oracles.length === 0)
        setData({
          ...data,
          oracles: [
            {
              template: oracleTemplate,
              initializationData: '',
              value: BigNumber.from('0'),
              lowerBound: BigNumber.from('0'),
              higherBound: BigNumber.from('0'),
              weight: BigNumber.from('0'),
            },
          ],
        })
      else
        setData({
          ...data,
          oracles: [{ ...data.oracles[0], template: oracleTemplate }],
        })
    },
    [data]
  )

  const handleOracleDataNext = useCallback(
    (initializationData: string, value: BigNumber) => {
      setData({
        ...data,
        oracles: [
          {
            ...data.oracles[0],
            initializationData,
            value,
          },
        ],
      })
    },
    [data]
  )

  const handleOracleConfigurationSubmit = useCallback(
    (lowerBound: BigNumber, higherBound: BigNumber) => {
      setData({
        ...data,
        oracles: [
          {
            ...data.oracles[0],
            lowerBound,
            higherBound,
            weight: BigNumber.from('1'),
          },
        ],
      })

      uploadToDecentralizeStorage(data.specification)
        .then(setSpecificationCid)
        .catch(console.error)
    },
    [data, uploadToDecentralizeStorage]
  )

  const handleCreate = useCallback(() => {
    onDone(
      creationProxyAddress,
      CREATION_PROXY_INTERFACE.encodeFunctionData('createERC20KPIToken', [
        specificationCid,
        BigNumber.from(Math.floor(Date.now() + 86_400_000)),
        data.collaterals.map((rawCollateral) => ({
          token: rawCollateral.address,
          amount: BigNumber.from(rawCollateral.amount),
          minimumPayout: BigNumber.from(rawCollateral.minimumPayout),
        })),
        data.erc20.name,
        data.erc20.symbol,
        data.erc20.supply,
        defaultAbiCoder.encode(
          [
            'tuple(uint256 templateId,uint256 lowerBound,uint256 higherBound,uint256 weight,uint256 value,bytes data)[]',
            'bool',
          ],
          [
            data.oracles.map((oracle) => {
              return {
                templateId: oracle.template.id,
                lowerBound: oracle.lowerBound,
                higherBound: oracle.higherBound,
                weight: oracle.weight,
                value: oracle.value,
                data: oracle.initializationData,
              }
            }),
            false,
          ]
        ) as `0x${string}`,
      ]),
      BigNumber.from('0')
    )
  }, [
    creationProxyAddress,
    data.collaterals,
    data.erc20.name,
    data.erc20.supply,
    data.erc20.symbol,
    data.oracles,
    onDone,
    specificationCid,
  ])

  if (data.collaterals.length === 0)
    return <BaseData t={t} onNext={handleBaseDataNext} />
  if (data.collaterals.length > 0 && data.oracles.length === 0)
    return <OraclesPicker t={t} onPick={handleOraclePick} />
  if (data.oracles.length > 0 && !specificationCid) {
    if (!data.oracles[0].initializationData)
      return (
        <>
          <h3>Base oracle data</h3>
          <CreationForm
            template={data.oracles[0].template}
            onDone={handleOracleDataNext}
          />
        </>
      )
    else
      return (
        <OracleConfiguration t={t} onSubmit={handleOracleConfigurationSubmit} />
      )
  }
  return (
    <OnchainPreparations
      collaterals={data.collaterals}
      creationProxyAddress={creationProxyAddress}
      onCreate={handleCreate}
    />
  )
}
