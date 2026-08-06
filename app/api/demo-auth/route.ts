import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const configuredPassword = process.env.DEMO_PASSWORD;

  if (!configuredPassword && process.env.NODE_ENV !== "production") {
    return Response.json({ unlocked: true });
  }

  if (!configuredPassword) {
    return Response.json({ unlocked: false }, { status: 401 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };

  if (password === configuredPassword) {
    return Response.json({ unlocked: true });
  }

  return Response.json({ error: "Nieprawidłowe hasło." }, { status: 401 });
}
