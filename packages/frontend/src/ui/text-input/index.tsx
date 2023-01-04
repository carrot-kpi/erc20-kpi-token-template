import { TextMono } from '@carrot-kpi/ui'
import { ChangeEventHandler, ReactElement } from 'react'

interface TextInputProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export const TextInput = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}: TextInputProps): ReactElement => (
  <div className="flex flex-col gap-2">
    <label className="block" htmlFor={id}>
      <TextMono size="sm" className="font-medium">
        {label}
      </TextMono>
    </label>
    <input
      className="rounded-2xl border border-black p-3 font-mono text-sm font-normal outline-none"
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  </div>
)
