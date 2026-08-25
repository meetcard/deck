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
    // .counter background comes from --accent-bg in App.css — fails if global CSS didn't load.
    await expect(getComputedStyle(counter).backgroundColor).toBe('rgba(170, 59, 255, 0.1)');
  },
};
