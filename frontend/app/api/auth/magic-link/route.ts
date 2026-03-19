import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate secure token
function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");
}

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Generate magic link token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Store token
    const { error: dbError } = await supabase.from("magic_link_tokens").insert({
      email,
      token,
      expires_at: expiresAt.toISOString(),
      redirect_to: redirectTo || "/subscribe",
      used: false,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to generate magic link" },
        { status: 500 }
      );
    }

    // Create magic link URL
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${token}`;

    // Send email
    const { data, error } = await resend.emails.send({
      from: "x402Pay <noreply@x402pay.app>",
      to: [email],
      subject: "Sign in to x402Pay",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A0A0A; padding: 40px; border-radius: 8px;">
            <h2 style="color: white; margin-bottom: 20px;">Welcome to x402Pay</h2>
            <p style="color: #ccc; margin-bottom: 30px;">
              Click the button below to sign in to your account. This link will expire in 15 minutes.
            </p>
            <div style="text-align: center;">
              <a href="${magicLinkUrl}" 
                 style="background: #f97316; color: black; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; font-weight: bold; 
                        display: inline-block;">
                Sign In to x402Pay
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
              If you didn't request this link, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return NextResponse.json(
        { error: "Failed to send magic link email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Magic link sent to your email",
    });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
