import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-72">
      <CardHeader>
        <div>
          <CardTitle>orders_daily</CardTitle>
          <CardDescription>Gold layer serving view</CardDescription>
        </div>
        <Badge tone="ok">fresh</Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <span className="tnum">128,402</span> rows across 6 dimensions.
      </CardContent>
    </Card>
  ),
};
