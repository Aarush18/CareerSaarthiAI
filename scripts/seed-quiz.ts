import { db } from "../src/db";
import { aptitudeQuizzes, quizQuestions } from "../src/db/quiz";

// RIASEC Interest Questions (Holland's Theory)
const riasecQuestions = [
  // Realistic (R) - Practical, hands-on, mechanical
  {
    text: "How much do you enjoy fixing or assembling mechanical things?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "R" as const,
    orderIndex: 1,
  },
  {
    text: "How interested are you in working with tools and machinery?",
    options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested"],
    topicTag: "R" as const,
    orderIndex: 2,
  },
  {
    text: "How much do you enjoy outdoor activities and physical work?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "R" as const,
    orderIndex: 3,
  },

  // Investigative (I) - Analytical, scientific, research
  {
    text: "How much do you enjoy solving science experiments or puzzles?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "I" as const,
    orderIndex: 4,
  },
  {
    text: "How interested are you in understanding how things work?",
    options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested"],
    topicTag: "I" as const,
    orderIndex: 5,
  },
  {
    text: "How much do you enjoy analyzing data and conducting research?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "I" as const,
    orderIndex: 6,
  },

  // Artistic (A) - Creative, expressive, innovative
  {
    text: "How much do you enjoy creating art, music, or writing?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "A" as const,
    orderIndex: 7,
  },
  {
    text: "How interested are you in expressing yourself creatively?",
    options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested"],
    topicTag: "A" as const,
    orderIndex: 8,
  },
  {
    text: "How much do you enjoy working with colors, designs, or artistic concepts?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "A" as const,
    orderIndex: 9,
  },

  // Social (S) - Helping, teaching, caring
  {
    text: "How much do you enjoy helping people with their problems?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "S" as const,
    orderIndex: 10,
  },
  {
    text: "How interested are you in teaching or mentoring others?",
    options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested"],
    topicTag: "S" as const,
    orderIndex: 11,
  },
  {
    text: "How much do you enjoy working in teams and collaborating?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "S" as const,
    orderIndex: 12,
  },

  // Enterprising (E) - Leading, persuading, managing
  {
    text: "How much do you enjoy leading teams and persuading others?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "E" as const,
    orderIndex: 13,
  },
  {
    text: "How interested are you in starting your own business or projects?",
    options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested"],
    topicTag: "E" as const,
    orderIndex: 14,
  },
  {
    text: "How much do you enjoy taking charge and making decisions?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "E" as const,
    orderIndex: 15,
  },

  // Conventional (C) - Organizing, following procedures, data
  {
    text: "How much do you enjoy organizing records and working with data?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "C" as const,
    orderIndex: 16,
  },
  {
    text: "How interested are you in following detailed procedures and systems?",
    options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested"],
    topicTag: "C" as const,
    orderIndex: 17,
  },
  {
    text: "How much do you enjoy working with numbers and maintaining accuracy?",
    options: ["Not at all", "A little", "Moderately", "Very much"],
    topicTag: "C" as const,
    orderIndex: 18,
  },
];

