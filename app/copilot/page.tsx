"use client";

import * as React from "react";
import { Sparkles, CornerDownLeft } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AskResult } from "@/components/copilot/ask-result";
import { useCatalog } from "@/lib/api/serving";
import { useAsk, type AskResponse } from "@/lib/api/copilot";
import type { ApiError } from "@/lib/api/client";

const AUTO = "__auto__";

export default function CopilotPage() {
  const catalog = useCatalog();
  const ask = useAsk();

  const [question, setQuestion] = React.useState("");
  const [viewId, setViewId] = React.useState<string>(AUTO);
  const [execute, setExecute] = React.useState(true);
  const [history, setHistory] = React.useState<AskResponse[]>([]);

  const entries = catalog.data?.entries ?? [];
  const err = ask.error as ApiError | null;

  function submit() {
    const q = question.trim();
    if (!q) return;
    ask.mutate(
      { question: q, view_id: viewId === AUTO ? null : viewId, execute },
      {
        onSuccess: (res) => {
          setHistory((h) => [res, ...h]);
          setQuestion("");
        },
      },
    );
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Copilot"
        title="Ask in natural language"
        description="Copilot translates a question into a governed query against a serving view, validates it through the same plan the API enforces, then optionally runs it."
      />

      <Card className="mb-6">
        <CardContent className="space-y-4 py-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="view">Serving view</Label>
              <Select value={viewId} onValueChange={setViewId}>
                <SelectTrigger id="view">
                  <SelectValue placeholder="Let Copilot choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUTO}>Let Copilot choose</SelectItem>
                  {entries.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch id="execute" checked={execute} onCheckedChange={setExecute} />
              <Label htmlFor="execute">Run the query</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="How many orders were placed per region last month?"
              className="min-h-[88px]"
            />
          </div>

          {err ? (
            <p className="text-[0.82rem] text-[var(--down)]">
              {err.status ? `(${err.status}) ` : ""}
              {err.detail}
            </p>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-[0.72rem] text-muted-foreground">
              <span className="tnum rounded bg-muted px-1.5 py-0.5">Cmd/Ctrl + Enter</span> to ask
            </span>
            <Button onClick={submit} disabled={ask.isPending || question.trim() === ""}>
              <Sparkles className="h-4 w-4" />
              {ask.isPending ? "Asking" : "Ask Copilot"}
              {!ask.isPending ? <CornerDownLeft className="h-3.5 w-3.5 opacity-70" /> : null}
            </Button>
          </div>
        </CardContent>
      </Card>

      {history.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Ask something about one of your serving views. Copilot shows the plan it generated and the rows it returned."
          icon={<Sparkles className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-4">
          {history.map((res) => (
            <AskResult key={res.id} result={res} />
          ))}
        </div>
      )}
    </div>
  );
}
