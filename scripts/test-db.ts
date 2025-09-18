import { db } from "../src/db";
import { aptitudeQuizzes } from "../src/db/quiz";

async function testDatabase() {
  try {
    console.log("🔍 Testing database connection...");
    
    // Try to query the quiz table
    const quizzes = await db.select().from(aptitudeQuizzes).limit(1);
    console.log("✅ Database connection successful!");
    console.log(`📊 Found ${quizzes.length} quizzes in database`);
    
    if (quizzes.length === 0) {
      console.log("ℹ️  No quizzes found. You may need to run: npm run db:seed-quiz");
    }
    
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log("💡 You may need to run: npm run db:push");
  }
}

testDatabase()
  .then(() => {
    console.log("✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
