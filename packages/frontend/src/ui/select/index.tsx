import { ReactElement, useState } from 'react'
import RcSelect, { Option } from 'rc-select'

import ArrowDownIcon from '../assets/arrow-down.svg'

interface Options {
  value: string
  label: string
}

interface SelectProps {
  value: string
  options: Options[]
  onChange: (value: any) => void
}

export const Select = ({
  value,
  options,
  onChange,
}: SelectProps): ReactElement => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const onDropdownVisibleChange = (open: boolean): void => {
    setIsOpen(open)
  }

  return (
    <RcSelect
      className="w-full rounded-2xl bg-carrot-green font-mono text-2xl font-normal"
      dropdownClassName="rounded-2xl bg-carrot-green"
      value={value}
      showSearch={false}
      open={isOpen}
      onChange={onChange}
      onDropdownVisibleChange={onDropdownVisibleChange}
      inputIcon={<img src={ArrowDownIcon} />}
    >
      {options.map((option) => (
        <Option className="flex p-3" key={option.value}>
          {option.label}
        </Option>
      ))}
    </RcSelect>
  )
}
