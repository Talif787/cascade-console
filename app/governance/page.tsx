"use client";

import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SloList } from "@/components/governance/slo-list";
import { CostReport } from "@/components/governance/cost-report";
import { LineageExplorer } from "@/components/governance/lineage-explorer";

export default function GovernancePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Governance"
        title="Governance"
        description="Freshness SLOs, cost accounting, and dataset lineage across the platform."
      />
      <Tabs defaultValue="slos">
        <TabsList>
          <TabsTrigger value="slos">SLOs</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="lineage">Lineage</TabsTrigger>
        </TabsList>
        <TabsContent value="slos">
          <SloList />
        </TabsContent>
        <TabsContent value="cost">
          <CostReport />
        </TabsContent>
        <TabsContent value="lineage">
          <LineageExplorer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
