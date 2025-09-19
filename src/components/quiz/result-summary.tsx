"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Brain, 
  Target, 
  MessageCircle, 
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Download,
  Copy
} from "lucide-react";
import Link from "next/link";

interface ResultSummaryProps {
  score?: number | null;
  maxScore?: number;
  traits: Record<string, number>;
  suggestedStreams: string[];
  weakTopics: string[];
  submissionId: string;
  forLevel?: string;
}

const RIASEC_LABELS = {
  R: "Realistic",
  I: "Investigative", 
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional"
};

const RIASEC_COLORS = {
  R: "bg-red-100 text-red-800",
  I: "bg-blue-100 text-blue-800", 
  A: "bg-purple-100 text-purple-800",
  S: "bg-green-100 text-green-800",
  E: "bg-orange-100 text-orange-800",
  C: "bg-gray-100 text-gray-800"
};

export function ResultSummary({ 
  score, 
  maxScore, 
  traits, 
  suggestedStreams, 
  weakTopics,
  submissionId,
  forLevel = "ANY"
}: ResultSummaryProps) {
  const scorePercentage = score && maxScore ? (score / maxScore) * 100 : 0;
  
  // Sort traits by score
  const sortedTraits = Object.entries(traits)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3); // Top 3 traits

  // Generate LLM-ready JSON data
  const llmData = {
    studentProfile: {
      classLevel: forLevel,
      submissionId: submissionId,
      timestamp: new Date().toISOString(),
    },
    assessmentResults: {
      aptitudeScore: {
        score: score,
        maxScore: maxScore,
        percentage: scorePercentage,
        level: scorePercentage >= 80 ? "Excellent" : 
               scorePercentage >= 60 ? "Good" : 
               scorePercentage >= 40 ? "Fair" : "Needs Improvement"
      },
      riasecTraits: {
        realistic: traits.R || 0,
        investigative: traits.I || 0,
        artistic: traits.A || 0,
        social: traits.S || 0,
        enterprising: traits.E || 0,
        conventional: traits.C || 0,
        dominantTraits: sortedTraits.slice(0, 2).map(([trait, score]) => ({
          trait: RIASEC_LABELS[trait as keyof typeof RIASEC_LABELS],
          score: score
        }))
      },
      recommendations: {
        suggestedStreams: suggestedStreams,
        weakAreas: weakTopics.map(topic => RIASEC_LABELS[topic as keyof typeof RIASEC_LABELS] || topic),
        nextSteps: forLevel === 'CLASS_10' ? [
          "Research Science, Commerce, and Arts streams",
          "Talk to career counselors",
          "Explore subject combinations",
          "Consider your interests and strengths"
        ] : [
          "Research colleges and courses",
          "Prepare for entrance exams",
          "Explore career options in your chosen field",
          "Connect with professionals in your area of interest"
        ]
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(llmData, null, 2));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Quiz Results</h1>
        </div>
        <p className="text-gray-600">Your personalized career guidance report</p>
      </div>

      {/* Score Section (if available) */}
      {score !== null && maxScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Aptitude Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{score}/{maxScore}</span>
                <span className="text-sm text-gray-600">{Math.round(scorePercentage)}%</span>
              </div>
              <Progress value={scorePercentage} className="h-3" />
              <p className="text-sm text-gray-600">
                {scorePercentage >= 80 ? "Excellent!" : 
                 scorePercentage >= 60 ? "Good!" : 
                 scorePercentage >= 40 ? "Fair" : "Needs improvement"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RIASEC Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Interest Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Based on your responses, here are your top interest areas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedTraits.map(([trait, score], index) => (
                <div key={trait} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={RIASEC_COLORS[trait as keyof typeof RIASEC_COLORS]}>
                      {RIASEC_LABELS[trait as keyof typeof RIASEC_LABELS]}
                    </Badge>
                    <span className="text-sm font-medium">{score}</span>
                  </div>
                  <Progress value={(score / 15) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Recommended Career Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestedStreams.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {suggestedStreams.map((stream, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {stream}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No specific recommendations available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      {weakTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Consider focusing on these areas to broaden your career options:
              </p>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-orange-600 border-orange-200">
                    {RIASEC_LABELS[topic as keyof typeof RIASEC_LABELS] || topic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LLM JSON Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Ready Results (JSON Format)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your quiz results are formatted for easy integration with AI career counselors and LLM agents.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(llmData, null, 2)}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              <Button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(llmData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `quiz-results-${submissionId}.json`;
                  a.click();
                }}
                variant="outline" 
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild className="w-full">
          <Link href="/careers">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Career Paths
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full">
          <Link href="/colleges">
            <GraduationCap className="h-4 w-4 mr-2" />
            Nearby Colleges
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full">
          <Link href="/meetings?create=true&agentRole=COUNSELOR">
            <MessageCircle className="h-4 w-4 mr-2" />
            Talk to AI Counselor
          </Link>
        </Button>
      </div>

      {/* Retake Quiz */}
      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/quiz">
            Take Quiz Again
          </Link>
        </Button>
      </div>
    </div>
  );
}
