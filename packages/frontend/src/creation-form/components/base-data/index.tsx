import { BigNumber, constants } from 'ethers'
import { ChangeEvent, ReactElement, useCallback, useState } from 'react'
import { CollateralData, ERC20Data, SpecificationData } from '../../types'
import { NamespacedTranslateFunction } from '@carrot-kpi/react'
import { TextInput } from '../../../ui/TextInput'

interface BaseDataProps {
  t: NamespacedTranslateFunction
  onNext: (
    specificationData: SpecificationData,
    collateralsData: CollateralData[],
    erc20Data: ERC20Data
  ) => void
}

export const BaseData = ({ t, onNext }: BaseDataProps): ReactElement => {
  const [specificationData, setSpecificationData] = useState<SpecificationData>(
    {
      title: '',
      description: '',
      tags: [],
    }
  )
  const [collateralsData, setCollateralsData] = useState<CollateralData[]>([
    {
      address: constants.AddressZero,
      amount: BigNumber.from(0),
      minimumPayout: BigNumber.from(0),
    },
  ])
  const [erc20Data, setErc20Data] = useState<ERC20Data>({
    name: '',
    symbol: '',
    supply: BigNumber.from('0'),
  })

  const handleSpecificationDataChange = useCallback(
    (field: keyof SpecificationData) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setSpecificationData({
          ...specificationData,
          [field]: event.target.value,
        })
      },
    [specificationData]
  )

  const handleCollateralsDataChange = useCallback(
    (field: keyof CollateralData) => (event: ChangeEvent<HTMLInputElement>) => {
      setCollateralsData([
        {
          ...collateralsData[0],
          [field]: event.target.value,
        },
      ])
    },
    [collateralsData]
  )

  const handleErc20DataChange = useCallback(
    (field: keyof ERC20Data) => (event: ChangeEvent<HTMLInputElement>) => {
      setErc20Data({
        ...erc20Data,
        [field]: event.target.value,
      })
    },
    [erc20Data]
  )

  const handleNext = useCallback(() => {
    onNext(specificationData, collateralsData, erc20Data)
  }, [collateralsData, erc20Data, onNext, specificationData])

  return (
    <>
      <div>
        <TextInput
          id="title"
          label={t('label.title')}
          placeholder={'Campaign title'}
          onChange={handleSpecificationDataChange('title')}
          value={specificationData.title}
        />
        <br />
        <label htmlFor="description">{t('label.description')}</label>
        <br />
        <input
          id="description"
          placeholder="Description"
          onChange={handleSpecificationDataChange('description')}
          value={specificationData.description}
        />
        <br />
        <label htmlFor="collateral-address">
          {t('label.collateral.address')}
        </label>
        <br />
        <input
          id="collateral-address"
          placeholder="0x0000000000000000000000000000000000000000"
          onChange={handleCollateralsDataChange('address')}
          value={collateralsData[0].address}
        />
        <br />
        <label htmlFor="collateral-amount">
          {t('label.collateral.amount')}
        </label>
        <br />
        <input
          id="collateral-amount"
          placeholder="10000.123"
          onChange={handleCollateralsDataChange('amount')}
          value={collateralsData[0].amount.toString()}
        />
        <br />
        <label htmlFor="collateral-minimum-payout">
          {t('label.collateral.minimum.payout')}
        </label>
        <br />
        <input
          id="collateral-minimum-payout"
          placeholder="10000.122"
          onChange={handleCollateralsDataChange('minimumPayout')}
          value={collateralsData[0].minimumPayout.toString()}
        />
        <br />
        <label htmlFor="erc20-name">{t('label.erc20.name')}</label>
        <br />
        <input
          id="erc20-name"
          placeholder="Test"
          onChange={handleErc20DataChange('name')}
          value={erc20Data.name}
        />
        <br />
        <label htmlFor="erc20-symbol">{t('label.erc20.symbol')}</label>
        <br />
        <input
          id="erc20-symbol"
          placeholder="TST"
          onChange={handleErc20DataChange('symbol')}
          value={erc20Data.symbol}
        />
        <br />
        <label htmlFor="erc20-supply">{t('label.erc20.supply')}</label>
        <br />
        <input
          id="erc20-supply"
          placeholder="1000.23"
          onChange={handleErc20DataChange('supply')}
          value={erc20Data.supply.toString()}
        />
        <br />
        <button onClick={handleNext}>{t('next')}</button>
      </div>
    </>
  )
}
