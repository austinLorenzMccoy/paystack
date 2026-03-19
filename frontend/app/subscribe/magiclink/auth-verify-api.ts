import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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
      .from("magic_link_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (tokenError || !tokenData) {
      console.error("Token not found:", tokenError);
      return NextResponse.json(
        { error: "Invalid or expired magic link" },
        { status: 400 }
      );
    }

    // Check expiration
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Magic link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark token as used
    await supabase
      .from("magic_link_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("token", token);

    // Create or update user
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", tokenData.email)
      .single();

    let userId: string;

    if (existingUser) {
      // Update last login
      await supabase
        .from("users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", existingUser.id);
      
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email: tokenData.email,
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          testnet_stx_balance: 5_000_000, // 5 STX welcome bonus
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error("Failed to create user:", createError);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }

      userId = newUser.id;

      // TODO: Fund user with 5 testnet STX
      // You'll need to implement this based on your wallet setup
    }

    // Create session
    const sessionToken = Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join("");

    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { error: sessionError } = await supabase.from("sessions").insert({
      user_id: userId,
      token: sessionToken,
      expires_at: sessionExpiresAt.toISOString(),
      created_at: new Date().toISOString(),
    });

    if (sessionError) {
      console.error("Failed to create session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Get user data
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("x402pay_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    console.log("✅ User authenticated:", {
      userId,
      email: tokenData.email,
      redirectTo: tokenData.redirect_to,
    });

    return NextResponse.json({
      success: true,
      session: {
        token: sessionToken,
        userId,
        email: tokenData.email,
      },
      user: userData,
      redirectTo: tokenData.redirect_to || "/subscribe",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
