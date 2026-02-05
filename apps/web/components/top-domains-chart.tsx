"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Favicon } from "@/components/favicon";
import { formatBytes } from "@/lib/utils";
import type { DomainStats } from "@clashstats/shared";

interface TopDomainsChartProps {
  data: DomainStats[];
}

const TOP_OPTIONS = [10, 20, 50, 100] as const;
type TopOption = (typeof TOP_OPTIONS)[number];

// Vibrant color palette for bars
const COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
];

export function TopDomainsChart({ data }: TopDomainsChartProps) {
  const t = useTranslations("domains");
  const commonT = useTranslations("stats");
  const [topN, setTopN] = useState<TopOption>(10);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data
      .slice(0, topN)
      .map((domain, index) => ({
        name: domain.domain.length > 20 ? domain.domain.slice(0, 20) + "..." : domain.domain,
        fullDomain: domain.domain,
        total: domain.totalDownload + domain.totalUpload,
        download: domain.totalDownload,
        upload: domain.totalUpload,
        color: COLORS[index % COLORS.length],
      }));
  }, [data, topN]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Favicon domain={item.fullDomain} size="sm" />
            <span className="font-medium text-sm text-foreground">{item.fullDomain}</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{commonT("total")}:</span>
              <span className="font-medium text-foreground">{formatBytes(item.total)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-blue-500">{commonT("download")}:</span>
              <span className="text-foreground">{formatBytes(item.download)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-purple-500">{commonT("upload")}:</span>
              <span className="text-foreground">{formatBytes(item.upload)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t("topDomainsByTraffic")}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("mostBandwidthConsuming")}
            </p>
          </div>
          <Tabs value={topN.toString()} onValueChange={(v) => setTopN(parseInt(v) as TopOption)}>
            <TabsList className="h-8">
              {TOP_OPTIONS.map((n) => (
                <TabsTrigger key={n} value={n.toString()} className="text-xs px-3">
                  Top {n}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 80, left: 40, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#888888" 
                opacity={0.2} 
                horizontal={false} 
              />
              <XAxis
                type="number"
                tickFormatter={(value) => formatBytes(value, 0)}
                tick={{ fill: "#888888", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: "currentColor" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: "rgba(128, 128, 128, 0.1)" }} 
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  formatter={(value: number) => formatBytes(value, 0)}
                  className="fill-foreground"
                  style={{ fontSize: 10, whiteSpace: 'nowrap' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
