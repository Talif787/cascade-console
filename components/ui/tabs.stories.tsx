import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="schema" className="w-80">
      <TabsList>
        <TabsTrigger value="schema">Schema</TabsTrigger>
        <TabsTrigger value="query">Query</TabsTrigger>
        <TabsTrigger value="lineage">Lineage</TabsTrigger>
      </TabsList>
      <TabsContent value="schema">Declared dimensions and measures.</TabsContent>
      <TabsContent value="query">Run a governed query.</TabsContent>
      <TabsContent value="lineage">Upstream and downstream assets.</TabsContent>
    </Tabs>
  ),
};
