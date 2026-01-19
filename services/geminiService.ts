
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedQuestion } from "../types";

const SYSTEM_INSTRUCTION = `You are a structured extraction engine.
Input: Plain text containing quiz results from an AZ-104 practice quiz.
Each question may include the question text, the correct answer, the user’s selected answer, and possibly explanation details.

Task:
1) Parse the input and extract EVERY question that was answered correctly.
2) For each correct item, extract:
   • A concise question identifier or summary
   • The correct answer
   • Any explanation provided (if present)
3) Tag each extracted item with the specified AZ-104 domain.
   • Use the domain provided in the user prompt.
   • Do NOT infer domains from content — use the provided one.
4) Output the results as a clean JSON list.

Constraints:
- Include ALL correct answers present in the input.
- Do NOT omit any question you identify as correct.
- If explanation text is missing, use an empty string for that field.
- Do NOT perform analysis, analogies, or summarization beyond extraction.`;

export const extractCorrectAnswers = async (
  quizText: string,
  domain: string
): Promise<ExtractedQuestion[]> => {
  // Initialize Gemini API with the required parameter format and direct environment variable access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Domain: ${domain}\n\nQuiz Results Text:\n${quizText}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question_summary: { type: Type.STRING },
            correct_answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            domain: { type: Type.STRING },
          },
          required: ["question_summary", "correct_answer", "explanation", "domain"],
        },
      },
    },
  });

  // Access text output using the .text property of GenerateContentResponse as per guidelines
  const text = response.text || "[]";
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Invalid response format from AI engine.");
  }
};
