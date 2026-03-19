import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("x402pay_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      );
    }

    // Verify session in database
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get session and user data
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        *,
        users (*)
      `)
      .eq("token", sessionToken)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !sessionData) {
      // Invalid or expired session - clear cookie
      cookieStore.delete("x402pay_session");
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      );
    }

    // Update last used timestamp
    await supabase
      .from("sessions")
      .update({ last_used_at: new Date().toISOString() })
      .eq("token", sessionToken);

    return NextResponse.json({
      authenticated: true,
      user: sessionData.users,
      session: {
        token: sessionToken,
        expiresAt: sessionData.expires_at,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { user: null, authenticated: false, error: "Session check failed" },
      { status: 500 }
    );
  }
}
