import { NextResponse } from "next/server";

export async function POST() {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    console.log("🔧 Resend config:", {
      hasKey: !!resendKey,
      keyLength: resendKey?.length,
      fromEmail
    });

    // Test Resend API directly
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: "test@example.com",
      subject: "Test Email",
      html: "<p>Test email from x402Pay</p>",
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return NextResponse.json({
        error: error.message,
        type: "resend_error",
        config: {
          fromEmail,
          hasKey: !!resendKey
        }
      }, { status: 500 });
    }

    console.log("✅ Test email sent:", data);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data
    });

  } catch (error) {
    console.error("❌ Test error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      type: "test_error"
    }, { status: 500 });
  }
}
