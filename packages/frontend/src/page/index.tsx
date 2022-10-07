import { KpiToken } from '@carrot-kpi/sdk'
import { ReactElement } from 'react'
import { TFunction } from 'react-i18next'

interface PageProps {
  t: TFunction
  kpiToken: KpiToken
}

export const Component = ({ t, kpiToken }: PageProps): ReactElement => {
  return (
    <>
      {t('main')}
      <br />
      Address: {kpiToken.address}
    </>
  )
}
