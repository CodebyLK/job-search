import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file found" }, { status: 400 });

    // Validation
    if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a safe, unique filename
    const filename = `${randomUUID()}.pdf`;
    const destination = path.join(process.cwd(), "storage", filename);

    // Save locally
    await writeFile(destination, buffer);

    // Return the filename so you can store it in the DB
    return NextResponse.json({ success: true, filename });
}