// Aptitude Questions (Objective with correct answers)
const aptitudeQuestions = [
  // Numerical Aptitude
  {
    text: "If a shirt costs ₹800 and is sold at a 25% discount, what is the selling price?",
    options: ["₹600", "₹650", "₹700", "₹750"],
    correctOptionIndex: 0, // ₹600
    topicTag: "numerical" as const,
    orderIndex: 19,
  },
  {
    text: "What is 15% of 240?",
    options: ["32", "36", "40", "44"],
    correctOptionIndex: 1, // 36
    topicTag: "numerical" as const,
    orderIndex: 20,
  },
  {
    text: "If 3x + 7 = 22, what is the value of x?",
    options: ["3", "4", "5", "6"],
    correctOptionIndex: 2, // 5
    topicTag: "numerical" as const,
    orderIndex: 21,
  },

  // Verbal Aptitude
  {
    text: "Choose the word that is most similar in meaning to 'ABUNDANT':",
    options: ["Scarce", "Plentiful", "Rare", "Limited"],
    correctOptionIndex: 1, // Plentiful
    topicTag: "verbal" as const,
    orderIndex: 22,
  },
  {
    text: "Complete the analogy: Book is to Library as Car is to:",
    options: ["Road", "Garage", "Driver", "Engine"],
    correctOptionIndex: 1, // Garage
    topicTag: "verbal" as const,
    orderIndex: 23,
  },
  {
    text: "Which word does not belong with the others?",
    options: ["Apple", "Orange", "Banana", "Carrot"],
    correctOptionIndex: 3, // Carrot (vegetable vs fruits)
    topicTag: "verbal" as const,
    orderIndex: 24,
  },

  // Logical Aptitude
  {
    text: "What comes next in the sequence: 2, 4, 8, 16, ?",
    options: ["20", "24", "32", "36"],
    correctOptionIndex: 2, // 32 (powers of 2)
    topicTag: "logical" as const,
    orderIndex: 25,
  },
  {
    text: "If all roses are flowers and some flowers are red, which statement is definitely true?",
    options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
    correctOptionIndex: 3, // Cannot be determined
    topicTag: "logical" as const,
    orderIndex: 26,
  },
  {
    text: "In a code, CAT is written as 3120. How is DOG written?",
    options: ["4157", "4156", "4158", "4159"],
    correctOptionIndex: 0, // 4157 (C=3, A=1, T=20; D=4, O=15, G=7)
    topicTag: "logical" as const,
    orderIndex: 27,
  },

  // Spatial Aptitude
  {
    text: "If you rotate a square 90 degrees clockwise, what does it look like?",
    options: ["Same as original", "Diamond shape", "Rectangle", "Different square"],
    correctOptionIndex: 0, // Same as original
    topicTag: "spatial" as const,
    orderIndex: 28,
  },
  {
    text: "Which shape has the most sides?",
    options: ["Triangle", "Square", "Pentagon", "Hexagon"],
    correctOptionIndex: 3, // Hexagon (6 sides)
    topicTag: "spatial" as const,
    orderIndex: 29,
  },
  {
    text: "If you fold a piece of paper in half and cut a triangle from the edge, what happens when you unfold it?",
    options: ["One triangle", "Two triangles", "One diamond", "Two diamonds"],
    correctOptionIndex: 1, // Two triangles
    topicTag: "spatial" as const,
    orderIndex: 30,
  },
];

async function seedQuiz() {
  try {
    console.log("🌱 Starting quiz seed...");

    // Create the main quiz
    const [quiz] = await db
      .insert(aptitudeQuizzes)
      .values({
        title: "Career Pathfinder Quiz",
        description: "Discover your ideal career path through interest and aptitude assessment",
        forLevel: "ANY",
        isActive: true,
      })
      .returning();

    console.log(`✅ Created quiz: ${quiz.title} (ID: ${quiz.id})`);

    // Insert RIASEC questions
    const riasecQuestionData = riasecQuestions.map((q) => ({
      quizId: quiz.id,
      orderIndex: q.orderIndex,
      text: q.text,
      options: q.options,
      correctOptionIndex: null, // Psychometric questions have no correct answer
      topicTag: q.topicTag,
      weight: 1,
    }));

    await db.insert(quizQuestions).values(riasecQuestionData);
    console.log(`✅ Inserted ${riasecQuestions.length} RIASEC questions`);

    // Insert aptitude questions
    const aptitudeQuestionData = aptitudeQuestions.map((q) => ({
      quizId: quiz.id,
      orderIndex: q.orderIndex,
      text: q.text,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      topicTag: q.topicTag,
      weight: 1,
    }));

    await db.insert(quizQuestions).values(aptitudeQuestionData);
    console.log(`✅ Inserted ${aptitudeQuestions.length} aptitude questions`);

    console.log("🎉 Quiz seeding completed successfully!");
    console.log(`📊 Total questions: ${riasecQuestions.length + aptitudeQuestions.length}`);
    console.log(`🎯 RIASEC questions: ${riasecQuestions.length}`);
    console.log(`🧠 Aptitude questions: ${aptitudeQuestions.length}`);

  } catch (error) {
    console.error("❌ Error seeding quiz:", error);
    throw error;
  }
}

// Run the seed function
if (require.main === module) {
  seedQuiz()
    .then(() => {
      console.log("✅ Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

export { seedQuiz };
