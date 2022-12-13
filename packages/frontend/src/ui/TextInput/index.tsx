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
  <div className="flex-col">
    <label htmlFor={id}>{label}</label>
    <input
      className="border-2 border-black"
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  </div>
)
