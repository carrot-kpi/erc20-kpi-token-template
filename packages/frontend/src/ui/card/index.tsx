import { Title, TextMono } from '@carrot-kpi/ui'

interface Props {
  title: string
  step: string
  children: React.ReactNode
}

export const Card = ({ title, step, children }: Props): React.ReactElement => (
  <div className="flex w-2/6 max-w-xl flex-col gap-2 border border-black bg-white">
    <div className="flex flex-col gap-1 border-b border-black p-6">
      <TextMono size="sm" className="font-medium">
        {step}
      </TextMono>
      <Title size="5xl">{title}</Title>
    </div>
    <div className="p-6">{children}</div>
  </div>
)
