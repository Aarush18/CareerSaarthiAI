"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Gauge, Boxes, TrendingUp, Sparkles } from "lucide-react";

type Profession = {
  name: string;
  description: string;
  whyRecommended: string;
  stepsToEnter: string[];
  skills: string[];
  approxEarningsINRPerYear: { min: number; max: number };
  demandIndia: { level: "High" | "Medium" | "Low"; justification: string };
};

type SubField = {
  name: string;
  description: string;
  professions: Profession[];
};

type FlowData = {
  careerPathTitle: string;
  summary: string;
  topCodes: Array<"R" | "I" | "A" | "S" | "E" | "C">;
  subFields: SubField[];
  nextSteps: string;
};

export function Flowchart({ data }: { data: FlowData }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeProfession, setActiveProfession] = useState<Profession | null>(null);
  const subfieldRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const professionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [paths, setPaths] = useState<Array<{ d: string }>>([]);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightColumnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const cont = containerRef.current;
      const left = leftRef.current;
      const rightColumn = rightColumnRef.current;
      if (!cont || !left || !rightColumn) return;
      const contRect = cont.getBoundingClientRect();
      const leftRect = left.getBoundingClientRect();
      const newPaths: Array<{ d: string }> = [];

      data.subFields.forEach((sf, sIndex) => {
        const sfEl = subfieldRefs.current[sIndex];
        if (!sfEl) return;
        const sfRect = sfEl.getBoundingClientRect();

        // From left node to subfield header
        const sx = leftRect.right - contRect.left;
        const sy = leftRect.top - contRect.top + leftRect.height / 2;
        const mx = sfRect.left - contRect.left;
        const my = sfRect.top - contRect.top + 28;
        const dx1 = Math.max(60, (mx - sx) / 2);
        newPaths.push({ d: `M ${sx} ${sy} C ${sx + dx1} ${sy}, ${mx - dx1} ${my}, ${mx} ${my}` });

        // From subfield to each corresponding profession card in the right column
        sf.professions.forEach((p, pi) => {
          const key = `${sIndex}-${pi}`;
          const profEl = professionRefs.current[key];
          if (!profEl) return;
          const pr = profEl.getBoundingClientRect();
          const ex = pr.left - contRect.left;
          const ey = pr.top - contRect.top + pr.height / 2;
          const sx2 = sfRect.right - contRect.left;
          const sy2 = sfRect.top - contRect.top + sfRect.height / 2;
          const dx2 = Math.max(60, (ex - sx2) / 2);
          newPaths.push({ d: `M ${sx2} ${sy2} C ${sx2 + dx2} ${sy2}, ${ex - dx2} ${ey}, ${ex} ${ey}` });
        });
      });

      setPaths(newPaths);
    });
    return () => cancelAnimationFrame(id);
  }, [data]);

  return (
    <div ref={containerRef} className="space-y-8 relative rounded-xl bg-neutral-900 text-neutral-100 p-6">
      <style>{`
        @keyframes dashMove { to { stroke-dashoffset: -1000; } }
      `}</style>
      {/* Title Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Node */}
        <Card ref={leftRef} className="border-0 shadow-lg bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl"><Gauge className="h-5 w-5" /> Personalized Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-50/90 mb-3">{data.summary}</p>
            <div className="flex flex-wrap gap-2">
              {data.topCodes.map((c) => (
                <Badge key={c} className="bg-emerald-100 text-emerald-800 border border-emerald-200">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subfields Column */}
        <div className="space-y-6">
          {data.subFields.map((sf, idx) => (
            <div key={idx}>
              <Card ref={(el) => (subfieldRefs.current[idx] = el)} className="bg-neutral-800/60 border-neutral-700 hover:border-emerald-500 transition-colors rounded-2xl">
                <CardHeader className="bg-neutral-800/80 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-base text-emerald-300"><Boxes className="h-4 w-4" /> {sf.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-200">{sf.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Right Professions Column */}
        <div ref={rightColumnRef} className="space-y-4">
          {data.subFields.map((sf, sIndex) => (
            <div key={sIndex} className="space-y-3">
              {sf.professions.map((p, pi) => (
                <Card
                  key={pi}
                  ref={(el) => (professionRefs.current[`${sIndex}-${pi}`] = el)}
                  className="bg-indigo-500/90 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shadow-md transition-transform hover:-translate-y-0.5"
                  onClick={() => setActiveProfession(p)}
                >
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm leading-5">{p.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Subfields and Professions grouped */}
      {/* SVG connectors (desktop) with animated strokes */}
      <svg className="pointer-events-none absolute inset-0 hidden md:block" width="100%" height="100%">
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke="#34d399"
            strokeWidth="2.5"
            fill="none"
            opacity="0.5"
            strokeDasharray="10 8"
            style={{ animation: "dashMove 6s linear infinite" }}
          />
        ))}
      </svg>

      {/* Details Modal */}
      <Dialog open={!!activeProfession} onOpenChange={() => setActiveProfession(null)}>
        <DialogContent className="max-w-2xl">
          {activeProfession && (
            <>
              <DialogHeader>
                <DialogTitle>{activeProfession.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-gray-700">{activeProfession.description}</p>
                <div>
                  <p className="font-medium mb-1">Why recommended</p>
                  <p className="text-sm text-gray-700">{activeProfession.whyRecommended}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Steps to enter</p>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    {activeProfession.stepsToEnter.map((s, i) => (<li key={i}>{s}</li>))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {activeProfession.skills.map((s, i) => (
                      <Badge key={i} className="bg-green-100 text-green-700 border border-green-200">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  Earnings (INR/yr): {activeProfession.approxEarningsINRPerYear.min.toLocaleString()} - {activeProfession.approxEarningsINRPerYear.max.toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">
                  Demand in India: {activeProfession.demandIndia.level} — {activeProfession.demandIndia.justification}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


