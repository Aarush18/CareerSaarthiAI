"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ChevronLeft, ChevronRight } from "lucide-react";

type JSONQuestion = {
  id: number;
  question: string;
  type: "mcq" | "open";
  options?: Array<{ text: string; score: Record<string, number> }>;
};

interface QuestionStepperProps {
  questions: JSONQuestion[];
  onComplete: (answers: Record<string, number | string>) => void;
  isLoading?: boolean;
}

export function JsonQuestionStepper({ questions, onComplete, isLoading = false }: QuestionStepperProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleOptionChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [`q-${currentQuestion.id}`]: parseInt(value) }));
  };

  const handleOpenChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [`q-${currentQuestion.id}`]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const hasAnswer = answers[`q-${currentQuestion.id}`] !== undefined && answers[`q-${currentQuestion.id}`] !== "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">EduGuideAI</CardTitle>
            <Brain className="h-8 w-8 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="bg-green-600 text-white p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            </div>

            {currentQuestion.type === "mcq" ? (
              <RadioGroup
                value={(answers[`q-${currentQuestion.id}`] as number | undefined)?.toString()}
                onValueChange={handleOptionChange}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} className="border-green-600 text-green-600" />
                    <Label htmlFor={`option-${index}`} className="flex-1 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                value={(answers[`q-${currentQuestion.id}`] as string | undefined) || ""}
                onChange={(e) => handleOpenChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px]"
              />
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!hasAnswer || isLoading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              {currentQuestionIndex === questions.length - 1 ? (isLoading ? "Submitting..." : "Submit Quiz") : (<>
                Next
                <ChevronRight className="h-4 w-4" />
              </>)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


