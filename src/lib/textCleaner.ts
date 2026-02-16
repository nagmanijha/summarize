export function cleanText(text: string): string {
    if (!text) return "";
    // Remove excessive newlines
    let cleaned = text.replace(/\n{3,}/g, "\n\n");
    // Remove weird characters if any (keeping basic punctuation and text)
    // This is a basic cleaner, can be expanded
    return cleaned.trim();
}

export function getWordCount(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
}
