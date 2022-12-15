import { TextMono } from '@carrot-kpi/ui'
import { ReactElement } from 'react'

interface Props {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

export const TextInput = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}: Props): ReactElement => (
  <div className="flex flex-col gap-2">
    <label className="block" htmlFor={id}>
      <TextMono size="sm" className="font-medium">
        {label}
      </TextMono>
    </label>
    <input
      className="rounded-2xl border border-black p-3 text-sm font-normal outline-none"
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  </div>
)
