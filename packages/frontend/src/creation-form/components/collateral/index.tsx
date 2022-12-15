import { BigNumber, constants } from 'ethers'
import { ChangeEvent, ReactElement, useCallback, useState } from 'react'
import { CollateralData } from '../../types'
import { NamespacedTranslateFunction } from '@carrot-kpi/react'

interface BaseDataProps {
  t: NamespacedTranslateFunction
  onNext: (collateralsData: CollateralData[]) => void
}

export const Collateral = ({ t, onNext }: BaseDataProps): ReactElement => {
  const [collateralsData, setCollateralsData] = useState<CollateralData[]>([
    {
      address: constants.AddressZero,
      amount: BigNumber.from(0),
      minimumPayout: BigNumber.from(0),
    },
  ])

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

  const handleNext = useCallback(() => {
    onNext(collateralsData)
  }, [collateralsData, onNext])

  return (
    <div>
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
      <label htmlFor="collateral-amount">{t('label.collateral.amount')}</label>
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
      <button onClick={handleNext}>{t('next')}</button>
    </div>
  )
}
