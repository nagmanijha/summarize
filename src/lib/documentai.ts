import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import * as fs from "fs";
import * as path from "path";

interface PageData {
    pageNumber: number;
    text: string;
    confidence: number;
}

interface DocumentAIResult {
    rawText: string;
    pages: PageData[];
}

export async function processDocument(
    filePath: string
): Promise<DocumentAIResult> {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_LOCATION || "us";
    const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

    if (!projectId || !processorId) {
        throw new Error(
            "Missing GOOGLE_PROJECT_ID or DOCUMENT_AI_PROCESSOR_ID environment variables"
        );
    }

    const client = new DocumentProcessorServiceClient();
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const fileBuffer = fs.readFileSync(filePath);
    const encodedContent = fileBuffer.toString("base64");

    const request = {
        name,
        rawDocument: {
            content: encodedContent,
            mimeType: "application/pdf",
        },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    if (!document || !document.text) {
        throw new Error("Document AI returned empty result");
    }

    const rawText = document.text;
    const pages: PageData[] = [];

    if (document.pages) {
        for (let i = 0; i < document.pages.length; i++) {
            const page = document.pages[i];
            let pageText = "";
            let totalConfidence = 0;
            let blockCount = 0;

            if (page.blocks) {
                for (const block of page.blocks) {
                    if (block.layout?.textAnchor?.textSegments) {
                        for (const segment of block.layout.textAnchor.textSegments) {
                            const startIndex = Number(segment.startIndex || 0);
                            const endIndex = Number(segment.endIndex || 0);
                            pageText += rawText.substring(startIndex, endIndex);
                        }
                    }
                    if (block.layout?.confidence) {
                        totalConfidence += block.layout.confidence;
                        blockCount++;
                    }
                }
            }

            // If blocks didn't work, try paragraphs
            if (!pageText && page.paragraphs) {
                for (const paragraph of page.paragraphs) {
                    if (paragraph.layout?.textAnchor?.textSegments) {
                        for (const segment of paragraph.layout.textAnchor.textSegments) {
                            const startIndex = Number(segment.startIndex || 0);
                            const endIndex = Number(segment.endIndex || 0);
                            pageText += rawText.substring(startIndex, endIndex);
                        }
                    }
                    if (paragraph.layout?.confidence) {
                        totalConfidence += paragraph.layout.confidence;
                        blockCount++;
                    }
                }
            }

            pages.push({
                pageNumber: i + 1,
                text: pageText || `[Page ${i + 1} text extraction unavailable]`,
                confidence:
                    blockCount > 0
                        ? Math.round((totalConfidence / blockCount) * 100) / 100
                        : 0,
            });
        }
    }

    return { rawText, pages };
}
