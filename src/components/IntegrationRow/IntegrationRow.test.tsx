import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../Button/Button'
import { IntegrationRow } from './IntegrationRow'

describe('IntegrationRow', () => {
  it('defaults to reporting a service as not connected', () => {
    render(<IntegrationRow name="Salesforce" />)
    expect(screen.getByText('Not connected')).toBeVisible()
  })

  // The status must read as text; a tone alone fails WCAG 1.4.1.
  it('states each status in words', () => {
    const { rerender } = render(<IntegrationRow name="HubSpot" status="connected" />)
    expect(screen.getByText('Connected')).toBeVisible()

    rerender(<IntegrationRow name="HubSpot" status="attention" />)
    expect(screen.getByText('Needs permission')).toBeVisible()
  })

  it('lets a service bring its own vocabulary', () => {
    render(
      <IntegrationRow
        name="Google Calendar"
        status="connected"
        statusLabel="Calendar enabled"
      />,
    )
    expect(screen.getByText('Calendar enabled')).toBeVisible()
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
  })

  it('shows which account the connection runs as', () => {
    render(
      <IntegrationRow name="GitHub" status="connected" account="benackles" />,
    )
    expect(screen.getByText('benackles')).toBeVisible()
  })

  it('renders its actions', () => {
    render(
      <IntegrationRow
        name="HubSpot"
        status="connected"
        actions={<Button>Disconnect</Button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument()
  })

  // The name is already text beside it, so the mark must not be announced.
  it('hides the logo from assistive tech', () => {
    render(
      <IntegrationRow name="HubSpot" logo={<svg data-testid="mark" />} />,
    )
    expect(screen.getByTestId('mark').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
