import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";



export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are accepted" },
                { status: 400 }
            );
        }

        // Validate file size (20MB max)
        const MAX_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File size exceeds 20MB limit" },
                { status: 400 }
            );
        }

        // Save to temp directory
        const tmpDir = os.tmpdir();
        const fileId = `scribeai_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const filePath = path.join(tmpDir, `${fileId}.pdf`);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({
            fileId,
            fileName: file.name,
            fileSize: file.size,
            filePath,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
