import PropType from 'prop-types'

import ServerStatus from './ServerStatus'
import { UserNavA, MainNavLink } from './NavLink'

// TODO
const username = 'TerrySmithDC'
const avatarUrl =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

const MobileMenu = ({ mainNav = [], userNav = [] }) => (
  <nav className="md:hidden bg-gray-900 z-40 mt-12 text-white">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      {mainNav.map((props, i) => (
        <MainNavLink
          key={`mobile-mainnav-${i}`}
          className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
          {...props}
        />
      ))}
    </div>
    <div className="flex items-center px-5 py-4 border-t border-gray-800">
      <div className="flex-shrink-0">
        <img
          className="h-10 w-10 rounded-full"
          src={avatarUrl}
          width="40px"
          height="auto"
          alt="User Avatar"
        />
      </div>
      <div className="flex-1 ml-3">{username}</div>
      <ServerStatus />
    </div>
    <div className="py-3 px-2 sm:px-3 space-y-1">
      {userNav.map((props, i) => (
        <UserNavA
          key={`mobile-usernav-${i}`}
          className="px-3 py-2 text-gray-300 hover:text-white"
          {...props}
        />
      ))}
    </div>
  </nav>
)

MobileMenu.propTypes = {
  mainNav: PropType.arrayOf(
    PropType.shape({
      label: PropType.string.isRequired,
      to: PropType.string.isRequired,
      active: PropType.bool,
    })
  ).isRequired,
  userNav: PropType.arrayOf(
    PropType.shape({
      label: PropType.string.isRequired,
      to: PropType.string.isRequired,
      active: PropType.bool,
    })
  ).isRequired,
}

export default MobileMenu
