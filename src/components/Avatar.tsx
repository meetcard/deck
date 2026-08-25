import { useState } from 'react'
import './Avatar.css'

export type AvatarSize = 'sm' | 'md' | 'lg'

export type AvatarProps = {
  src?: string
  name: string
  size?: AvatarSize
  className?: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const classes = ['avatar', `avatar--${size}`, className].filter(Boolean).join(' ')

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={name}
        className={classes}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <span className={classes} role="img" aria-label={name}>
      {getInitials(name)}
    </span>
  )
}
