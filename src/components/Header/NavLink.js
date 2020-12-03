import PropType from 'prop-types'
import Icon from 'components/Icon'
import cs from 'classnames'
import { NavLink } from 'react-router-dom'

//TODO Add Link and NavLink varrients

export function UserNavA({
  to,
  label,
  imageUrl,
  iconName,
  className,
  ...props
}) {
  return (
    <a
      href={to}
      className={cs('flex items-center px-4 py-2 text-sm', className)}
      {...props}
    >
      {imageUrl && (
        <img className="h-4 w-4 rounded-full" src={imageUrl} alt={label} />
      )}
      {iconName && (
        <Icon name={iconName} className="h-4 w-4" color="text-white" />
      )}
      <span className="pl-3">{label}</span>
    </a>
  )
}

UserNavA.propTypes = {
  to: PropType.string.isRequired,
  label: PropType.string.isRequired,
  imageUrl: PropType.string,
  iconName: PropType.string,
}

export function MainNavLink({
  label,
  className,
  imageUrl,
  iconName,
  ...props
}) {
  return (
    <NavLink className={cs('flex items-center', className)} {...props}>
      {imageUrl && (
        <img className="h-6 w-6 rounded-full" src={imageUrl} alt={label} />
      )}
      {iconName && (
        <Icon name={iconName} className="h-6 w-6" color="text-white" />
      )}
      <span className="pl-3">{label}</span>
    </NavLink>
  )
}

MainNavLink.propTypes = {
  to: PropType.string.isRequired,
  label: PropType.string.isRequired,
  imageUrl: PropType.string,
  iconName: PropType.string,
}
