// src/features/ai/prompts.ts

export const buildInterviewPrepPrompt = (
    role: string,
    company: string,
    jobDescription: string,
    resumeText: string
) => `
    You are an expert technical recruiter preparing a candidate for an interview for the role of ${role} at ${company}.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    CANDIDATE'S RESUME:
    ${resumeText}
    
    Generate 4-5 highly specific interview questions. Include a mix of technical and behavioral questions.
    For each question, provide a strategic "hint" on how the candidate should answer by connecting their specific past projects or experience from their resume to the requirements in the job description.
`;