"use client";

import { Card } from "@/components/ui/card";
import { useTeam } from "@/lib/store";
import { ArrowRight, Frown, Meh, MessageSquare, MessageSquareDashed, MessageSquarePlus, Smile, SmilePlus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import TopKeywords from "./top-keywords";

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-xl">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="w-full bg-white rounded border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5" />
              <h4 className="font-bold text-lg">{stats?.total}</h4>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>
          <p className="text-sm">Feedback Added</p>
        </div>
        <div className="w-full bg-white rounded border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquareDashed className="w-5 h-5" />
              <h4 className="font-bold text-lg">{stats?.open}</h4>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>
          <p className="text-sm">Feedback Open</p>
        </div>
        <div className="w-full bg-white rounded border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <h4 className="font-bold text-lg">{stats?.resolved}</h4>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>
          <p className="text-sm">Feedback Resolved</p>
        </div>
        <div className="w-full bg-white rounded border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <h4 className="font-bold text-lg">{stats?.ratingAverage}</h4>
            </div>
            <ArrowRight className="w-4 h-4" />
          </div>
          <p className="text-sm">Rating Average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-4">
            <h3 className="font-bold mb-2">Top Keywords</h3>
            <TopKeywords data={topKeywords} />
          </Card>
        </div>
        <div>
          <Card className="p-4">
            <h3 className="font-bold mb-2">Sentiment</h3>
            <div className="divide-y-2 font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 py-2 text-green-500">
                  <Smile className="w-4 h-4" />
                  <p>Positive</p>
                </div>
                <p className="font-bold font-mono">{stats?.sentiment?.find((o: any) => o.name === "positive")?.percentage}%</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 py-2">
                  <Meh className="w-4 h-4" />
                  <p>Neutral</p>
                </div>
                <p className="font-bold font-mono">{stats?.sentiment?.find((o: any) => o.name === "neutral")?.percentage}%</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 py-2 text-red-500">
                  <Frown className="w-4 h-4" />
                  <p>Negative</p>
                </div>
                <p className="font-bold font-mono">{stats?.sentiment?.find((o: any) => o.name === "negative")?.percentage}%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
