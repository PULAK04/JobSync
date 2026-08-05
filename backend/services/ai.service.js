import Groq from "groq-sdk";
import { z } from "zod";
import PDFDocument from "pdfkit";
import { env } from "../config/env.js";

let groq;

const getGroqApiKey = () => String(process.env.GROQ_API_KEY || "").trim();

export const assertGroqConfigured = () => {
    const apiKey = getGroqApiKey();
    const looksLikePlaceholder = !apiKey || /replace_with|your_groq|xxxxxxxx/i.test(apiKey);

    if (looksLikePlaceholder) {
        const error = new Error("Groq is not configured. Add a valid GROQ_API_KEY in backend/.env and rebuild the backend container.");
        error.statusCode = 503;
        error.code = "GROQ_NOT_CONFIGURED";
        throw error;
    }

    return apiKey;
};

const getGroq = () => {
    const apiKey = assertGroqConfigured();
    groq ??= new Groq({ apiKey });
    return groq;
};

const normalizeGroqError = (error) => {
    const status = Number(error?.status || error?.statusCode);

    if (status === 401 || status === 403) {
        const mapped = new Error("Groq authentication failed. Check GROQ_API_KEY in backend/.env, then rebuild/restart the backend.");
        mapped.statusCode = 502;
        mapped.code = "GROQ_AUTH_FAILED";
        return mapped;
    }

    if (status === 429) {
        const mapped = new Error("Groq rate limit reached. Please wait briefly and try again.");
        mapped.statusCode = 503;
        mapped.code = "GROQ_RATE_LIMIT";
        return mapped;
    }

    if (status >= 400 && status < 500) {
        const mapped = new Error(error?.message || "Groq rejected the AI request");
        mapped.statusCode = 502;
        mapped.code = "GROQ_REQUEST_FAILED";
        return mapped;
    }

    return error;
};

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(z.string()),
    behavioralQuestions: z.array(z.string()),
    skillGaps: z.array(z.string()),
    preparationPlan: z.array(z.string()),
    title: z.string()
});

const resumePdfSchema = z.object({
    name: z.string(),
    title: z.string(),
    contact: z.object({
        email: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional()
    }).optional(),
    summary: z.string(),
    skills: z.array(z.string()),
    education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        duration: z.string().optional(),
        details: z.array(z.string()).optional()
    })),
    projects: z.array(z.object({
        name: z.string(),
        techStack: z.string().optional(),
        points: z.array(z.string())
    })),
    experience: z.array(z.object({
        role: z.string(),
        organization: z.string().optional(),
        duration: z.string().optional(),
        points: z.array(z.string())
    })),
    achievements: z.array(z.string()),
    certifications: z.array(z.string())
});

const interviewJsonSchema = {
    type: "object",
    additionalProperties: false,
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title"],
    properties: {
        matchScore: { type: "number", minimum: 0, maximum: 100 },
        technicalQuestions: { type: "array", items: { type: "string" } },
        behavioralQuestions: { type: "array", items: { type: "string" } },
        skillGaps: { type: "array", items: { type: "string" } },
        preparationPlan: { type: "array", items: { type: "string" } },
        title: { type: "string" }
    }
};

const resumeJsonSchema = {
    type: "object",
    additionalProperties: false,
    required: ["name", "title", "contact", "summary", "skills", "education", "projects", "experience", "achievements", "certifications"],
    properties: {
        name: { type: "string" },
        title: { type: "string" },
        contact: {
            type: "object",
            additionalProperties: false,
            required: ["email", "phone", "location", "linkedin", "github"],
            properties: {
                email: { type: "string" },
                phone: { type: "string" },
                location: { type: "string" },
                linkedin: { type: "string" },
                github: { type: "string" }
            }
        },
        summary: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        education: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["degree", "institution", "duration", "details"],
                properties: {
                    degree: { type: "string" },
                    institution: { type: "string" },
                    duration: { type: "string" },
                    details: { type: "array", items: { type: "string" } }
                }
            }
        },
        projects: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "techStack", "points"],
                properties: {
                    name: { type: "string" },
                    techStack: { type: "string" },
                    points: { type: "array", items: { type: "string" } }
                }
            }
        },
        experience: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["role", "organization", "duration", "points"],
                properties: {
                    role: { type: "string" },
                    organization: { type: "string" },
                    duration: { type: "string" },
                    points: { type: "array", items: { type: "string" } }
                }
            }
        },
        achievements: { type: "array", items: { type: "string" } },
        certifications: { type: "array", items: { type: "string" } }
    }
};

