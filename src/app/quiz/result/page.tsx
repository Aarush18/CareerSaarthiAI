"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flowchart } from "@/components/flowchart";

export default function QuizResultPage() {
  const [data, setData] = useState<any | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("quiz_result_payload");
      if (raw) setData(JSON.parse(raw));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!data ? (
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle>No Result</CardTitle>
            </CardHeader>
            <CardContent>
              Complete a quiz to see your recommendations.
            </CardContent>
          </Card>
        ) : (
          <>
            <Flowchart data={data} onSelect={(p) => setSelected(p)} />
            {selected && (
              <div className="mt-6 p-4 border rounded bg-white">
                <h2 className="text-xl font-semibold mb-2">{selected.name}</h2>
                <p className="text-gray-700 mb-2">{selected.description}</p>
                <p className="text-gray-800 font-medium mb-2">Why recommended</p>
                <p className="text-sm text-gray-700 mb-3">{selected.whyRecommended}</p>
                <p className="text-gray-800 font-medium mb-2">Steps to enter</p>
                <ul className="list-disc pl-6 text-sm mb-3">
                  {selected.stepsToEnter.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                </ul>
                <p className="text-gray-800 font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selected.skills.map((s: string, i: number) => (<span key={i} className="px-2 py-1 text-xs bg-gray-100 rounded">{s}</span>))}
                </div>
                <div className="text-sm text-gray-700">Earnings (INR/yr): {selected.approxEarningsINRPerYear.min.toLocaleString()} - {selected.approxEarningsINRPerYear.max.toLocaleString()}</div>
                <div className="text-sm text-gray-700">Demand in India: {selected.demandIndia.level} — {selected.demandIndia.justification}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
