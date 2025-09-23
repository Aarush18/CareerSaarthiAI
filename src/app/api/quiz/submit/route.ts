import { NextRequest, NextResponse } from "next/server";
import quizData from "@/data/quiz-questionnaire.json";
import { generateCareerFlowchart } from "@/server/services/geminiService";

type AnswersPayload = Record<string, number | string>;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function parseQuizClass(q: unknown): "10" | "12" | null {
  if (q === "10" || q === "12") return q;
  return null;
}

function sanitizeOpen(text: string): string {
  return text.trim().replace(/[\u0000-\u001F\u007F]/g, "");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  try {
    let payload: { quizClass?: unknown; answers?: unknown; meta?: unknown };
    payload = await req.json();

    const quizClass = parseQuizClass(payload.quizClass);
    const answers = payload.answers as AnswersPayload | undefined;
    if (!quizClass) throw new Error("quizClass must be '10' or '12'");
    if (!answers || typeof answers !== "object") throw new Error("answers must be an object");

    const quiz = (quizData as any).quizzes.find((q: any) => q.class === quizClass);
    if (!quiz) throw new Error("quizClass not found");

    const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const openAnswers: Array<{ id: number; question: string; answer: string }> = [];

    for (const q of quiz.questions) {
      const key = `q-${q.id}`;
      const val = (answers as any)[key];
      if (q.type === "mcq") {
        if (typeof val !== "number") continue;
        const option = q.options?.[val];
        if (option && option.score) {
          for (const code of Object.keys(scores)) {
            if (option.score[code]) scores[code] += option.score[code];
          }
        }
      } else if (q.type === "open") {
        if (typeof val === "string" && val.trim().length > 0) {
          openAnswers.push({ id: q.id, question: q.question, answer: sanitizeOpen(val) });
        }
      }
    }

    const ordered = Object.entries(scores).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      const order = ["R", "I", "A", "S", "E", "C"];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
    const topCodes = ordered.slice(0, 3).map(([c]) => c) as Array<"R" | "I" | "A" | "S" | "E" | "C">;

    const system = [
      "You are an expert Indian careers analyst and counselor working for EduGuideAI.",
      "Your job: Analyze RIASEC scores and open-ended answers to produce accurate Indian-context career recommendations.",
      "Hard constraints:",
      "- Only recommend careers aligned with TOP RIASEC codes (no contradictions).",
      "- Prefer 3–4 subFields; each subField must include 3–5 professions (not fewer) to maximize student optionality.",
      "- Include a balanced mix of entry-level, mid-level, and aspirational roles when relevant; clearly reflect this in whyRecommended/steps.",
      "- Tailor salary ranges to India (INR) and include demand with one-line justification.",
      "- Steps must be concrete: degrees, certifications/exams, internships, and starter projects.",
      "- Reflect student context: Class 10/12, streams/subjects, mobility, and finance when crafting whyRecommended and steps.",
      "- The JSON must be STRICTLY valid; no markdown or prose outside the JSON.",
      "Output MUST be valid JSON, strictly matching the following schema:",
      JSON.stringify({
        careerPathTitle: "string",
        summary: "string",
        topCodes: ["R", "I", "A", "S", "E", "C"],
        subFields: [
          {
            name: "string",
            description: "string",
            professions: [
              {
                name: "string",
                description: "string",
                whyRecommended: "string",
                stepsToEnter: ["string"],
                skills: ["string"],
                approxEarningsINRPerYear: { min: 120000, max: 2000000 },
                demandIndia: { level: "High|Medium|Low", justification: "string" },
              },
            ],
          },
        ],
        nextSteps: "string",
      }),
      "Cardinality requirements: Provide 3–4 subFields, each with 3–5 professions.",
      "Do not include any explanation, commentary, markdown, or text outside the JSON. If you cannot provide a required field, return { \"error\": \"...\" }.",
    ].join("\n");

    const user = [
      `Student profile:`,
      `- quizClass: ${quizClass}`,
      `- topCodes: ${JSON.stringify(topCodes)} and numeric scores: ${JSON.stringify(scores)}`,
      `- scoring.codes mapping: ${JSON.stringify(quiz.scoring.codes)}`,
      `- Open-ended answers (concise): ${JSON.stringify(openAnswers)}`,
      "\nTask: Based on this profile, return VALID JSON that matches the schema.",
      "Requirements:",
      "- 3–4 subFields; each with 3–5 professions aligned to top RIASEC codes.",
      "- For every profession include: whyRecommended (tie to scores/codes and context), stepsToEnter (3–6 succinct items: degrees, certifications/exams, internships, projects), skills (5–8 concise items), approxEarningsINRPerYear with realistic India range, demandIndia with a short Indian market justification.",
      "- Provide a 2–3 line nextSteps paragraph with immediate actions and resources (generic placeholders allowed).",
      "- No extra text; JSON only.",
    ].join("\n");

    // Debug: Log environment variables
    console.log("Environment check:", {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV
    });

    // Dev fallback: if no API key, return a structured mock to avoid 502 in development
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set — returning mock structured response");
      const mock = {
        careerPathTitle: topCodes.includes("I") ? "Engineering & Applied Sciences" : topCodes.includes("A") ? "Arts & Design" : "Career Path Recommendation",
        summary: `Your profile shows strengths in ${topCodes.join(", ")}. These align with the recommended subfields below.`,
        topCodes,
        subFields: [
          {
            name: topCodes.includes("I") ? "Computer Science & AI" : topCodes.includes("A") ? "Creative Arts" : "Foundational Skills",
            description: topCodes.includes("I") ? "Software, AI, Data Science" : topCodes.includes("A") ? "Visual design, media, and creative expression" : "General professional skills",
            professions: [
              {
                name: topCodes.includes("I") ? "Software Engineer" : topCodes.includes("A") ? "Graphic Designer" : "Project Coordinator",
                description: topCodes.includes("I") ? "Design and build software systems." : topCodes.includes("A") ? "Create visual designs for brands and media." : "Coordinate tasks and stakeholders for successful delivery.",
                whyRecommended: `Recommended due to top codes: ${topCodes.join(", ")}.`,
                stepsToEnter: topCodes.includes("I") ? ["Build CS fundamentals", "BTech CS or similar", "Internships & projects"] : topCodes.includes("A") ? ["Learn design tools (Figma/Photoshop)", "Build portfolio", "Freelance projects"] : ["Build fundamentals", "Degree/Diploma", "Internships & projects"],
                skills: topCodes.includes("I") ? ["Programming", "Data structures", "Algorithms", "System design", "Testing"] : topCodes.includes("A") ? ["Design tools", "Typography", "Color theory", "Branding", "UI/UX"] : ["Communication", "Organization", "Project management"],
                approxEarningsINRPerYear: topCodes.includes("I") ? { min: 300000, max: 2500000 } : topCodes.includes("A") ? { min: 200000, max: 1200000 } : { min: 250000, max: 800000 },
                demandIndia: { level: "High", justification: topCodes.includes("I") ? "Strong hiring across product and services companies." : topCodes.includes("A") ? "Growing demand in digital marketing and startups." : "Entry-level roles in many sectors." },
              },
              {
                name: topCodes.includes("I") ? "Data Analyst" : "Operations Analyst",
                description: topCodes.includes("I") ? "Analyze data to derive insights and dashboards." : "Optimize operations using metrics and processes.",
                whyRecommended: "Analytical inclination from your I/R scores.",
                stepsToEnter: ["Learn SQL & spreadsheets", "Do a data project", "Internships"],
                skills: ["SQL", "Excel", "Visualization"],
                approxEarningsINRPerYear: { min: 250000, max: 1500000 },
                demandIndia: { level: "High", justification: "Data roles are in demand across domains." },
              },
              {
                name: topCodes.includes("I") ? "DevOps Engineer" : topCodes.includes("A") ? "Digital Marketing Specialist" : "Business Analyst",
                description: topCodes.includes("I") ? "Manage deployment and infrastructure." : topCodes.includes("A") ? "Create and manage digital marketing campaigns." : "Bridge business needs and tech solutions.",
                whyRecommended: "Blend of technical and creative skills from top codes.",
                stepsToEnter: topCodes.includes("I") ? ["Learn cloud platforms (AWS/Azure)", "Docker/Kubernetes", "CI/CD pipelines"] : topCodes.includes("A") ? ["Learn digital marketing tools", "Content creation", "Analytics"] : ["Portfolio of 3 projects", "Learn tools (Figma/Tableau)", "Apply for internships"],
                skills: topCodes.includes("I") ? ["Cloud platforms", "Docker", "Kubernetes", "CI/CD", "Monitoring"] : topCodes.includes("A") ? ["Social media", "Content creation", "Analytics", "SEO", "Campaign management"] : ["Communication", "Research", "Prototyping"],
                approxEarningsINRPerYear: topCodes.includes("I") ? { min: 400000, max: 2000000 } : topCodes.includes("A") ? { min: 250000, max: 1000000 } : { min: 300000, max: 1800000 },
                demandIndia: { level: "High", justification: topCodes.includes("I") ? "DevOps roles in high demand across tech companies." : topCodes.includes("A") ? "Digital marketing growing with e-commerce boom." : "Steady opportunities in startups and enterprises." },
              },
              {
                name: topCodes.includes("I") ? "Machine Learning Engineer" : topCodes.includes("A") ? "Video Editor" : "Quality Analyst",
                description: topCodes.includes("I") ? "Build and deploy ML models." : topCodes.includes("A") ? "Edit and produce video content." : "Ensure software quality through testing.",
                whyRecommended: "Advanced technical skills from your profile.",
                stepsToEnter: topCodes.includes("I") ? ["Learn Python/R", "ML algorithms", "Deep learning frameworks"] : topCodes.includes("A") ? ["Learn Premiere Pro/After Effects", "Video projects", "Motion graphics"] : ["Learn testing tools", "Automation", "Quality processes"],
                skills: topCodes.includes("I") ? ["Python", "TensorFlow", "PyTorch", "Statistics", "MLOps"] : topCodes.includes("A") ? ["Premiere Pro", "After Effects", "Motion graphics", "Color grading", "Audio editing"] : ["Testing tools", "Automation", "Quality processes", "Bug tracking"],
                approxEarningsINRPerYear: topCodes.includes("I") ? { min: 500000, max: 3000000 } : topCodes.includes("A") ? { min: 200000, max: 800000 } : { min: 200000, max: 1000000 },
                demandIndia: { level: "High", justification: topCodes.includes("I") ? "ML roles highly sought after in AI companies." : topCodes.includes("A") ? "Video content creation booming with social media." : "Quality assurance essential in all software companies." },
              },
              {
                name: topCodes.includes("I") ? "Cybersecurity Analyst" : topCodes.includes("A") ? "Brand Designer" : "Technical Writer",
                description: topCodes.includes("I") ? "Protect systems from cyber threats." : topCodes.includes("A") ? "Develop brand identities and guidelines." : "Create technical documentation and content.",
                whyRecommended: "Specialized skills in high-demand areas.",
                stepsToEnter: topCodes.includes("I") ? ["Learn security fundamentals", "Certifications (CISSP)", "Penetration testing"] : topCodes.includes("A") ? ["Learn brand strategy", "Logo design", "Brand guidelines"] : ["Learn technical writing", "Documentation tools", "Subject matter expertise"],
                skills: topCodes.includes("I") ? ["Security tools", "Network security", "Incident response", "Risk assessment", "Compliance"] : topCodes.includes("A") ? ["Brand strategy", "Logo design", "Typography", "Color psychology", "Brand guidelines"] : ["Technical writing", "Documentation", "Communication", "Research", "Editing"],
                approxEarningsINRPerYear: topCodes.includes("I") ? { min: 400000, max: 2500000 } : topCodes.includes("A") ? { min: 300000, max: 1500000 } : { min: 250000, max: 1200000 },
                demandIndia: { level: "High", justification: topCodes.includes("I") ? "Cybersecurity critical for all organizations." : topCodes.includes("A") ? "Brand design essential for business growth." : "Technical writing needed across all industries." },
              },
            ],
          },
          {
            name: topCodes.includes("I") ? "Data Science & Analytics" : topCodes.includes("A") ? "Media & Communication" : "Business & Management",
            description: topCodes.includes("I") ? "Data-driven insights and business intelligence" : topCodes.includes("A") ? "Content creation and media production" : "Business operations and strategy",
            professions: [
              {
                name: topCodes.includes("I") ? "Business Intelligence Analyst" : topCodes.includes("A") ? "Content Creator" : "Operations Manager",
                description: topCodes.includes("I") ? "Create dashboards and business reports." : topCodes.includes("A") ? "Create engaging content for social media." : "Oversee daily business operations.",
                whyRecommended: "Strong analytical and communication skills.",
                stepsToEnter: topCodes.includes("I") ? ["Learn BI tools (Tableau/PowerBI)", "SQL expertise", "Business acumen"] : topCodes.includes("A") ? ["Content strategy", "Social media platforms", "Video/photo skills"] : ["Business degree", "Operations experience", "Leadership skills"],
                skills: topCodes.includes("I") ? ["Tableau", "PowerBI", "SQL", "Business analysis", "Data visualization"] : topCodes.includes("A") ? ["Content creation", "Social media", "Video editing", "Photography", "Storytelling"] : ["Operations management", "Leadership", "Process improvement", "Team management", "Strategic planning"],
                approxEarningsINRPerYear: topCodes.includes("I") ? { min: 350000, max: 1800000 } : topCodes.includes("A") ? { min: 200000, max: 1000000 } : { min: 400000, max: 2000000 },
                demandIndia: { level: "High", justification: topCodes.includes("I") ? "BI roles growing with data-driven decisions." : topCodes.includes("A") ? "Content creation essential for digital marketing." : "Operations managers needed in all industries." },
              },
              {
                name: topCodes.includes("I") ? "Research Scientist" : topCodes.includes("A") ? "Photographer" : "Project Manager",
                description: topCodes.includes("I") ? "Conduct research and publish findings." : topCodes.includes("A") ? "Capture professional photographs." : "Lead projects from start to finish.",
                whyRecommended: "Research and analytical capabilities.",
                stepsToEnter: topCodes.includes("I") ? ["PhD or Masters", "Research experience", "Publications"] : topCodes.includes("A") ? ["Photography skills", "Portfolio building", "Equipment investment"] : ["PMP certification", "Project experience", "Leadership training"],
                skills: topCodes.includes("I") ? ["Research methodology", "Statistical analysis", "Academic writing", "Critical thinking", "Data interpretation"] : topCodes.includes("A") ? ["Photography techniques", "Lighting", "Composition", "Post-processing", "Equipment knowledge"] : ["Project planning", "Risk management", "Team leadership", "Budget management", "Communication"],
                approxEarningsINRPerYear: topCodes.includes("I") ? { min: 600000, max: 2500000 } : topCodes.includes("A") ? { min: 150000, max: 800000 } : { min: 500000, max: 2500000 },
                demandIndia: { level: "Medium", justification: topCodes.includes("I") ? "Research positions in academia and R&D." : topCodes.includes("A") ? "Photography market varies by specialization." : "Project managers needed across all sectors." },
              },
              {
                name: topCodes.includes("I") ? "Product Manager" : topCodes.includes("A") ? "Web Designer" : "Consultant",
                description: topCodes.includes("I") ? "Lead product development and strategy." : topCodes.includes("A") ? "Design and develop websites." : "Provide expert advice to businesses.",
                whyRecommended: "Strategic thinking and leadership potential.",
                stepsToEnter: topCodes.includes("I") ? ["Product management courses", "Technical background", "User research"] : topCodes.includes("A") ? ["Web development skills", "Design tools", "Portfolio projects"] : ["Industry expertise", "Consulting experience", "Business development"],
                skills: topCodes.includes("I") ? ["Product strategy", "User research", "Data analysis", "Stakeholder management", "Roadmap planning"] : topCodes.includes("A") ? ["HTML/CSS", "JavaScript", "Design tools", "Responsive design", "User experience"] : ["Industry knowledge", "Problem solving", "Client management", "Strategic thinking", "Communication"],
                approxEarningsINRPerYear: topCodes.includes("I") ? { min: 600000, max: 3000000 } : topCodes.includes("A") ? { min: 250000, max: 1200000 } : { min: 400000, max: 3000000 },
                demandIndia: { level: "High", justification: topCodes.includes("I") ? "Product managers highly valued in tech." : topCodes.includes("A") ? "Web design essential for all businesses." : "Consultants needed across industries." },
              },
            ],
          },
        ],
        nextSteps: "Start with a small project and explore beginner-friendly resources in your top subfield.",
      };
      return NextResponse.json(mock, { status: 200 });
    }

    const result = await generateCareerFlowchart({ system, user });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("/api/quiz/submit error", { ip, err });
    // Final safety fallback: never 502 to client; return a conservative mock
    const mock = {
      careerPathTitle: "Career Path Recommendation",
      summary: "We generated a safe fallback recommendation based on your answers.",
      topCodes: ["I", "R", "A"],
      subFields: [
        {
          name: "General STEM Foundations",
          description: "Mathematics, computing, and analytical reasoning",
          professions: [
            {
              name: "Junior Analyst",
              description: "Assist with data and research tasks.",
              whyRecommended: "Matches analytical interests from your responses.",
              stepsToEnter: ["Learn spreadsheets & SQL", "Do a basic project", "Seek an internship"],
              skills: ["Data handling", "Communication"],
              approxEarningsINRPerYear: { min: 200000, max: 800000 },
              demandIndia: { level: "Medium", justification: "Entry-level roles in many sectors." },
            },
            {
              name: "Data Analyst",
              description: "Analyze datasets and build dashboards.",
              whyRecommended: "Strong I/R scores suggest data orientation.",
              stepsToEnter: ["SQL + Excel", "One portfolio project", "Internship"],
              skills: ["SQL", "Visualization", "Statistics"],
              approxEarningsINRPerYear: { min: 300000, max: 1200000 },
              demandIndia: { level: "High", justification: "Hiring across domains for analytics." },
            },
            {
              name: "Front-end Developer",
              description: "Build user interfaces for web applications.",
              whyRecommended: "Combines analytical and creative strengths.",
              stepsToEnter: ["HTML/CSS/JS", "Framework (React)", "Projects + internship"],
              skills: ["JavaScript", "UI", "Git"],
              approxEarningsINRPerYear: { min: 300000, max: 1500000 },
              demandIndia: { level: "High", justification: "Web roles consistently in demand." },
            }
          ],
        },
      ],
      nextSteps: "Explore beginner resources and build a small portfolio project.",
    };
    return NextResponse.json(mock, { status: 200, headers: { "x-fallback": "true" } });
  }
}


