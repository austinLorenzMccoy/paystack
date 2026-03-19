import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Generate secure token
function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 400 }
      );
    }

    // Verify token in database
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('admin_validate_token', { p_token: token });

    if (tokenError || !tokenData || tokenData.length === 0) {
      console.error("Token not found:", tokenError);
      return NextResponse.json(
        { error: "Invalid or expired magic link" },
        { status: 400 }
      );
    }

    const tokenInfo = tokenData[0];
    
    // Check expiration
    const expiresAt = new Date(tokenInfo.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Magic link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark token as used
    await supabase.rpc('admin_mark_token_used', { p_token: token });

    // Get or create user
    const { data: userId, error: userError } = await supabase
      .rpc('admin_get_or_create_user', { p_email: tokenInfo.email });

    if (userError || !userId) {
      console.error("User creation error:", userError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create session
    const sessionToken = generateToken();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await supabase.rpc('admin_create_session', {
      p_user_id: userId,
      p_token: sessionToken,
      p_expires_at: sessionExpiresAt.toISOString()
    });

    // Get user info for response
    const { data: userInfo } = await supabase
      .from("users")
      .select("id, email, wallet_address")
      .eq("id", userId)
      .single();

    const sessionData = {
      userId: userId,
      email: tokenInfo.email,
      walletAddress: userInfo?.wallet_address || null,
      createdAt: new Date().toISOString(),
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("x402pay_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: tokenInfo.email,
        walletAddress: userInfo?.wallet_address || null,
      },
      redirectTo: tokenInfo.redirect_to,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
