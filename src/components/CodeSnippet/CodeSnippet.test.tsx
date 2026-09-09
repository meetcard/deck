import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeSnippet } from './CodeSnippet'

const CODE = '<script src="embed.js"></script>\n<meetcard-book></meetcard-book>'

afterEach(() => {
  vi.restoreAllMocks()
})

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  return writeText
}

describe('CodeSnippet', () => {
  it('names the block for assistive tech', () => {
    render(<CodeSnippet label="Inline embed" code={CODE} />)
    expect(screen.getByRole('group', { name: 'Inline embed' })).toBeInTheDocument()
  })

  it('copies the exact code, newlines and all', async () => {
    const writeText = stubClipboard()
    render(<CodeSnippet label="Inline embed" code={CODE} />)

    await userEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith(CODE)
  })

  // The result is announced, not just animated.
  it('reports a successful copy on the control', async () => {
    stubClipboard()
    render(<CodeSnippet label="Inline embed" code={CODE} />)

    await userEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  // Clipboard access is routinely denied; the code is still selectable text.
  it('survives a denied clipboard without throwing', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    render(<CodeSnippet label="Inline embed" code={CODE} />)

    await userEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  // The block scrolls, so it must be reachable without a mouse.
  it('lets a keyboard reach the scrollable block', async () => {
    render(<CodeSnippet label="Inline embed" code={CODE} />)

    await userEvent.tab()
    expect(screen.getByRole('group', { name: 'Inline embed' })).toHaveFocus()
  })

  it('keeps the label for assistive tech when it is visually hidden', () => {
    render(<CodeSnippet label="Inline embed" code={CODE} hideLabel />)
    expect(screen.getByRole('group', { name: 'Inline embed' })).toBeInTheDocument()
  })

  it('describes the block with its description', () => {
    render(
      <CodeSnippet
        label="Inline embed"
        description="Paste into any page."
        code={CODE}
      />,
    )
    expect(screen.getByRole('group', { name: 'Inline embed' })).toHaveAccessibleDescription(
      'Paste into any page.',
    )
  })
})
