import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(
    req: Request,
    // 👇 The fix is right here: Promise<{ filename: string }>
    { params }: { params: Promise<{ filename: string }> }
) {
    // Now TypeScript knows this await is valid!
    const { filename } = await params;
    const filePath = path.join(process.cwd(), "storage", filename);

    try {
        const fileBuffer = await readFile(filePath);
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${filename}"`,
            },
        });
    } catch {
        return new NextResponse("File not found", { status: 404 });
    }
}