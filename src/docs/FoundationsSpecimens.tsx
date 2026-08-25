/**
 * Live specimens for the Foundations docs page.
 *
 * These read the resolved CSS custom properties rather than hardcoding
 * values, so the documentation cannot drift from the tokens themselves.
 */
import { colorTokens, space, typeScales } from '../foundations/tokens'
import { Text } from '../components/Text'
import { Heading } from '../components/Heading'

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
