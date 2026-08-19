import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <div className="w-56">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a layer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bronze">Bronze</SelectItem>
          <SelectItem value="silver">Silver</SelectItem>
          <SelectItem value="gold">Gold</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
