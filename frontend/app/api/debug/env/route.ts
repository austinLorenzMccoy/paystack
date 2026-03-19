import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    environment: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
      resendKey: process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing",
      resendFromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    }
  });
}