const parseJsonContent = (content) => {
    const clean = String(content || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
    if (!clean) throw new Error("Groq returned an empty response");
    return JSON.parse(clean);
};

const generateStructuredJson = async ({ prompt, schemaName, jsonSchema, validator }) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: env.groqModel,
            temperature: 0.2,
            messages: [{ role: "user", content: prompt }],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: schemaName,
                    strict: true,
                    schema: jsonSchema
                }
            }
        });

        return validator.parse(parseJsonContent(response.choices?.[0]?.message?.content));
    } catch (error) {
        throw normalizeGroqError(error);
    }
};

export const generateInterviewReport = async ({ jobTitle, resume, selfDescription, jobDescription }) => {
    const prompt = `
Generate a COMPLETE interview report.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT return explanations.
4. Every array item MUST be a STRING.
5. Follow the schema EXACTLY.
6. Strictly follow the given example format.

Example format:

{
  "matchScore": 85,
  "technicalQuestions": [
    "Explain the concept of Context API in React and how it can be used for state management.",
    "Explain the concept of Virtual DOM in React and how it improves performance."
  ],
  "behavioralQuestions": [
    "Tell me about a time when you had to work with a difficult team member and how you handled the situation.",
    "Tell me about a challenge you faced in your previous project and how you overcame it."
  ],
  "skillGaps": [
    "Familiarity with cloud service providers such as AWS, Azure, or GCP.",
    "Knowledge of containerization tools like Docker and Kubernetes."
  ],
  "preparationPlan": [
    "Day 1: Advanced Node.js and Asynchronous Patterns. Deep dive into Node.js internals including the event loop, promises, async/await and error handling.",
    "Day 2: System Design and Scalability. Focus on caching, load balancing, indexing and queue-based processing."
  ],
  "title": "${jobTitle}"
}

Generate:
- matchScore
- 8 technicalQuestions
- 8 behavioralQuestions
- 5 skillGaps
- 7 preparationPlan days with day number, focus and detailed tasks

Candidate Details:

Job Title:
${jobTitle}

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    return generateStructuredJson({
        prompt,
        schemaName: "jobsync_interview_report",
        jsonSchema: interviewJsonSchema,
        validator: interviewReportSchema
    });
};

export const generateResumePdf = async ({ jobTitle, resume, selfDescription, jobDescription }) => {
    const prompt = `
You are an expert ATS resume writer.

Generate an ATS-optimized resume tailored for the given job description.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT use triple backticks.
4. Do NOT invent fake companies, fake internships, fake jobs, fake degrees, fake certificates or fake achievements.
5. Use only the candidate's real resume data and self description.
6. Improve wording professionally.
7. Add job-relevant keywords from the job description naturally.
8. Make the resume sound human-written, not AI-generated.
9. Keep it suitable for a final-year engineering student.
10. Keep content concise and suitable for a 1-page or maximum 2-page resume.
11. Follow the schema exactly. Use empty strings or arrays when information is unavailable.

Candidate Details:

Target Job Title:
${jobTitle}

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}

