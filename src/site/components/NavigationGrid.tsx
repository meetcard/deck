interface NavLink {
  label: string
  href: string
}

// Storybook is published under /storybook (see netlify.toml). Each href is a
// manager URL with ?path=, not iframe.html: the manager keeps the sidebar, so
// these land somewhere you can browse from. IDs are the real ones from
// storybook-static/index.json — Storybook does not resolve bare prefixes.
const links: NavLink[] = [
  { label: 'Foundations', href: '/storybook/?path=/docs/design-system-foundations--docs' },
  { label: 'Atoms', href: '/storybook/?path=/docs/build-atoms-avatar--docs' },
  { label: 'Molecules', href: '/storybook/?path=/docs/build-molecules-attendeelist--docs' },
  { label: 'Organisms', href: '/storybook/?path=/docs/build-organisms-appbar--docs' },
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
