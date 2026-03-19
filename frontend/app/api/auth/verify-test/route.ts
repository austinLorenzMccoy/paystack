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

    console.log("🔍 TEST MODE: Verifying token:", token);

    // For testing: Accept any token and create a mock user session
    const mockUser = {
      id: "test-user-id",
      email: "test@example.com",
      walletAddress: null,
    };

    // Create session token
    const sessionToken = `test-session-${Date.now()}`;

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("x402pay_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("✅ TEST MODE: Session created for", mockUser.email);

    return NextResponse.json({
      success: true,
      user: mockUser,
      redirectTo: "/subscribe",
    });
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
