"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeam } from "@/lib/store";
import { Frown, Meh, MessageSquare, MessageSquareDashed, MessageSquarePlus, Smile, Star, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import TopKeywords from "./top-keywords";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const team = useTeam((state) => state.team);
  const [stats, setStats] = useState<any>();
  const [topKeywords, setTopKeywords] = useState<any[]>([]);

  useEffect(() => {
    const getStats = async () => {
      fetch(`/api/team/${team.id}/stats/dashboard`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStats(data.data);
          }
        })
        .catch((err) => console.log(err));
    };

    const getTopKeywords = async () => {
      fetch(`/api/team/${team.id}/stats/top-keywords`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTopKeywords(data.data);
          }
        })
        .catch((err) => console.log(err));
    };

    if (team) {
      getStats();
      getTopKeywords();
    }
  }, [team]);

  return (
    <>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-3xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1">Welcome back! Here's your feedback overview.</p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200">
          <p className="text-xs text-slate-600 font-medium">Team: <span className="font-bold text-indigo-600">{team?.name}</span></p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Feedback Card */}
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white hover:shadow-lg transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Feedback</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MessageSquarePlus className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {stats?.total || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        {/* Open Feedback Card */}
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-white hover:shadow-lg transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Open Items</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <MessageSquareDashed className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {stats?.open || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Pending review</p>
          </CardContent>
        </Card>

        {/* Resolved Feedback Card */}
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-lg transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Resolved</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {stats?.resolved || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Completed items</p>
          </CardContent>
        </Card>

        {/* Rating Average Card */}
        <Card className="border-violet-100 bg-gradient-to-br from-violet-50/50 to-white hover:shadow-lg transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Avg Rating</CardTitle>
            <div className="p-2 bg-violet-100 rounded-lg">
              <Star className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              {stats?.ratingAverage || "N/A"}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Analysis Card */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all h-full">
            <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-800">Sentiment Analysis</CardTitle>
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Customer emotion breakdown</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  negative: {
                    label: "Negative",
                    color: "#ef4444",
                  },
                  neutral: {
                    label: "Neutral",
                    color: "#64748b",
                  },
                  positive: {
                    label: "Positive",
                    color: "#10b981",
                  },
                }}
                className="h-[180px] w-full"
              >
                <BarChart
                  margin={{
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 10,
                  }}
                  data={[
                    {
                      activity: "positive",
                      value: parseInt(stats?.sentiment?.find((o: any) => o.name === "positive")?.percentage) || 0,
                      label: parseFloat(stats?.sentiment?.find((o: any) => o.name === "positive")?.percentage || 0).toFixed(1) + "%",
                      fill: "#10b981",
                    },
                    {
                      activity: "neutral",
                      value: parseInt(stats?.sentiment?.find((o: any) => o.name === "neutral")?.percentage) || 0,
                      label: parseFloat(stats?.sentiment?.find((o: any) => o.name === "neutral")?.percentage || 0).toFixed(1) + "%",
                      fill: "#64748b",
                    },
                    {
                      activity: "negative",
                      value: parseInt(stats?.sentiment?.find((o: any) => o.name === "negative")?.percentage) || 0,
                      label: parseFloat(stats?.sentiment?.find((o: any) => o.name === "negative")?.percentage || 0).toFixed(1) + "%",
                      fill: "#ef4444",
                    },
                  ]}
                  layout="vertical"
                  barSize={40}
                  barGap={2}
                >
                  <XAxis type="number" dataKey="value" hide />
                  <YAxis
                    dataKey="activity"
                    type="category"
                    tickLine={false}
                    tickMargin={4}
                    axisLine={false}
                    className="capitalize text-sm font-medium"
                  />
                  <Bar dataKey="value" radius={8}>
                    <LabelList
                      position="insideLeft"
                      dataKey="label"
                      fill="white"
                      offset={8}
                      fontSize={13}
                      fontWeight="600"
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex flex-row border-t bg-slate-50/50 p-4">
              <div className="flex w-full items-center gap-2">
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Smile className="h-3.5 w-3.5 text-emerald-600" />
                    <div className="text-xs text-slate-600 font-medium">Positive</div>
                  </div>
                  <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-emerald-600">
                    {stats?.sentiment?.find((o: any) => o.name === "positive")?.count || 0}
                  </div>
                </div>
                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Meh className="h-3.5 w-3.5 text-slate-600" />
                    <div className="text-xs text-slate-600 font-medium">Neutral</div>
                  </div>
                  <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-slate-600">
                    {stats?.sentiment?.find((o: any) => o.name === "neutral")?.count || 0}
                  </div>
                </div>
                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Frown className="h-3.5 w-3.5 text-red-600" />
                    <div className="text-xs text-slate-600 font-medium">Negative</div>
                  </div>
                  <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-red-600">
                    {stats?.sentiment?.find((o: any) => o.name === "negative")?.count || 0}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Top Keywords Card */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all h-full">
            <CardHeader className="pb-3 bg-gradient-to-r from-violet-50/30 to-purple-50/30 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-800">Top Keywords</CardTitle>
                <div className="px-3 py-1 rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                  AI Analyzed
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Most mentioned topics in feedback</p>
            </CardHeader>
            <CardContent className="pt-6">
              <TopKeywords data={topKeywords} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
