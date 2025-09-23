import { NextResponse } from "next/server";
import quizData from "@/data/quiz-questionnaire.json";

export async function GET() {
  return NextResponse.json(quizData);
}


