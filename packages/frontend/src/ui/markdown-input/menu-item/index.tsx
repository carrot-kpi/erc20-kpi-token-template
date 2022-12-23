import { ReactElement } from 'react'

interface MenuItemProps {
  icon: string
  title: string
  action: () => void
  isActive: () => boolean
}

export const MenuItem = ({
  icon,
  title,
  action,
  isActive,
}: MenuItemProps): ReactElement => {
  return (
    <button
      className={`${
        isActive()
          ? 'rounded-md border border-gray-400'
          : 'border border-transparent'
      }`}
      onClick={action}
      title={title}
    >
      <img src={icon} />
    </button>
  )
}
