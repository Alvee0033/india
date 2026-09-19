import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { file: string[] } }
) {
  const filePath = (params.file || []).join("/");
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  const localFile = path.join(process.cwd(), "public", "uploads", filePath);
  if (existsSync(localFile)) {
    const data = readFileSync(localFile);
    const ext = path.extname(localFile).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Fallback: proxy from dlimsvitpk.com
  try {
    const remoteUrl = `https://dlimsvitpk.com/uploads/${filePath}`;
    const res = await fetch(remoteUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      return new NextResponse("Not found", { status: 404 });
    }

    const arrBuf = await res.arrayBuffer();
    const data = Buffer.from(arrBuf);

    try {
      mkdirSync(path.dirname(localFile), { recursive: true });
      writeFileSync(localFile, data);
    } catch {}

    const contentType = res.headers.get("content-type") || "image/jpeg";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Error fetching file", { status: 500 });
  }
}
