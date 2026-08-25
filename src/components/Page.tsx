import { useState } from 'react'
import type { ReactNode } from 'react'
import { Header, type HeaderUser } from './Header'
import './Page.css'

export type PageProps = {
  title?: string
  children?: ReactNode
}

export function Page({ title = 'deck', children }: PageProps) {
  const [user, setUser] = useState<HeaderUser | undefined>(undefined)

  return (
    <div className="page">
      <Header
        title={title}
        user={user}
        onLogin={() => setUser({ name: 'Jane Doe' })}
        onSignUp={() => setUser({ name: 'Jane Doe' })}
        onLogout={() => setUser(undefined)}
      />
      <main className="page__content">{children}</main>
    </div>
  )
}
