import { NextRequest, NextResponse } from "next/server";

// Simple token generator
function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");
}

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    console.log("🔧 Environment check:", {
      supabaseUrl: supabaseUrl ? "✅" : "❌",
      supabaseKey: supabaseKey ? "✅" : "❌", 
      resendKey: resendKey ? "✅" : "❌"
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase credentials");
      return NextResponse.json(
        { error: "Server configuration error: Missing database credentials" },
        { status: 500 }
      );
    }

    if (!resendKey) {
      console.error("❌ Missing Resend API key");
      return NextResponse.json(
        { error: "Server configuration error: Missing email service" },
        { status: 500 }
      );
    }

    // Generate token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log("📧 Processing magic link for:", email);

    // Store token in Supabase
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const { error: dbError } = await supabase.from("magic_link_tokens").insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        redirect_to: redirectTo || "/subscribe",
        used: false,
      });

      if (dbError) {
        console.error("❌ Database error:", dbError);
        
        // Check if table exists
        if (dbError.message?.includes("relation") || dbError.message?.includes("does not exist")) {
          return NextResponse.json(
            { error: "Database not set up. Please run the SQL schema first." },
            { status: 500 }
          );
        }
        
        // Check RLS issues
        if (dbError.message?.includes("row-level security")) {
          console.log("⚠️ RLS issue detected, trying service role bypass...");
          
          // Try with service role bypass
          const { error: bypassError } = await supabase.rpc('admin_insert_magic_link', {
            p_email: email,
            p_token: token,
            p_expires_at: expiresAt.toISOString(),
            p_redirect_to: redirectTo || "/subscribe"
          });
          
          if (bypassError) {
            return NextResponse.json(
              { error: `RLS policy error. Please run: UPDATE RLS_FIX.sql in Supabase. Details: ${bypassError.message}` },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Database error: ${dbError.message}` },
            { status: 500 }
          );
        }
      }

      console.log("✅ Token stored in database");
    } catch (dbErr) {
      console.error("❌ Database connection error:", dbErr);
      return NextResponse.json(
        { error: "Failed to connect to database" },
        { status: 500 }
      );
    }

    // Create magic link URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    
    console.log("🔗 URL construction:", {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      finalAppUrl: appUrl
    });
    
    const magicLinkUrl = `${appUrl}/auth/verify?token=${token}`;
    console.log("🔗 Magic link URL:", magicLinkUrl);

    // Send email via Resend
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "🔐 Your x402Pay Magic Link",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        console.error("❌ Email error:", emailError);
        
        // Check for common Resend errors
        if (emailError.message?.includes("API key")) {
          return NextResponse.json(
            { error: "Email service not configured. Please check RESEND_API_KEY." },
            { status: 500 }
          );
        }
        
        if (emailError.message?.includes("domain")) {
          return NextResponse.json(
            { error: "Email domain not verified. Please verify your domain in Resend." },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { error: `Failed to send email: ${emailError.message}` },
          { status: 500 }
        );
      }

      console.log("✅ Magic link sent:", { email, emailId: emailData?.id });

      return NextResponse.json({
        success: true,
        message: "Magic link sent to your email",
        debug: {
          email,
          magicLinkUrl: process.env.NODE_ENV === "development" ? magicLinkUrl : undefined,
        }
      });
      
    } catch (emailErr) {
      console.error("❌ Email sending error:", emailErr);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Magic link error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
