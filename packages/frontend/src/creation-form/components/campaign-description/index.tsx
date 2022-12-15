import { ChangeEvent, ReactElement, useCallback, useState } from 'react'
import { SpecificationData } from '../../types'
import { NamespacedTranslateFunction } from '@carrot-kpi/react'
import { TextInput } from '../../../ui/text-input'

interface BaseDataProps {
  t: NamespacedTranslateFunction
  onNext: (specificationData: SpecificationData) => void
}

export const CampaignDescription = ({
  t,
  onNext,
}: BaseDataProps): ReactElement => {
  const [specificationData, setSpecificationData] = useState<SpecificationData>(
    {
      title: '',
      description: '',
      tags: [],
    }
  )

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

  const handleNext = useCallback(() => {
    onNext(specificationData)
  }, [onNext, specificationData])

  return (
    <div className="flex flex-col gap-5">
      <TextInput
        id="title"
        label={t('label.title')}
        placeholder={'Enter campaign title'}
        onChange={handleSpecificationDataChange('title')}
        value={specificationData.title}
      />
      <TextInput
        id="description"
        label={t('label.description')}
        placeholder={'Enter campaign description'}
        onChange={handleSpecificationDataChange('description')}
        value={specificationData.description}
      />
      <button onClick={handleNext}>{t('next')}</button>
    </div>
  )
}
