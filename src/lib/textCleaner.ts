/**
 * Text cleaning utilities to prepare OCR output for Gemini summarization.
 */

export function cleanText(rawText: string): string {
    let text = rawText;

    // Remove duplicate line breaks (more than 2 consecutive)
    text = text.replace(/\n{3,}/g, "\n\n");

    // Merge broken words (word split across lines with hyphen)
    text = text.replace(/(\w)-\n(\w)/g, "$1$2");

    // Normalize spacing (multiple spaces to single)
    text = text.replace(/[^\S\n]{2,}/g, " ");

    // Remove common OCR noise patterns
    text = text.replace(/[|]{2,}/g, ""); // repeated pipes
    text = text.replace(/[_]{3,}/g, ""); // underlines
    text = text.replace(/[~]{2,}/g, ""); // tildes
    text = text.replace(/[=]{3,}/g, ""); // equals signs

    // Remove common page header/footer patterns
    text = text.replace(/^Page\s+\d+\s*(of\s+\d+)?\s*$/gm, "");
    text = text.replace(/^\d+\s*\/\s*\d+\s*$/gm, "");

    // Remove confidence markers that some OCR systems embed
    text = text.replace(/\[confidence:\s*[\d.]+\]/gi, "");
    text = text.replace(/\(conf\.\s*[\d.]+\)/gi, "");

    // Clean up leading/trailing whitespace per line
    text = text
        .split("\n")
        .map((line) => line.trim())
        .join("\n");

    // Final trim
    text = text.trim();

    return text;
}

export function getWordCount(text: string): number {
    return text
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
}
