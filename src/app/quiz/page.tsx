"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { QuizCard } from "@/components/quiz/quiz-card";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, GraduationCap, BookOpen, Brain } from "lucide-react";
import Image from "next/image";

export default function QuizPage() {
  const [selectedLevel, setSelectedLevel] = useState<'CLASS_10' | 'CLASS_12' | null>(null);
  
  const { data: quiz, isLoading, error, refetch } = trpc.quiz.getActiveQuiz.useQuery({
    forLevel: selectedLevel || "ANY"
  }, {
    enabled: !!selectedLevel
  });

  // Show class selection if no level is selected
  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="h-12 w-12 text-green-600" />
              <h1 className="text-5xl font-bold text-gray-900">Runtime Terror</h1>
            </div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Tell us where you are right now
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We'll guide you with the most relevant quiz and career options tailored to your academic level.
            </p>
          </div>

          {/* Class Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Class 10th Card */}
            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-green-500"
              onClick={() => setSelectedLevel('CLASS_10')}
            >
              <CardContent className="p-0">
                <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg overflow-hidden">
                  {/* Classroom Image Placeholder - using the classroom image you provided */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-blue-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-br from-teal-300 to-blue-300 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-lg flex items-center justify-center">
                            <GraduationCap className="h-16 w-16" />
                          </div>
                          <p className="text-lg font-semibold">Classroom Environment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    Class 10th Quiz
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Choosing your stream after 10th grade. Get personalized guidance on Science, Commerce, or Arts streams based on your interests and aptitudes.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      <span>15-20 questions</span>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class 12th Card */}
            <Card 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-500"
              onClick={() => setSelectedLevel('CLASS_12')}
            >
              <CardContent className="p-0">
                <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-lg overflow-hidden">
                  {/* Library Image Placeholder - using the library image you provided */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-300 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-16 w-16" />
                          </div>
                          <p className="text-lg font-semibold">Library Study Space</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    Class 12th Quiz
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Preparing for college & entrance exams. Discover the best career paths, colleges, and courses that match your academic performance and interests.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      <span>20-25 questions</span>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-800">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 text-gray-600">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Interest Assessment</h4>
                  <p>Questions about your preferences and interests across different career areas using RIASEC theory.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Aptitude Test</h4>
                  <p>Numerical, verbal, logical, and spatial reasoning questions tailored to your class level.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Personalized Results</h4>
                  <p>Get career stream recommendations and college guidance based on your responses.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">AI-Ready Output</h4>
                  <p>Results in JSON format perfect for AI agents and further career counseling.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState 
          title="Failed to load quiz"
          description="There was an error loading the quiz. Please try again."
          action={
            <div className="space-y-4">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => setSelectedLevel(null)} variant="ghost">
                ← Back to Class Selection
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // Show no quiz available
  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle>No Quiz Available</CardTitle>
            <CardDescription>
              No active quiz found for {selectedLevel === 'CLASS_10' ? 'Class 10th' : 'Class 12th'}. Please try another level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setSelectedLevel(null)} variant="ghost">
              ← Back to Class Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show quiz card
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Back Button */}
        <Button 
          onClick={() => setSelectedLevel(null)} 
          variant="ghost" 
          className="mb-4"
        >
          ← Back to Class Selection
        </Button>

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
              <p>• <strong>AI Integration:</strong> Results will be formatted for easy integration with AI career counselors</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
