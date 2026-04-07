import { NextRequest, NextResponse } from "next/server";
import { getAISettings, updateAISettings } from "@/lib/aiSettings";

export async function GET() {
  const settings = getAISettings();
  // Mask the API key — only show last 4 chars
  return NextResponse.json({
    ...settings,
    apiKey: settings.apiKey ? `sk-...${settings.apiKey.slice(-4)}` : "",
    apiKeySet: !!settings.apiKey,
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  // Don't overwrite key if masked value sent back
  if (body.apiKey?.startsWith("sk-...")) {
    delete body.apiKey;
  }

  const updated = updateAISettings(body);
  return NextResponse.json({
    ...updated,
    apiKey: updated.apiKey ? `sk-...${updated.apiKey.slice(-4)}` : "",
    apiKeySet: !!updated.apiKey,
  });
}
