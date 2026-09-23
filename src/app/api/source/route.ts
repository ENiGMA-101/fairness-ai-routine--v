import { createReadStream, existsSync, statSync } from "node:fs";
import { Readable } from "node:stream";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Protected source-code download. The archive lives at the project root
 * (never inside /public), so it is not publicly served.
 * Access: /api/source?token=YOUR_ADMIN_TOKEN
 */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const file = `${process.cwd()}/fairness-app.zip`;
  if (!existsSync(file)) {
    return NextResponse.json(
      { error: "Archive not found. Run: node scripts/make-zip.mjs" },
      { status: 404 },
    );
  }

  const size = statSync(file).size;
  const nodeStream = createReadStream(file);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(size),
      "Content-Disposition": 'attachment; filename="fairness-app.zip"',
      "Cache-Control": "no-store",
    },
  });
}
