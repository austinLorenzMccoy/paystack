import { NextRequest, NextResponse } from "next/server";

// Mock AI generation (replace with real Groq/Anthropic API)
async function generateAIContent(prompt: string): Promise<string> {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const responses = [
    "Web3 payments represent a paradigm shift from traditional centralized payment processors to trustless, decentralized protocols. By leveraging blockchain technology, x402 enables direct peer-to-peer value transfer without intermediaries, reducing fees from 3-5% to under 1%.",
    
    "The x402 protocol implements HTTP 402 Payment Required - a status code that has been waiting 30 years for its killer app. Now, with Bitcoin and Stacks, we can finally build the micropayment-enabled web that Tim Berners-Lee envisioned.",
    
    "Traditional subscription services trap users in recurring payments with high cancellation friction. x402's escrow-based autopay gives users full control: payments are locked in non-custodial smart contracts, refundable at any time, with 3-strike protection against over-charging.",
    
    "Auto-stacking transforms subscription payments into productive capital. Every 1 STX payment automatically delegates to PoX-4, earning ~10% APY in Bitcoin rewards. Subscribers don't just pay - they invest.",
    
    "The creator economy is plagued by platform rent-seeking: Patreon takes 8-12%, Substack takes 10%, OnlyFans takes 20%. With x402, creators keep 97.5% of revenue. The 2.5% protocol fee is orders of magnitude lower than Web2 alternatives.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Check if request has valid payment token
function extractAccessToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Check query parameter
  const token = request.nextUrl.searchParams.get('token');
  if (token) {
    return token;
  }
  
  return null;
}

// Verify token with payment service
async function verifyAccessToken(token: string): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/x402/verify?token=${token}`);
    const data = await response.json();
    console.log("Token verification response:", data);
    return data.valid === true;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

// ============================================
// GET /api/ai/generate
// Protected AI endpoint requiring payment
// ============================================
export async function GET(request: NextRequest) {
  const token = extractAccessToken(request);
  
  // No token = HTTP 402 Payment Required
  if (!token) {
    return NextResponse.json(
      {
        error: "Payment required to access this endpoint",
        code: "PAYMENT_REQUIRED",
        paymentEndpoint: "/api/x402/verify",
        requiredAmount: 1,
        currency: "STX",
        message: "Please complete payment to access AI-generated content",
      },
      { 
        status: 402,
        headers: {
          'WWW-Authenticate': 'Bearer realm="x402Pay", payment_url="/api/x402/verify"'
        }
      }
    );
  }
  
  // Verify token
  const isValid = await verifyAccessToken(token);
  
  if (!isValid) {
    return NextResponse.json(
      {
        error: "Invalid or expired access token",
        code: "INVALID_TOKEN",
        paymentEndpoint: "/api/x402/verify",
      },
      { status: 401 }
    );
  }
  
  // Token valid - generate content
  const prompt = request.nextUrl.searchParams.get('prompt') || 'web3 payments';
  const content = await generateAIContent(prompt);
  
  return NextResponse.json({
    success: true,
    content,
    generatedAt: new Date().toISOString(),
    model: "x402-ai-v1",
  });
}

// ============================================
// POST /api/ai/generate
// Alternative POST endpoint
// ============================================
export async function POST(request: NextRequest) {
  const token = extractAccessToken(request);
  
  if (!token) {
    return NextResponse.json(
      {
        error: "Payment required",
        paymentEndpoint: "/api/x402/verify",
      },
      { status: 402 }
    );
  }
  
  const isValid = await verifyAccessToken(token);
  
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
  
  const { prompt } = await request.json();
  const content = await generateAIContent(prompt || 'web3 payments');
  
  return NextResponse.json({
    success: true,
    content,
    generatedAt: new Date().toISOString(),
  });
}
