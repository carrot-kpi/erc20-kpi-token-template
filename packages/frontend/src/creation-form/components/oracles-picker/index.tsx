import {
  NamespacedTranslateFunction,
  useOracleTemplates,
} from '@carrot-kpi/react'
import { Template } from '@carrot-kpi/sdk'
import { Button } from '@carrot-kpi/ui'
import { ReactElement } from 'react'

interface OraclesPickerProps {
  t: NamespacedTranslateFunction
  onPick: (pickedTemplate: Template) => void
}

export const OraclesPicker = ({
  t,
  onPick,
}: OraclesPickerProps): ReactElement => {
  const { loading, templates } = useOracleTemplates()

  if (loading) return <>{t('loading')}...</>
  return (
    <>
      {templates.map((template) => {
        return (
          <div key={template.id}>
            <ul>
              <li>
                {t('oracles.picker.template.title')}:{' '}
                {template.specification.name}
              </li>
              <li>
                {t('oracles.picker.template.version')}:{' '}
                {template.version.toString()}
              </li>
              <li>
                {t('oracles.picker.template.id')}: {template.id.toString()}
              </li>
              <li>
                {t('oracles.picker.template.description')}:{' '}
                {template.specification.description}
              </li>
              <li>
                {t('oracles.picker.template.address')}: {template.address}
              </li>
            </ul>
            <Button
              onClick={() => {
                onPick(template)
              }}
            >
              {t('oracles.picker.template.use')}
            </Button>
          </div>
        )
      })}
    </>
  )
}
