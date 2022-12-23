import { TextMono } from '@carrot-kpi/ui'
import {
  ChangeEvent,
  ChangeEventHandler,
  ReactElement,
  useCallback,
} from 'react'

interface NumericInputProps {
  id: string
  value: number | string
  onChange: ChangeEventHandler<HTMLInputElement>
  label?: string
  placeholder?: string
  className?: string
}

export const NumericInput = ({
  id,
  value,
  label,
  placeholder,
  className,
  onChange,
}: NumericInputProps): ReactElement => {
  const handleValueOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation()

      if (!isNaN(Number(event.target.value))) {
        onChange(event)
      }
    },
    [value]
  )

  return (
    <div className={`${className} flex flex-col gap-2`}>
      {label ? (
        <label className="block" htmlFor={id}>
          <TextMono size="sm" className="font-medium">
            {label}
          </TextMono>
        </label>
      ) : null}

      <input
        className={`${className} w-full border-0 p-2 font-mono text-2xl font-normal outline-none`}
        value={value}
        onChange={handleValueOnChange}
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        type="text"
        pattern="^[0-9]*[.,]?[0-9]*$"
        placeholder={placeholder || '0.0'}
        minLength={1}
        maxLength={79}
        spellCheck="false"
      />
    </div>
  )
}
