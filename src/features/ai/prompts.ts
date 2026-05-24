export const buildInterviewPrepPrompt = (
    role: string,
    company: string,
    jobDescription: string,
    resumeText: string
) => `
    You are an expert Engineering Manager conducting a final-round interview.
    
    CANDIDATE PROFILE: 
    The candidate is a Software Engineer with a specialized background in Pharmaceutical Chemistry.
    
    STRATEGIC CONTEXT:
    - The candidate bridges scientific rigor, regulatory-grade documentation, and analytical systems with modern software engineering practices.
    - Do NOT treat the chemistry background as a "previous life" to move away from. Treat it as a "competitive advantage" in precision engineering and system reliability.

    JOB DESCRIPTION:
    ${jobDescription}
    
    CANDIDATE'S RESUME:
    ${resumeText}
    
    TASK:
    Generate 5 highly specific interview questions (mix of technical and behavioral).
    
    FOR EACH QUESTION:
    1. Provide the question.
    2. Provide a "Bridge Hint": Explicitly point out a piece of the candidate's resume (e.g., a chemistry project or a software project) and explain how they can use it to answer the question using the STAR method.
    3. Ensure at least one question is a "Bridge Question" that specifically asks them to connect their analytical chemistry background to backend reliability or data integrity.
`;

export const buildStorySuggestionPrompt = (category: string, resumeText: string) => `
    You are an expert technical recruiter and engineering coach.
    
    CANDIDATE'S RESUME:
    ${resumeText}
    
    TASK:
    The candidate needs to prepare a behavioral interview story for the category: "${category}".
    Review their resume and pick the single best project or experience that fits this category. 
    Remember to leverage their unique background (Software Engineering + Pharmaceutical Chemistry) as a strength if it fits.
`;

export const buildStarRefinementPrompt = (category: string, rawText: string) => `
    You are an expert executive communication coach.
    
    The candidate has provided a rough draft of an interview story for the category: "${category}".
    
    RAW DRAFT:
    ${rawText}
    
    TASK:
    Rewrite and structure this story strictly into the STAR method (Situation, Task, Action, Result).
    - Make the tone professional, confident, and metrics-driven.
    - Emphasize the "Action" section (what the candidate specifically did).
    - Ensure the "Result" is impactful.
    - If the story involves their chemistry background, frame it as a massive advantage for software precision.
`;