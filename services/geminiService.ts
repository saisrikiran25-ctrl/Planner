
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Settings, ScheduleData } from '../types';

// Get API key from localStorage (set by user at runtime)
const getApiKey = (): string | null => {
  return localStorage.getItem('GOOGLE_AI_API_KEY');
};

// Cache for AI client to avoid recreating on every call
let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

// Initialize AI client with API key from localStorage
const getAIClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API key not found. Please configure your Google AI API key.");
  }
  
  // Return cached client if API key hasn't changed
  if (cachedClient && cachedApiKey === apiKey) {
    return cachedClient;
  }
  
  // Create new client and cache it
  cachedClient = new GoogleGenAI({ apiKey });
  cachedApiKey = apiKey;
  return cachedClient;
};

function getScheduleSchema(workingDays: string[]) {
  const dayProperties: { [key: string]: object } = {};
  
  workingDays.forEach(day => {
      dayProperties[day] = {
        type: Type.ARRAY,
        description: `An array of course names for ${day}. The length of this array must exactly match the 'classes per day' setting. Use a hyphen '-' for any empty class slot.`,
        items: { type: Type.STRING }
      };
  });

  return {
    type: Type.OBJECT,
    properties: {
      schedule: {
        type: Type.OBJECT,
        description: `The complete weekly schedule object. It is MANDATORY for this object to contain a key for every specified working day: ${workingDays.join(', ')}.`,
        properties: dayProperties,
        required: workingDays, // This programmatically enforces the presence of all working days.
      },
      reasoning: {
        type: Type.STRING,
        description: "A detailed, step-by-step explanation of how the schedule was constructed, how it meets all constraints, and how classes were distributed."
      }
    },
    required: ['schedule', 'reasoning']
  };
}


function buildPrompt(courses: Course[], settings: Settings, additionalConstraints: string): string {
  const courseList = courses.map(c => `- ${c.name}: ${c.classesPerWeek} classes per week`).join('\n');
  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    .filter(day => !settings.holidays.includes(day))
    .join(', ');

  const breaksDescription = [
    settings.shortBreakAfterClass > 0 && `- Short (Snacks) Break: ${settings.shortBreakDuration} minutes, occurring after class number ${settings.shortBreakAfterClass}.`,
    settings.longBreakAfterClass > 0 && `- Long (Lunch) Break: ${settings.longBreakDuration} minutes, occurring after class number ${settings.longBreakAfterClass}.`
  ].filter(Boolean).join('\n          ');

  return `
    You are an elite school scheduling AI. Your primary function is to generate a comprehensive, balanced, and valid weekly class schedule based on the strict requirements provided.

    **Core Directives (Non-negotiable):**

    1.  **Full Week Utilization:** You MUST generate a schedule for every single one of the specified working days: **${workingDays}**. A valid schedule uses all available working days. Leaving a working day empty when classes can be scheduled there is an invalid output.

    2.  **Balanced Class Distribution:** Distribute the total number of classes as evenly as possible across all working days. Do not cluster classes at the start of the week. Aim for a similar number of classes each day.

    3.  **Strict Quota Adherence:** The final schedule's total class count for each course MUST perfectly match the numbers provided below. No more, no less.

    **Schedule Requirements:**

    1.  **Courses and Weekly Frequency:**
        ${courseList}

    2.  **Daily Structure:**
        - School starts at: ${settings.startTime}
        - Total classes per day: ${settings.classesPerDay}
        - Class duration: ${settings.classDuration} minutes
        - Working Days: ${workingDays}
        - Holidays (No classes): ${settings.holidays.join(', ')}
        - Gaps and Breaks:
          - Standard gap between classes: ${settings.gapBetweenClasses > 0 ? `${settings.gapBetweenClasses} minutes` : 'None'}
          ${breaksDescription ? `- Special Breaks:\n          ${breaksDescription}` : '- No scheduled long/short breaks.'}

    3.  **Additional Constraints to Follow:**
        ${additionalConstraints}

    **Output Format Instructions:**
    - You MUST adhere strictly to the provided JSON schema. The 'schedule' object MUST contain keys for all working days (${workingDays}).
    - The schedule array for each day should ONLY contain the names of the courses/subjects. Use "-" for empty slots.
    - If a constraint is impossible to meet, state this clearly in the reasoning field, but still provide the best possible schedule that follows all Core Directives.
  `;
}

export const generateSchedule = async (
  courses: Course[],
  settings: Settings,
  additionalConstraints: string
): Promise<ScheduleData | null> => {
  const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    .filter(day => !settings.holidays.includes(day));

  if (workingDays.length === 0) {
    return {
        schedule: {},
        reasoning: 'No working days selected. Cannot generate a schedule.'
    };
  }

  const prompt = buildPrompt(courses, settings, additionalConstraints);
  const dynamicScheduleSchema = getScheduleSchema(workingDays);

  try {
    const ai = getAIClient(); // Get fresh client with current API key
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dynamicScheduleSchema,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const text = response.text;
    if (!text) {
        console.error("Gemini API returned an empty response.");
        return null;
    }

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data: ScheduleData = JSON.parse(cleanedText);
    return data;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('responseSchema')) {
        throw new Error('The AI failed to generate a schedule that matches the required structure. Please try simplifying your constraints.');
    }
    throw error;
  }
};
