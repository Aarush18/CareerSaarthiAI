# Quiz System Documentation

## Overview

The quiz system provides class-specific career pathfinding assessments for Class 10th and Class 12th students. It uses the RIASEC (Holland's Theory) model to assess student interests and provide personalized career recommendations.

## Features

- **Class-specific quizzes**: Separate assessments for Class 10th (stream selection) and Class 12th (college preparation)
- **Interactive UI**: Beautiful card-based interface with background images
- **RIASEC Assessment**: Based on Holland's Theory of Career Choice
- **LLM Integration**: Structured JSON responses for AI-powered career guidance
- **Real-time Results**: Immediate feedback and recommendations

## Class Selection

### Class 10th Quiz
- **Purpose**: Help students choose their stream after 10th grade
- **Focus**: Science, Commerce, or Arts stream selection
- **Questions**: 8 questions covering academic interests and career preferences
- **Background**: Classroom environment with desks and windows

### Class 12th Quiz
- **Purpose**: Guide students in college and career preparation
- **Focus**: Higher education and career path selection
- **Questions**: 8 questions covering career goals and study preferences
- **Background**: Library environment with bookshelves

## JSON Response Format

The quiz system provides structured JSON responses optimized for LLM integration:

```json
{
  "studentProfile": {
    "classLevel": "CLASS_10" | "CLASS_12",
    "submissionId": "unique-submission-id",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "assessmentResults": {
    "riasecTraits": {
      "R": 3,  // Realistic (Hands-on, practical)
      "I": 2,  // Investigative (Analytical, scientific)
      "A": 1,  // Artistic (Creative, expressive)
      "S": 4,  // Social (Helping, teaching)
      "E": 2,  // Enterprising (Leading, persuading)
      "C": 3   // Conventional (Organizing, detail-oriented)
    },
    "dominantTraits": [
      { "trait": "S", "score": 4 },
      { "trait": "R", "score": 3 }
    ],
    "totalScore": 15
  },
  "careerRecommendations": {
    "suggestedStreams": ["SCIENCE", "ARTS"],
    "weakAreas": ["A", "I"],
    "reasoning": "Based on your RIASEC assessment, your strongest trait is Social (Helping, teaching) with a score of 4. Your creative and social inclinations indicate Arts stream could be ideal, offering subjects like History, Political Science, Psychology, and Literature. Areas for improvement include Artistic (Creative, expressive) and Investigative (Analytical, scientific). Consider developing these skills through extracurricular activities."
  },
  "nextSteps": [
    "Research the subjects offered in your recommended stream(s)",
    "Speak with teachers and counselors about stream selection",
    "Consider your long-term career goals when making the final decision",
    "Explore extracurricular activities related to your interests"
  ]
}
```

## RIASEC Traits

The system evaluates students across six personality types:

- **R - Realistic**: Hands-on, practical, mechanical
- **I - Investigative**: Analytical, scientific, research-oriented
- **A - Artistic**: Creative, expressive, imaginative
- **S - Social**: Helping, teaching, caring
- **E - Enterprising**: Leading, persuading, business-oriented
- **C - Conventional**: Organizing, detail-oriented, structured

## Stream Recommendations

Based on RIASEC scores, the system suggests:

- **SCIENCE**: High I (Investigative) or R (Realistic) scores
- **COMMERCE**: High C (Conventional) or E (Enterprising) scores
- **ARTS**: High A (Artistic) or S (Social) scores
- **VOCATIONAL**: Low scores across all traits

## API Endpoints

### Get Active Quiz
```typescript
trpc.quiz.getActiveQuiz.useQuery({
  forLevel: 'CLASS_10' | 'CLASS_12' | 'ANY'
})
```

### Submit Quiz
```typescript
trpc.quiz.submitQuiz.useMutation({
  quizId: string,
  answers: Array<{
    questionId: string,
    selectedOptionIndex: number
  }>
})
```

## Database Schema

### Quizzes Table
- `id`: Unique quiz identifier
- `title`: Quiz title
- `description`: Quiz description
- `forLevel`: Class level (CLASS_10, CLASS_12, ANY)
- `isActive`: Whether quiz is currently active

### Questions Table
- `id`: Unique question identifier
- `quizId`: Reference to quiz
- `orderIndex`: Question order
- `text`: Question text
- `options`: Array of answer options
- `topicTag`: RIASEC trait (R, I, A, S, E, C)
- `weight`: Question weight for scoring

### Submissions Table
- `id`: Unique submission identifier
- `quizId`: Reference to quiz
- `studentId`: Student identifier
- `score`: Objective score (if applicable)
- `rawTraits`: RIASEC trait scores
- `createdAt`: Submission timestamp

## Usage for LLM Integration

The structured JSON response is designed for easy consumption by LLM agents:

1. **Student Profile**: Basic information about the student and assessment
2. **Assessment Results**: Detailed RIASEC scores and analysis
3. **Career Recommendations**: Stream suggestions with reasoning
4. **Next Steps**: Actionable guidance for the student

This format allows LLM agents to:
- Generate personalized career advice
- Provide detailed explanations of recommendations
- Suggest specific courses and career paths
- Create study plans and preparation strategies

## Development

### Running the Quiz System
```bash
# Start the development server
npm run dev

# Seed the database with quiz data
npm run seed:quizzes
```

### Adding New Questions
1. Update the mock data in `src/db/mock.ts`
2. Run the seed script to update the database
3. Test the new questions in the UI

### Customizing Recommendations
Modify the `suggestStreams` and `generateReasoning` functions in `src/trpc/routers/quiz.ts` to adjust the recommendation logic.

## File Structure

```
src/
├── app/quiz/
│   ├── page.tsx              # Main quiz page with class selection
│   ├── take/page.tsx         # Quiz taking interface
│   └── result/page.tsx       # Results display
├── components/quiz/
│   ├── quiz-card.tsx         # Quiz card component
│   ├── question-stepper.tsx  # Question navigation
│   └── result-summary.tsx    # Results summary
├── db/
│   ├── quiz/                 # Quiz database schemas
│   └── mock.ts              # Mock quiz data
├── trpc/routers/
│   └── quiz.ts              # Quiz API endpoints
└── public/
    ├── classroom-bg.svg     # Class 10th background
    └── library-bg.svg       # Class 12th background
```
