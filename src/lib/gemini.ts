import { GoogleGenerativeAI } from "@google/generative-ai";

interface SummaryResult {
    executiveSummary: string;
    bulletPoints: string[];
    keyTopics: string[];
    entities: {
        dates: string[];
        people: string[];
        organizations: string[];
        amounts: string[];
    };
}

export async function summarizeText(text: string): Promise<SummaryResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert academic assistant.

Analyze the following OCR extracted text from handwritten notes.

Tasks:
1. Clean formatting errors and OCR noise.
2. Extract key ideas and important information.
3. Create a structured analysis.

IMPORTANT: Return ONLY valid JSON with this exact structure, no markdown formatting:
{
  "executiveSummary": "A comprehensive summary of 100-150 words covering the main points",
  "bulletPoints": ["Key point 1", "Key point 2", "Key point 3", "..."],
  "keyTopics": ["Topic1", "Topic2", "Topic3", "..."],
  "entities": {
    "dates": ["any dates mentioned"],
    "people": ["any names mentioned"],
    "organizations": ["any organizations mentioned"],
    "amounts": ["any monetary amounts or percentages mentioned"]
  }
}

Text:
"""
${text}
"""`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Parse JSON from response, handling potential markdown wrapping
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
    }

    try {
        const parsed = JSON.parse(jsonStr);
        return {
            executiveSummary: parsed.executiveSummary || "",
            bulletPoints: parsed.bulletPoints || [],
            keyTopics: parsed.keyTopics || [],
            entities: {
                dates: parsed.entities?.dates || [],
                people: parsed.entities?.people || [],
                organizations: parsed.entities?.organizations || [],
                amounts: parsed.entities?.amounts || [],
            },
        };
    } catch {
        // If JSON parsing fails, create a basic summary
        return {
            executiveSummary: responseText.substring(0, 500),
            bulletPoints: responseText
                .split("\n")
                .filter((l) => l.trim().startsWith("-") || l.trim().startsWith("•"))
                .map((l) => l.replace(/^[-•]\s*/, "").trim())
                .filter(Boolean),
            keyTopics: [],
            entities: { dates: [], people: [], organizations: [], amounts: [] },
        };
    }
}
