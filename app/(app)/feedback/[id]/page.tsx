"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-xl">Feedback Detail</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="sm:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
                Introducing Our Dynamic Orders Dashboard for Seamless Management and Insightful Analysis.
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent>
              <div className="space-y-1">
                <Label>Sentiment</Label>
                <h6 className="font-vold">Positive</h6>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
