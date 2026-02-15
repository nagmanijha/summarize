import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import { processDocument } from "@/lib/documentai";
import { summarizeText } from "@/lib/gemini";
import { cleanText, getWordCount } from "@/lib/textCleaner";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filePath } = body;

        if (!filePath) {
            return NextResponse.json(
                { error: "No file path provided" },
                { status: 400 }
            );
        }

        // Verify file exists
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: "File not found. It may have been auto-deleted." },
                { status: 404 }
            );
        }

        // Step 1: Document AI OCR
        let ocrResult;
        try {
            ocrResult = await processDocument(filePath);
        } catch (error) {
            console.error("Document AI error:", error);
            return NextResponse.json(
                { error: "OCR processing failed. Please check your Document AI configuration." },
                { status: 500 }
            );
        }

        // Step 2: Clean text
        const cleanedText = cleanText(ocrResult.rawText);
        const wordCount = getWordCount(cleanedText);

        // Step 3: Gemini Summarization
        let summary;
        try {
            summary = await summarizeText(cleanedText);
        } catch (error) {
            console.error("Gemini error:", error);
            return NextResponse.json(
                { error: "AI summarization failed. Please check your Gemini API key." },
                { status: 500 }
            );
        }

        // Step 4: Clean up temp file
        try {
            fs.unlinkSync(filePath);
        } catch {
            // File may already be deleted, that's fine
        }

        // Calculate overall confidence
        const avgConfidence =
            ocrResult.pages.length > 0
                ? ocrResult.pages.reduce((sum, p) => sum + p.confidence, 0) /
                ocrResult.pages.length
                : 0;

        return NextResponse.json({
            rawText: ocrResult.rawText,
            cleanExtract: cleanedText,
            pages: ocrResult.pages,
            wordCount,
            confidence: Math.round(avgConfidence * 100) / 100,
            summary: {
                executiveSummary: summary.executiveSummary,
                bulletPoints: summary.bulletPoints,
                keyTopics: summary.keyTopics,
                entities: summary.entities,
            },
        });
    } catch (error) {
        console.error("Process error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred during processing" },
            { status: 500 }
        );
    }
}
