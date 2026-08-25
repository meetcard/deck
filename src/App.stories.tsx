import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import App from './App';

const meta = {
  component: App,
  tags: ['ai-generated'],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const counter = canvas.getByRole('button', { name: /count is 0/i });
    await userEvent.click(counter);
    await expect(canvas.getByRole('button', { name: /count is 1/i })).toBeVisible();
  },
};

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const counter = canvas.getByRole('button', { name: /count is 0/i });
    // .counter uses --accent-bg, now aliased to the Deck brand-subtle token.
    // Fails if the Deck token stylesheet didn't load.
    const background = getComputedStyle(counter).backgroundColor;
    // --deck-color-background-brand-subtle: #eaf3ef light / #2b443e dark
    await expect(['rgb(234, 243, 239)', 'rgb(43, 68, 62)']).toContain(background);
  },
};
