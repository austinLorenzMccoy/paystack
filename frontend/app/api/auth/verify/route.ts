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
      .eq("id", tokenData.id);

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", tokenData.email)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create one
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email: tokenData.email,
          last_login_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("User creation error:", createError);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }
      user = newUser;
    } else if (userError) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "Failed to verify user" },
        { status: 500 }
      );
    } else {
      // Update last login
      await supabase
        .from("users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    // Create session
    const sessionData = {
      userId: user.id,
      email: user.email,
      walletAddress: user.wallet_address,
      createdAt: new Date().toISOString(),
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("x402pay_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.wallet_address,
      },
      redirectTo: tokenData.redirect_to,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
