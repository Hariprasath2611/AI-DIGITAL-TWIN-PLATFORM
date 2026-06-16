import { googleGenAI, isGeminiConfigured } from '../config/gemini';
import User from '../models/User';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// Helper to query Gemini
export const askGemini = async (prompt: string, systemInstruction?: string): Promise<string> => {
  if (isGeminiConfigured && googleGenAI) {
    try {
      const response = await googleGenAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined
      });
      if (response.text) {
        return response.text.trim();
      }
    } catch (error) {
      console.error('[AI Service] Gemini content generation error:', error);
    }
  }

  // Local fallback response generator
  return getMockAIResponse(prompt);
};

// Main response generator for Chat (incorporating retrieved RAG context)
export const generateChatResponse = async (
  userId: string,
  messages: Message[],
  contextDocs: string[]
): Promise<string> => {
  const user = await User.findOne({ firebaseUid: userId });
  const writingStyle = user?.writingStyleProfile;
  const displayName = user?.displayName || 'The user';

  const lastMessage = messages[messages.length - 1]?.text || '';

  const contextText = contextDocs.length > 0 
    ? `Here is the relevant factual context retrieved from ${displayName}'s knowledge base:\n${contextDocs.join('\n---\n')}`
    : `No specific background documents found for this query. Use general knowledge about ${displayName}.`;

  const systemInstruction = `You are the AI Digital Twin (or personal assistant) of ${displayName}.
Your goal is to answer queries about ${displayName}'s career, skills, projects, achievements, and experiences.
Represent ${displayName} professionally, accurately, and in an engaging tone.
If the visitor asks something outside of professional scope, answer politely.

${contextText}

Tone & Writing Style Guide:
- Tone: ${writingStyle?.tone || 'Professional, informative, and engaging'}
- Typical Vocabulary: ${writingStyle?.vocabulary?.join(', ') || 'efficient, scalable, modern'}
- Style patterns: ${writingStyle?.patterns?.join('; ') || 'Starts with a hook; Uses bullet points'}`;

  // Formulate chat context
  const chatHistoryPrompt = messages.map(m => `${m.sender === 'user' ? 'Visitor' : 'AI Twin'}: ${m.text}`).join('\n');
  const fullPrompt = `${chatHistoryPrompt}\nAI Twin:`;

  return askGemini(fullPrompt, systemInstruction);
};

// Generates personal branding content (LinkedIn, Twitter, Resume, Bios)
export const generateBrandContent = async (
  userId: string,
  contentType: 'linkedin' | 'twitter' | 'bio' | 'resume_improvement',
  prompt: string
): Promise<string> => {
  const user = await User.findOne({ firebaseUid: userId });
  const writingStyle = user?.writingStyleProfile;
  const displayName = user?.displayName || 'the user';

  const systemInstruction = `You are a professional brand builder assistant. You write high-performing social media content, bios, and resume updates.
Adapt perfectly to this writing style:
- Tone: ${writingStyle?.tone || 'Engaging and authoritative'}
- Vocabulary: ${writingStyle?.vocabulary?.join(', ') || 'innovative, strategy, impact'}
- Writing patterns: ${writingStyle?.patterns?.join('; ') || 'Hook, Story, Call to Action'}`;

  const fullPrompt = `Generate a ${contentType} content for ${displayName} based on the request: "${prompt}". Make sure it is polished, modern, and ready to publish.`;

  return askGemini(fullPrompt, systemInstruction);
};

// Generates feedback for mock recruiter interviews
export const generateMockRecruiterFeedback = async (
  role: string,
  messages: Message[]
): Promise<{
  rating: number;
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  suggestedLearningPaths: string[];
  transcriptFeedback: string;
}> => {
  const transcript = messages.map(m => `${m.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}`).join('\n');
  const prompt = `Review this technical/behavioral interview transcript for the role of "${role}":\n\n${transcript}\n\nProvide a detailed assessment. You MUST respond with a valid JSON block containing:
{
  "rating": number (1-5),
  "score": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "improvements": string[],
  "suggestedLearningPaths": string[],
  "transcriptFeedback": string (overall review text)
}`;

  const aiResponse = await askGemini(prompt, "You are a senior recruiter and technical interviewer. Always output response as a clean JSON object.");

  try {
    // Extract JSON block if surrounded by markdown code blocks
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(aiResponse);
  } catch (e) {
    // If parsing fails or we are in mock mode, return structured mock evaluation
    const score = Math.floor(65 + Math.random() * 30);
    const rating = Math.floor(score / 20);
    return {
      rating,
      score,
      strengths: [
        `Good communication in explaining the core challenges of ${role}`,
        'Demonstrates structured problem-solving skills',
        'Familiar with modern architecture paradigms'
      ],
      weaknesses: [
        'Could elaborate more on scalability constraints and unit testing',
        'Some answers were brief; needs deeper architectural descriptions'
      ],
      improvements: [
        'Practice system design mock interviews focusing on load balancing',
        'Elaborate on database indexing and caching strategy when describing past projects'
      ],
      suggestedLearningPaths: [
        'System Design Primer course',
        'Advanced TypeScript and design patterns study'
      ],
      transcriptFeedback: `Strong performance overall. The candidate demonstrated solid competency for a ${role} position. By adding more details regarding project optimizations and automated workflows, they will be extremely competitive.`
    };
  }
};

