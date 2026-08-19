import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "primary", "ok", "warn", "down", "outline", "bronze", "silver", "gold"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { children: "neutral" } };
export const Ok: Story = { args: { tone: "ok", children: "fresh" } };
export const Warn: Story = { args: { tone: "warn", children: "at risk" } };
export const Down: Story = { args: { tone: "down", children: "breached" } };

export const MedallionLayers: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge tone="bronze">bronze</Badge>
      <Badge tone="silver">silver</Badge>
      <Badge tone="gold">gold</Badge>
    </div>
  ),
};
