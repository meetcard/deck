/**
 * Live specimens for the Foundations docs page.
 *
 * These read the resolved CSS custom properties rather than hardcoding
 * values, so the documentation cannot drift from the tokens themselves.
 */
import { useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { colorTokens, space, typeScales } from '../foundations/tokens'
import { Mark, Wordmark } from '../foundations/brand'
import { Text } from '../components/Text'
import { Heading } from '../components/Heading'
import { IconButton } from '../components/IconButton'

const cellStyle: React.CSSProperties = {
  fontFamily: 'var(--deck-font-mono)',
  fontSize: '12px',
  color: 'var(--deck-color-text-muted)',
}

export function ColorTokens() {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {(Object.keys(colorTokens) as Array<keyof typeof colorTokens>).map(
        (group) => (
          <section key={group}>
            <Heading level={3} size="xs" style={{ marginBottom: '8px' }}>
              {group}
            </Heading>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
              }}
            >
              {colorTokens[group].map((name) => {
                const token = `--deck-color-${group}-${name}`
                return (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        flexShrink: 0,
                        borderRadius: 'var(--deck-radius-sm)',
                        background: `var(${token})`,
                        border: '1px solid var(--deck-color-border-default)',
                      }}
                    />
                    <span style={{ ...cellStyle, minWidth: 0 }}>{name}</span>
                  </div>
                )
              })}
            </div>
          </section>
        ),
      )}
    </div>
  )
}

const sampleFor: Record<string, string> = {
  display: 'MeetCard',
  heading: 'Your network is your net worth.',
  body: 'Capture every connection, activate every relationship.',
  label: 'Follow up · Add to CRM · Share card',
}

export function TypeScale() {
  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {(
        Object.keys(typeScales) as Array<keyof typeof typeScales>
      ).map((scale) => (
        <section key={scale}>
          <Heading level={3} size="xs" style={{ marginBottom: '12px' }}>
            {scale}
          </Heading>
          <div style={{ display: 'grid', gap: '10px' }}>
            {typeScales[scale].map((step) => (
              <div
                key={step}
                style={{ display: 'flex', gap: '16px', alignItems: 'baseline' }}
              >
                <span style={{ ...cellStyle, width: 48, flexShrink: 0 }}>
                  {step}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--deck-font-sans)',
                    fontSize: `var(--deck-font-size-${scale}-${step})`,
                    lineHeight: `var(--deck-line-height-${scale}-${step})`,
                    fontWeight:
                      scale === 'display' || scale === 'heading'
                        ? 'var(--deck-font-weight-semibold)'
                        : scale === 'label'
                          ? 'var(--deck-font-weight-medium)'
                          : 'var(--deck-font-weight-regular)',
                    color: 'var(--deck-color-text-default)',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sampleFor[scale]}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function SpaceScale() {
  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      {space.map((step) => (
        <div
          key={step}
          style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
        >
          <span style={{ ...cellStyle, width: 48, flexShrink: 0 }}>{step}</span>
          <span
            style={{
              height: 12,
              width: `var(--deck-space-${step})`,
              minWidth: 1,
              background: 'var(--deck-color-action-primary)',
              borderRadius: 'var(--deck-radius-sm)',
            }}
          />
        </div>
      ))}
    </div>
  )
}

const radiusSteps = ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']

export function RadiusScale() {
  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      {radiusSteps.map((step) => (
        <div key={step} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: 'var(--deck-color-background-brand-subtle)',
              border: '1px solid var(--deck-color-border-brand)',
              borderRadius: `var(--deck-radius-${step})`,
              marginBottom: '6px',
            }}
          />
          <span style={cellStyle}>{step}</span>
        </div>
      ))}
    </div>
  )
}

const shadowSteps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

const shadowUse: Record<string, string> = {
  xs: 'focus rings, inputs',
  sm: 'cards, menus',
  md: 'panels, popovers',
  lg: 'modals, drawers',
  xl: 'command palette',
  '2xl': 'sheets, overlays',
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect
      x="5.5"
      y="5.5"
      width="8"
      height="8"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M3.5 10.5V4a1.5 1.5 0 0 1 1.5-1.5h6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3 8.5l3 3 7-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Brand primitives, resolved to literal hex — copying `var(--deck-primitive-*)`
 * would produce an SVG that only renders correctly inside Deck's own token
 * scope. Substituting the values here keeps the copied markup a portable,
 * standalone asset.
 */
const brandPrimitives: Record<string, string> = {
  'var(--deck-primitive-signal-green)': '#2e6e5b',
  'var(--deck-primitive-ink)': '#1a1a1a',
}

function toCleanSvg(element: React.ReactElement): string {
  let markup = renderToStaticMarkup(element)
  for (const [token, hex] of Object.entries(brandPrimitives)) {
    markup = markup.split(token).join(hex)
  }
  return markup
}

function CopySvgButton({
  getSvg,
  label,
}: {
  getSvg: () => string
  label: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getSvg())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied or unavailable — nothing to recover into.
    }
  }

  return (
    <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
      <IconButton
        label={copied ? `Copied ${label} SVG` : `Copy ${label} SVG`}
        icon={copied ? <CheckIcon /> : <CopyIcon />}
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        style={{ opacity: copied ? 1 : 0.5 }}
      />
    </div>
  )
}

/**
 * The mark and wordmark on a fixed light plate — deliberately not the
 * surrounding docs page background, since these are the "Full Color —
 * Light" brand assets and only reliably read on a light surface.
 */
export function BrandMarks() {
  const plateStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#ffffff',
    border: '1px solid var(--deck-color-border-default)',
    borderRadius: 'var(--deck-radius-lg)',
  }

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...plateStyle, width: 96, height: 96 }}>
          <Mark style={{ height: 48, width: 48 }} />
          <CopySvgButton getSvg={() => toCleanSvg(<Mark />)} label="Mark" />
        </div>
        <Text size="xs" tone="muted" style={{ marginTop: '8px' }}>
          Mark
        </Text>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...plateStyle, width: 280, height: 96 }}>
          <Wordmark style={{ height: 40 }} />
          <CopySvgButton
            getSvg={() => toCleanSvg(<Wordmark />)}
            label="Wordmark"
          />
        </div>
        <Text size="xs" tone="muted" style={{ marginTop: '8px' }}>
          Wordmark
        </Text>
      </div>
    </div>
  )
}

export function ShadowScale() {
  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      {shadowSteps.map((step) => (
        <div key={step} style={{ textAlign: 'center', width: 120 }}>
          <div
            style={{
              width: 88,
              height: 88,
              margin: '0 auto 8px',
              background: 'var(--deck-color-background-elevated)',
              borderRadius: 'var(--deck-radius-lg)',
              boxShadow: `var(--deck-shadow-${step})`,
            }}
          />
          <Text size="xs" style={{ fontWeight: 500 }}>
            {step}
          </Text>
          <span style={cellStyle}>{shadowUse[step]}</span>
        </div>
      ))}
    </div>
  )
}
