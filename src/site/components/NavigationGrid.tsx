interface NavLink {
  label: string
  href: string
}

const links: NavLink[] = [
  { label: 'Foundations', href: '/iframe.html?id=meet-deck-foundations' },
  { label: 'Atoms', href: '/iframe.html?id=build-atoms' },
  { label: 'Molecules', href: '/iframe.html?id=build-molecules' },
  { label: 'Organisms', href: '/iframe.html?id=build-organisms' },
]

export function NavigationGrid() {
  return (
    <div className="nav-grid">
      {links.map((link) => (
        <a key={link.label} href={link.href} className="nav-link">
          {link.label}
        </a>
      ))}
    </div>
  )
}
