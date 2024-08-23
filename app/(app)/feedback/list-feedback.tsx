"use client";

import { useTeam } from "@/lib/store";
import { PackageOpen, SmilePlus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import moment from "moment";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ListFeedback() {
  const team = useTeam((state) => state.team);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const getFeedbacks = async (teamId: string) => {
      fetch(`/api/team/${teamId}/feedbacks`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setFeedbacks(data.data);
          } else {
            toast.error(data.message);
          }
        })
        .catch((error) => {
          toast.error(error.message);
        });
    };

    if (team) {
      getFeedbacks(team.id);
    }
  }, [team]);

  return (
    <>
      {feedbacks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {feedbacks.map((i) => (
            <div key={i.id} className="w-full rounded p-4 bg-white shadow border hover:border-brand hover:shadow-md transition-all">
              <div className="flex items-center gap-2 text-xs uppercase font-semibold mb-2">
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] ${i.sentiment === "positive" && "bg-[#00dc94] text-white"} ${
                    i.sentiment === "negative" && "bg-[#f70030] text-white"
                  } ${i.sentiment === "neutral" && "bg-gray-900 text-white"}`}
                >
                  <SmilePlus className="w-3 h-3" />
                  {i.sentiment}
                </div>

                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100">
                  <Star className="w-3 h-3" />
                  {i.rate}
                </div>
              </div>
              <p className="text-gray-600">{i.description}</p>
              <hr className="my-3" />
              <p className="text-xs text-gray-500">{moment(i.createdAt).fromNow()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-xl w-full mt-12 text-center p-12 shadow-sm border">
					<div className="size-40 grid place-content-center bg-gradient-to-t from-dark/10 rounded-full mx-auto mb-6">
						<PackageOpen className="size-20" />
					</div>
          <h2 className="font-medium text-xl mb-6">You haven&apos;t gotten any feedback yet</h2>
          <div className="flex items-center justify-center gap-4">
            <Button variant="dark">
              <Link href="/widgets">Setup Widgets</Link>
            </Button>
            <Button variant="dark">
							<Link href="/integrations">Install Widgets</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
