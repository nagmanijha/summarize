import * as fs from "fs";

export async function processDocumentWithGemini(filePath: string, apiKey?: string) {
    // Prefer OpenRouter key, fallback to passed key if it's an OpenRouter key (which it isn't usually)
    const key = process.env.OPENROUTER_API_KEY || apiKey;
    if (!key) {
        throw new Error("Missing OPENROUTER_API_KEY");
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    const prompt = `Extract all text from this document. Preserve the layout as much as possible. 
    Return the result in JSON format:
    {
        "rawText": "The full extracted text...",
        "pages": [
            { "pageNumber": 1, "text": "Page 1 text..." }
        ]
    }
    If you cannot distinguish pages, just put everything in page 1.`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "ScribeAI"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-001",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:application/pdf;base64,${base64Data}`
                                }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";

        // Clean markdown
        const cleanedText = content.replace(/```json/g, "").replace(/```/g, "");

        try {
            const json = JSON.parse(cleanedText);
            return {
                rawText: json.rawText || content,
                pages: json.pages || [{ pageNumber: 1, text: json.rawText || content, confidence: 0.9 }]
            };
        } catch (e) {
            // Fallback if JSON parsing fails
            return {
                rawText: content,
                pages: [{ pageNumber: 1, text: content, confidence: 0.8 }]
            };
        }

    } catch (error: any) {
        console.error("Gemini/OpenRouter OCR Error:", error);
        throw error;
    }
}
