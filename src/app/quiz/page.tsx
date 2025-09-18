"use client";

import { trpc } from "@/trpc/client";
import { QuizCard } from "@/components/quiz/quiz-card";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function QuizPage() {
  const { data: quiz, isLoading, error, refetch } = trpc.quiz.getActiveQuiz.useQuery({
    forLevel: "ANY"
  });

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
          title="Failed to load quiz"
          description="There was an error loading the quiz. Please try again."
          action={
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>No Quiz Available</CardTitle>
            <CardDescription>
              There are currently no active quizzes available. Please check back later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Career Pathfinder</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your ideal career path through our comprehensive interest and aptitude assessment
          </p>
        </div>

        {/* Quiz Card */}
        <QuizCard
          title={quiz.title}
          description={quiz.description}
          forLevel={quiz.forLevel}
          questionCount={quiz.questions.length}
          quizId={quiz.id}
        />

        {/* Additional Info */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What to Expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• <strong>Interest Assessment:</strong> Questions about your preferences and interests across different career areas</p>
              <p>• <strong>Aptitude Test:</strong> Basic numerical, verbal, logical, and spatial reasoning questions</p>
              <p>• <strong>Personalized Results:</strong> Get career stream recommendations based on your responses</p>
              <p>• <strong>Time Required:</strong> Approximately 10-15 minutes to complete</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