Generate:
- name if available
- target title
- contact if available
- professional summary
- relevant skills
- education
- projects with strong ATS bullet points
- experience or positions of responsibility if available
- achievements if available
- certifications if available
`;

    const resumeData = await generateStructuredJson({
        prompt,
        schemaName: "jobsync_ats_resume",
        jsonSchema: resumeJsonSchema,
        validator: resumePdfSchema
    });

    return generatePdfUsingPdfKit(resumeData);
};

const checkPageBreak = (doc) => {
    if (doc.y > 740) doc.addPage();
};

const addSectionTitle = (doc, title) => {
    checkPageBreak(doc);
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111").text(title);
    doc.moveTo(45, doc.y + 3).lineTo(550, doc.y + 3).strokeColor("#888888").lineWidth(0.5).stroke();
    doc.moveDown(0.6);
};

const addBullet = (doc, text) => {
    if (!text) return;
    checkPageBreak(doc);
    doc.font("Helvetica").fontSize(10).fillColor("#111111").text(`• ${text}`, { indent: 12, lineGap: 2 });
};

const buildContactLine = (contact = {}) =>
    [contact.email, contact.phone, contact.location, contact.linkedin, contact.github].filter(Boolean).join(" | ");

const generatePdfUsingPdfKit = (resumeData) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 45 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#111111").text(resumeData.name || "Candidate Resume", { align: "center" });
    doc.moveDown(0.2).font("Helvetica").fontSize(11).fillColor("#333333").text(resumeData.title || "Software Developer", { align: "center" });

    const contactLine = buildContactLine(resumeData.contact);
    if (contactLine) doc.moveDown(0.3).font("Helvetica").fontSize(9).fillColor("#444444").text(contactLine, { align: "center" });
    doc.moveDown(1);

    if (resumeData.summary) {
        addSectionTitle(doc, "PROFESSIONAL SUMMARY");
        doc.font("Helvetica").fontSize(10).fillColor("#111111").text(resumeData.summary, { align: "justify", lineGap: 3 });
        doc.moveDown(0.8);
    }

    if (resumeData.skills.length) {
        addSectionTitle(doc, "TECHNICAL SKILLS");
        doc.font("Helvetica").fontSize(10).fillColor("#111111").text(resumeData.skills.join(" | "), { lineGap: 3 });
        doc.moveDown(0.8);
    }

    if (resumeData.education.length) {
        addSectionTitle(doc, "EDUCATION");
        resumeData.education.forEach((edu) => {
            checkPageBreak(doc);
            doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#111111").text(edu.degree);
            doc.font("Helvetica").fontSize(10).fillColor("#222222").text(`${edu.institution}${edu.duration ? ` | ${edu.duration}` : ""}`);
            edu.details?.forEach((detail) => addBullet(doc, detail));
            doc.moveDown(0.4);
        });
        doc.moveDown(0.4);
    }

    if (resumeData.projects.length) {
        addSectionTitle(doc, "PROJECTS");
        resumeData.projects.forEach((project) => {
            checkPageBreak(doc);
            doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#111111").text(project.name || "Project");
            if (project.techStack) doc.font("Helvetica-Oblique").fontSize(9.5).fillColor("#333333").text(`Tech Stack: ${project.techStack}`);
            project.points.forEach((point) => addBullet(doc, point));
            doc.moveDown(0.5);
        });
    }

    if (resumeData.experience.length) {
        addSectionTitle(doc, "EXPERIENCE / RESPONSIBILITIES");
        resumeData.experience.forEach((exp) => {
            checkPageBreak(doc);
            doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#111111").text(`${exp.role}${exp.organization ? ` - ${exp.organization}` : ""}${exp.duration ? ` | ${exp.duration}` : ""}`);
            exp.points.forEach((point) => addBullet(doc, point));
            doc.moveDown(0.5);
        });
    }

    if (resumeData.achievements.length) {
        addSectionTitle(doc, "ACHIEVEMENTS");
        resumeData.achievements.forEach((item) => addBullet(doc, item));
        doc.moveDown(0.5);
    }

    if (resumeData.certifications.length) {
        addSectionTitle(doc, "CERTIFICATIONS");
        resumeData.certifications.forEach((item) => addBullet(doc, item));
    }

    doc.end();
});
