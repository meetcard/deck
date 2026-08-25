import { Avatar } from './Avatar'
import { Button } from './Button'
import './Header.css'

export type HeaderUser = {
  name: string
  avatarSrc?: string
}

export type HeaderProps = {
  title: string
  user?: HeaderUser
  onLogin?: () => void
  onLogout?: () => void
  onSignUp?: () => void
  className?: string
}

export function Header({
  title,
  user,
  onLogin,
  onLogout,
  onSignUp,
  className,
}: HeaderProps) {
  const classes = ['header', className].filter(Boolean).join(' ')

  return (
    <header className={classes}>
      <span className="header__title">{title}</span>
      <div className="header__actions">
        {user ? (
          <>
            <Avatar name={user.name} src={user.avatarSrc} size="sm" />
            <span className="header__user-name">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={onLogin}>
              Log in
            </Button>
            <Button variant="primary" size="sm" onClick={onSignUp}>
              Sign up
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
