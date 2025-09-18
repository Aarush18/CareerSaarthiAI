// Mock database for development when DATABASE_URL is not set
export const mockQuiz = {
  id: "mock-quiz-1",
  title: "Career Pathfinder Quiz",
  description: "Discover your ideal career path through our comprehensive interest and aptitude assessment",
  forLevel: "ANY" as const,
  questions: [
    {
      id: "q1",
      orderIndex: 1,
      text: "How much do you enjoy fixing or assembling mechanical things?",
      options: ["Not at all", "A little", "Moderately", "Very much"],
      topicTag: "R",
      weight: 1,
    },
    {
      id: "q2", 
      orderIndex: 2,
      text: "How much do you enjoy solving science experiments or puzzles?",
      options: ["Not at all", "A little", "Moderately", "Very much"],
      topicTag: "I",
      weight: 1,
    },
    {
      id: "q3",
      orderIndex: 3,
      text: "How much do you enjoy creating art, music, or writing?",
      options: ["Not at all", "A little", "Moderately", "Very much"],
      topicTag: "A",
      weight: 1,
    },
    {
      id: "q4",
      orderIndex: 4,
      text: "How much do you enjoy helping people with their problems?",
      options: ["Not at all", "A little", "Moderately", "Very much"],
      topicTag: "S",
      weight: 1,
    },
    {
      id: "q5",
      orderIndex: 5,
      text: "How much do you enjoy leading teams and persuading others?",
      options: ["Not at all", "A little", "Moderately", "Very much"],
      topicTag: "E",
      weight: 1,
    },
    {
      id: "q6",
      orderIndex: 6,
      text: "How much do you enjoy organizing records and working with data?",
      options: ["Not at all", "A little", "Moderately", "Very much"],
      topicTag: "C",
      weight: 1,
    },
  ]
};
