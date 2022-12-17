import { Title, TextMono } from '@carrot-kpi/ui'
import { ReactElement, ReactNode } from 'react'

interface CardProps {
  title: string
  step: string
  children: ReactNode
}

export const Card = ({ title, step, children }: CardProps): ReactElement => (
  <div className="flex max-w-xl flex-col gap-2 border border-black bg-white">
    <div className="flex flex-col gap-1 border-b border-black p-6">
      <TextMono size="sm" className="font-medium">
        {step}
      </TextMono>
      <Title size="5xl">{title}</Title>
    </div>
    <div className="p-6">{children}</div>
  </div>
)
