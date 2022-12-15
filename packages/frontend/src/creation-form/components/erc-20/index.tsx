import { BigNumber } from 'ethers'
import { ChangeEvent, ReactElement, useCallback, useState } from 'react'
import { ERC20Data } from '../../types'
import { NamespacedTranslateFunction } from '@carrot-kpi/react'
import { TextInput } from '../../../ui/text-input'

interface BaseDataProps {
  t: NamespacedTranslateFunction
  onNext: (erc20Data: ERC20Data) => void
}

export const Erc20 = ({ t, onNext }: BaseDataProps): ReactElement => {
  const [erc20Data, setErc20Data] = useState<ERC20Data>({
    name: '',
    symbol: '',
    supply: BigNumber.from('0'),
  })

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
    onNext(erc20Data)
  }, [erc20Data, onNext])

  return (
    <div>
      <TextInput
        id="erc20-name"
        label={t('label.erc20.name')}
        placeholder={'Ethereum'}
        onChange={handleErc20DataChange('name')}
        value={erc20Data.name}
      />
      <TextInput
        id="erc20-symbol"
        label={t('label.erc20.symbol')}
        placeholder={'ETH'}
        onChange={handleErc20DataChange('symbol')}
        value={erc20Data.symbol}
      />
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
  )
}