// Generates Github analysis report
export const generateGithubReport = async (repos: any[]): Promise<string> => {
  const repoSummary = repos.map(r => `- ${r.name}: ${r.description || 'No description'} (Language: ${r.language || 'JS'}, Stars: ${r.stargazers_count || 0})`).join('\n');
  const prompt = `Analyze this list of GitHub repositories and write a technical strength report outlining key technologies, development focus, and areas of expertise:\n\n${repoSummary}`;
  
  return askGemini(prompt, "You are an expert technical director auditing code portfolios.");
};

// Generates LinkedIn analysis report
export const generateLinkedInReport = async (profileData: any): Promise<string> => {
  const prompt = `Analyze this profile overview and suggest missing skills, resume enhancements, and networking paths:\n\n${JSON.stringify(profileData)}`;
  return askGemini(prompt, "You are a senior career advisor optimizing profiles for executive recruiting.");
};

// Fallback Mock AI content generator
const getMockAIResponse = (prompt: string): string => {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('linkedin') || lower.includes('post')) {
    return `🚀 **Supercharging Your Development Workflow**

Just completed a deep-dive analysis on building scalable micro-frontends! Here are the 3 lessons learned:
1️⃣ **Modular Bundling**: Using module federation yields 40% faster bundle updates.
2️⃣ **Shared State**: Keep the global state footprint micro-sized to avoid cross-module coupling.
3️⃣ **Style Isolation**: Shadow DOM or scoped styling is non-negotiable.

How are you scaling your frontend architectures this year? Let's discuss! 👇

#webdev #reactjs #systemdesign #microfrontends`;
  }

  if (lower.includes('twitter') || lower.includes('tweet')) {
    return `1/ Micro-frontends can either be a superpower or a maintenance nightmare. Here is how to keep them in check: 🧵\n\n2/ Build isolated build pipelines. If a change in Repo A requires rebuilding Repo B, it's a monolith in disguise.\n\n3/ Standardize on common design tokens, but let teams choose their runtime stack. Flexiblity is the ultimate goal.`;
  }

  if (lower.includes('explain') || lower.includes('project') || lower.includes('portfolio')) {
    return `Here is a breakdown of the key project:
- **Architecture**: Powered by a robust React + TypeScript client communicating with a Node.js/Express REST microservice.
- **Data & Caching**: Utilizes MongoDB for primary records, combined with smart caching mechanisms.
- **Key Achievements**:
  - Engineered modular components that reduced page load times by 30%.
  - Fully integrated Socket.io for instantaneous bidirectional events.
  - Implemented secure JWT role validations protecting administrative panels.`;
  }

  if (lower.includes('github') || lower.includes('repository')) {
    return `### 📊 GitHub Codebase Audit & Insights
- **Primary Languages**: TypeScript (55%), JavaScript (35%), HTML/CSS (10%).
- **Code Hygiene**: Highly organized structure with separated services, controllers, and schemas.
- **Architectural Strengths**: Strong encapsulation of logic, robust input validation, and clean error boundaries.
- **Recommendations**: Increase unit test coverage (currently estimated around 45%) and configure automated CI/CD pipeline triggers.`;
  }

  return `I have reviewed the profile and knowledge records. Based on your query, here is the information:
  
- **Core Strengths**: Full-stack design, AI model prompt optimization, and modular UI engineering.
- **Primary Stack**: React, TypeScript, Node.js, Express, and MongoDB.
- **Core Value**: Builds enterprise-grade web applications focusing heavily on sleek dark theme aesthetics, glassmorphic interfaces, and smooth user micro-animations.

Is there a specific project, skill, or experience you would like me to detail further?`;
};
