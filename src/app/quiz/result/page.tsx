"use client";

import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { ResultSummary } from "@/components/quiz/result-summary";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function QuizResultPage() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");

  const { data: submission, isLoading, error, refetch } = trpc.quiz.getSubmissionDetail.useQuery(
    { submissionId: submissionId! },
    { enabled: !!submissionId }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState 
          title="Failed to load results"
          description="There was an error loading your quiz results. Please try again."
          action={
            <div className="space-y-2">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild variant="ghost">
                <Link href="/quiz">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quiz
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>Results Not Found</CardTitle>
            <CardDescription>
              The requested quiz results could not be found or are no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild>
                <Link href="/quiz">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quiz
                </Link>
              </Button>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate max possible score for objective questions
  const objectiveAnswers = submission.answers.filter(answer => answer.isCorrect !== null);
  const maxScore = objectiveAnswers.length;

  // Generate stream suggestions and weak topics from traits
  const traits = submission.rawTraits || {};
  const sortedTraits = Object.entries(traits).sort(([,a], [,b]) => b - a);
  const topTraits = sortedTraits.slice(0, 2);
  
  const suggestedStreams: string[] = [];
  const weakTopics: string[] = [];
  
  // Simple rule-based suggestions
  if (topTraits.length > 0) {
    const [topTrait] = topTraits;
    if (topTrait[0] === 'I' || topTrait[0] === 'R') {
      suggestedStreams.push('SCIENCE');
    }
    if (topTrait[0] === 'C' || topTrait[0] === 'E') {
      suggestedStreams.push('COMMERCE');
    }
    if (topTrait[0] === 'A' || topTrait[0] === 'S') {
      suggestedStreams.push('ARTS');
    }
    
    // Add weak topics (lowest scoring traits)
    const weakTraits = sortedTraits.slice(-2).map(([trait]) => trait);
    weakTopics.push(...weakTraits);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ResultSummary
          score={submission.score}
          maxScore={maxScore}
          traits={traits}
          suggestedStreams={suggestedStreams}
          weakTopics={weakTopics}
          submissionId={submission.id}
        />
      </div>
    </div>
  );
}
