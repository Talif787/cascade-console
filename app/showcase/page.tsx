"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="eyebrow">{title}</div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
      <Separator />
    </section>
  );
}

type Row = { id: string; view: string; layer: string; rows: number };

const columns: ColumnDef<Row>[] = [
  { accessorKey: "view", header: "Serving view" },
  {
    accessorKey: "layer",
    header: "Layer",
    cell: ({ row }) => {
      const layer = row.getValue("layer") as string;
      const tone =
        layer === "gold" ? "gold" : layer === "silver" ? "silver" : "bronze";
      return <Badge tone={tone}>{layer}</Badge>;
    },
  },
  {
    accessorKey: "rows",
    header: "Rows",
    cell: ({ row }) => <span className="tnum">{(row.getValue("rows") as number).toLocaleString()}</span>,
  },
];

const sampleRows: Row[] = [
  { id: "1", view: "orders_daily", layer: "gold", rows: 128_402 },
  { id: "2", view: "sessions_hourly", layer: "silver", rows: 2_004_881 },
  { id: "3", view: "events_raw", layer: "bronze", rows: 51_209_773 },
  { id: "4", view: "revenue_by_region", layer: "gold", rows: 4_120 },
];

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      <div>
        <div className="eyebrow mb-1.5">Design system</div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Components
        </h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-muted-foreground">
          The full component library, themeable via the toggle in the top bar. Every surface in the
          console is built from these primitives.
        </p>
      </div>

      <Section title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
        <Button size="sm">Small</Button>
        <Button disabled>Disabled</Button>
      </Section>

      <Section title="Badges">
        <Badge>neutral</Badge>
        <Badge tone="primary">primary</Badge>
        <Badge tone="ok">ready</Badge>
        <Badge tone="warn">at risk</Badge>
        <Badge tone="down">breached</Badge>
        <Badge tone="bronze">bronze</Badge>
        <Badge tone="silver">silver</Badge>
        <Badge tone="gold">gold</Badge>
      </Section>

      <Section title="Inputs and controls">
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor="demo-input">Serving view name</Label>
          <Input id="demo-input" placeholder="orders_daily" />
        </div>
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor="demo-textarea">Description</Label>
          <Textarea id="demo-textarea" placeholder="What this view exposes..." />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="demo-switch" defaultChecked />
          <Label htmlFor="demo-switch">Auth enabled</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="demo-check" defaultChecked />
          <Label htmlFor="demo-check">Exactly-once</Label>
        </div>
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
      </Section>

      <Section title="Overlays">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register serving view</DialogTitle>
              <DialogDescription>Define the dimensions and measures to expose.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="dlg-name">Name</Label>
              <Input id="dlg-name" placeholder="orders_daily" />
            </div>
            <DialogFooter>
              <Button variant="ghost">Cancel</Button>
              <Button>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine the current view.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Dropdown</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Evaluate</DropdownMenuItem>
            <DropdownMenuItem>Suspend</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Retire</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="text-sm text-muted-foreground">
              Popovers anchor floating content to a trigger.
            </p>
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover for tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>Freshness SLO: meeting target</TooltipContent>
        </Tooltip>

        <Button variant="outline" onClick={() => toast.success("Serving view created", { description: "orders_daily is now queryable." })}>
          Fire a toast
        </Button>
      </Section>

      <Section title="Tabs and accordion">
        <div className="w-full max-w-md">
          <Tabs defaultValue="schema">
            <TabsList>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="query">Query</TabsTrigger>
              <TabsTrigger value="lineage">Lineage</TabsTrigger>
            </TabsList>
            <TabsContent value="schema">
              <p className="text-sm text-muted-foreground">Declared dimensions and measures.</p>
            </TabsContent>
            <TabsContent value="query">
              <p className="text-sm text-muted-foreground">Run a governed query.</p>
            </TabsContent>
            <TabsContent value="lineage">
              <p className="text-sm text-muted-foreground">Upstream and downstream assets.</p>
            </TabsContent>
          </Tabs>
        </div>
        <div className="w-full max-w-md">
          <Accordion type="single" collapsible>
            <AccordionItem value="a">
              <AccordionTrigger>What is a serving view?</AccordionTrigger>
              <AccordionContent>A governed, queryable projection over the lakehouse.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>How are queries validated?</AccordionTrigger>
              <AccordionContent>Against the view&apos;s declared dimensions, measures, and roles.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      <Section title="Cards and feedback">
        <Card className="w-64">
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
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>TP</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </Section>

      <Section title="Data table">
        <div className="w-full">
          <DataTable columns={columns} data={sampleRows} filterColumn={{ id: "view", placeholder: "Filter views..." }} pageSize={5} />
        </div>
      </Section>
    </div>
  );
}
