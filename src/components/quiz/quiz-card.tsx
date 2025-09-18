"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, BookOpen, Search } from "lucide-react";
import Link from "next/link";

interface QuizCardProps {
  title: string;
  description?: string;
  forLevel: string;
  questionCount: number;
  quizId: string;
}

export function QuizCard({ title, description, forLevel, questionCount, quizId }: QuizCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-white" />
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {forLevel}
          </Badge>
          <span className="text-sm text-green-100">{questionCount} questions</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search/CTA Bar */}
        <div className="bg-white/10 rounded-lg p-4 flex items-center gap-3">
          <Search className="h-5 w-5 text-white" />
          <span className="text-white font-medium">Find Your Best Career Path</span>
        </div>
        
        {/* Description */}
        <p className="text-green-100 text-sm leading-relaxed">
          {description || "Answer a few questions to get your personalized roadmap"}
        </p>
        
        {/* Books Icon */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 bg-blue-500 rounded-sm"></div>
            <div className="w-6 h-6 bg-orange-500 rounded-sm"></div>
            <div className="w-6 h-6 bg-purple-500 rounded-sm"></div>
          </div>
        </div>
        
        {/* Start Quiz Button */}
        <div className="pt-2">
          <Button 
            asChild 
            className="w-full bg-white text-green-700 hover:bg-green-50 font-semibold py-3 rounded-lg"
          >
            <Link href={`/quiz/take?quizId=${quizId}`}>
              START QUIZ
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
