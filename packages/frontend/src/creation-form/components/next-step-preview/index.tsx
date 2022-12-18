import { TextMono, Title } from '@carrot-kpi/ui'
import { ReactElement } from 'react'

interface NextStepPreviewProps {
  step: string
  title: string
}

export const NextStepPreview = ({
  step,
  title,
}: NextStepPreviewProps): ReactElement => (
  <div className="flex w-full max-w-xl flex-col gap-1 border border-l-black border-t-black border-r-black border-b-white bg-white p-4">
    <TextMono size="sm" className="font-medium">
      {step}
    </TextMono>
    <Title size="5xl">{title}</Title>
  </div>
)
