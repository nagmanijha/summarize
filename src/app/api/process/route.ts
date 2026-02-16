import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import { processDocument } from "@/lib/documentai";
import { processDocumentWithGemini } from "@/lib/gemini-ocr";
import { summarizeText } from "@/lib/gemini";
import { cleanText, getWordCount } from "@/lib/textCleaner";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filePath, ocrProvider = "gemini", docAiCreds } = body;

        if (!filePath) {
            return NextResponse.json(
                { error: "No file path provided" },
                { status: 400 }
            );
        }

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: "File not found. It may have been auto-deleted." },
                { status: 404 }
            );
        }

        // Step 1: OCR
        let ocrResult;
        try {
            if (ocrProvider === "documentai") {
                // Pass creds if provided, otherwise lib uses env vars
                ocrResult = await processDocument(filePath, docAiCreds);
            } else {
                ocrResult = await processDocumentWithGemini(filePath);
            }
        } catch (error: any) {
            console.error("OCR error:", error);
            return NextResponse.json(
                { error: `OCR failed: ${error.message}` },
                { status: 500 }
            );
        }

        // Step 2: Clean text
        const cleanedText = cleanText(ocrResult.rawText);
        const wordCount = getWordCount(cleanedText);

        // Step 3: Summarization
        let summary;
        try {
            summary = await summarizeText(cleanedText);
        } catch (error: any) {
            console.error("Gemini error:", error);
            return NextResponse.json(
                { error: `Summarization failed: ${error.message}` },
                { status: 500 }
            );
        }

        // Cleanup
        try { fs.unlinkSync(filePath); } catch { }

        // Calculate confidence (mock for Gemini if needed)
        const pages = ocrResult.pages || [];
        const avgConfidence = pages.length > 0
            ? pages.reduce((sum: number, p: any) => sum + (p.confidence || 0.9), 0) / pages.length
            : 0.9;

        return NextResponse.json({
            rawText: ocrResult.rawText,
            cleanExtract: cleanedText,
            pages: pages,
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
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
