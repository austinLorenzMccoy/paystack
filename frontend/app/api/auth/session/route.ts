import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("x402pay_session");

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      
      // Get user data from database
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, wallet_address, created_at, last_login_at")
        .eq("id", session.userId)
        .single();

      if (error || !user) {
        // Clear invalid session
        cookieStore.delete("x402pay_session");
        return NextResponse.json({ user: null });
      }

      return NextResponse.json({ 
        user: {
          id: user.id,
          email: user.email,
          walletAddress: user.wallet_address,
        }
      });
    } catch (parseError) {
      // Clear malformed session
      cookieStore.delete("x402pay_session");
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error("Auth session error:", error);
    return NextResponse.json({ user: null });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("x402pay_session");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
