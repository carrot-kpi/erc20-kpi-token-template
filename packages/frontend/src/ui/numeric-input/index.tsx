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
  // TODO: move to core UI package and use cva with variants
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  label?: string
  placeholder?: string
  className?: string
  isBordered?: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
}

export const NumericInput = ({
  id,
  size = 'md',
  value,
  label,
  placeholder,
  className,
  isBordered = true,
  onChange,
}: NumericInputProps): ReactElement => {
  const handleValueOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation()

      if (!isNaN(Number(event.target.value))) {
        onChange(event)
      }
    },
    [value, onChange]
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
        className={`${className} 'w-full ${
          isBordered ? 'rounded-2xl border border-black' : 'border-none'
        } p-3 font-mono text-${size} font-normal outline-none`}
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
