import { TextMono } from '@carrot-kpi/ui'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import ArrowDownIcon from '../assets/arrow-down.svg'

interface Options {
  value: string
  label: string
  icon?: string
}

interface SelectProps {
  value: string
  options: Options[]
  onChange: (option: string) => void
}

export const Select = ({
  value,
  options,
  onChange,
}: SelectProps): ReactElement => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const dropdownRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        containerRef.current &&
        !(containerRef.current as any).contains(event.target)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [containerRef])

  const handleOnClick = () => {
    setIsDropdownOpen((isDropdownOpen) => !isDropdownOpen)
  }

  const handleOptionClick = (option: string) => {
    setIsDropdownOpen(false)
    onChange(option)
  }

  const active = useMemo(
    () => options.find((option) => option.value === value),
    [value]
  )

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl bg-carrot-green p-3 font-mono text-xl font-normal outline-none"
    >
      <div className="flex justify-between">
        <div onClick={handleOnClick}>
          {active ? (
            <div>
              {active.icon ? <img src="" /> : null}
              <TextMono size="2xl">{active?.label}</TextMono>
            </div>
          ) : null}
        </div>
        <img src={ArrowDownIcon} />
      </div>
      {isDropdownOpen ? (
        <div
          ref={dropdownRef}
          className="absolute left-0 mt-4 w-full rounded-2xl bg-carrot-green"
        >
          {options
            .filter((option) => option.value !== value)
            .map((option) => (
              <div
                key={option.value}
                className="p-3"
                onClick={() => handleOptionClick(option.value)}
              >
                {option.icon ? <img src="" /> : null}
                <TextMono size="2xl">{option.label}</TextMono>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  )
}
