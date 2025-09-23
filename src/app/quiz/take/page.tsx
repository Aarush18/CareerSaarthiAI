"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JsonQuestionStepper } from "@/components/quiz/json-question-stepper";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function TakeQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizClass = searchParams.get("class") === "12" ? "12" : "10";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<{ title: string; questions: any[] } | null>(null);

  // Prevent navigation away if quiz is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress will be lost.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    async function loadQuiz() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/quiz/questions");
        const data = await res.json();
        const q = data.quizzes.find((q: any) => q.class === quizClass);
        setQuiz({ title: q.title, questions: q.questions });
      } catch (e) {
        setError("Failed to load quiz");
      } finally {
        setIsLoading(false);
      }
    }
    loadQuiz();
  }, [quizClass]);

  const handleQuizComplete = async (answers: Record<string, number | string>) => {
    setIsSubmitting(true);
    try {
      const meta = { userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "", timestamp: new Date().toISOString() };
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizClass, answers, meta }),
      });
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
      const payload = await res.json();
      if (typeof window !== "undefined") sessionStorage.setItem("quiz_result_payload", JSON.stringify(payload));
      router.push(`/quiz/result`);
    } catch (e) {
      console.error("Quiz submission failed:", e);
      setIsSubmitting(false);
      setError("Submission failed");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState 
          title="Loading Quiz"
          description="Please wait while we load your quiz..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState 
          title="Failed to load quiz"
          description="There was an error loading the quiz. Please try again."
          action={<Button onClick={() => location.reload()} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Try Again</Button>}
        />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>
              The requested quiz could not be found or is no longer available.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/quiz">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.questions.length} questions • 10-15 minutes</p>
            </div>
          </div>
        </div>

        {/* Quiz Stepper */}
        <JsonQuestionStepper questions={quiz.questions} onComplete={handleQuizComplete} isLoading={isSubmitting} />

        {/* Instructions */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• Read each question carefully and select the answer that best represents your preference or knowledge</p>
              <p>• For interest questions, choose based on how much you enjoy or identify with each activity</p>
              <p>• For aptitude questions, select the most accurate answer based on your knowledge</p>
              <p>• You can navigate back and forth between questions using the Previous/Next buttons</p>
              <p>• Once you submit, you cannot change your answers</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
