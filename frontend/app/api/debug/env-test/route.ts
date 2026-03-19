import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    // Test different combinations
    test1: process.env.NEXT_PUBLIC_APP_URL || "fallback1",
    test2: process.env.VERCEL_URL || "fallback2",
    test3: (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL) || "fallback3",
  };

  return NextResponse.json({
    environment: envVars,
    construction: {
      method1: envVars.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL,
      method2: process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL,
    }
  });
}
