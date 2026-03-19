import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate secure token (you can use a library like `crypto` or `nanoid`)
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

    // Store token in database (example with Supabase)
    // You'll need to create a `magic_link_tokens` table
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
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
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@x402pay.com",
      to: email,
      subject: "🔐 Your x402Pay Magic Link",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>x402Pay Magic Link</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0A0A;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1A1A1A; border-radius: 8px; overflow: hidden; border: 1px solid #333;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #F7931A 0%, #FF8C42 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: 700;">
                          ⚡ x402Pay
                        </h1>
                        <p style="margin: 10px 0 0 0; color: #000; font-size: 16px;">
                          Your Magic Link is Ready
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #FFFFFF; font-size: 22px; font-weight: 600;">
                          Welcome to x402Pay! 👋
                        </h2>
                        
                        <p style="margin: 0 0 20px 0; color: #B0B0B0; font-size: 16px; line-height: 1.6;">
                          Click the button below to sign in to your account. This link will expire in <strong style="color: #FFFFFF;">15 minutes</strong>.
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${magicLinkUrl}" style="display: inline-block; background-color: #F7931A; color: #000; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                🚀 Sign In to x402Pay
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Bonus Info -->
                        <div style="background-color: rgba(247, 147, 26, 0.1); border: 1px solid rgba(247, 147, 26, 0.3); border-radius: 6px; padding: 20px; margin: 30px 0;">
                          <p style="margin: 0; color: #F7931A; font-size: 14px; font-weight: 600;">
                            🎁 WELCOME BONUS
                          </p>
                          <p style="margin: 10px 0 0 0; color: #E0E0E0; font-size: 14px; line-height: 1.5;">
                            New users get <strong>5 testnet STX</strong> to try x402Pay subscriptions!
                          </p>
                        </div>
                        
                        <!-- Manual Link -->
                        <p style="margin: 30px 0 10px 0; color: #808080; font-size: 13px;">
                          If the button doesn't work, copy and paste this link:
                        </p>
                        <p style="margin: 0; color: #4ECDC4; font-size: 12px; word-break: break-all;">
                          ${magicLinkUrl}
                        </p>
                        
                        <!-- Security Notice -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
                          <p style="margin: 0; color: #808080; font-size: 13px;">
                            🔒 <strong style="color: #B0B0B0;">Security Notice:</strong> This link can only be used once. If you didn't request this email, you can safely ignore it.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0A0A0A; padding: 30px; text-align: center; border-top: 1px solid #333;">
                        <p style="margin: 0 0 10px 0; color: #808080; font-size: 13px;">
                          Built on Stacks • Secured by Bitcoin
                        </p>
                        <p style="margin: 0; color: #606060; font-size: 12px;">
                          © 2026 x402Pay. All rights reserved.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    console.log("✅ Magic link sent:", { email, emailId: emailData?.id });

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
