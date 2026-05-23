import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(request: NextRequest) {
    // 1. Get the filename from the URL query (e.g., ?filename=my-resume.pdf)
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("filename");

    if (!filename) {
        return new NextResponse("Filename is required", { status: 400 });
    }

    // 2. SECURITY: Prevent "Path Traversal" attacks
    // path.basename ensures someone can't pass "../../../etc/password" as the filename
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), "storage", safeFilename);

    try {
        // 3. Read the file from your hard drive into memory
        const fileBuffer = await fs.readFile(filePath);

        // 4. Send it back to the browser as a downloadable PDF
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                // This 'attachment' header is what triggers the browser's download prompt
                "Content-Disposition": `attachment; filename="${safeFilename}"`,
            },
        });
    } catch (error) {
        console.error("Download error:", error);
        return new NextResponse("File not found in storage.", { status: 404 });
    }
}