import { NextRequest, NextResponse } from "next/server";

// Track payment depth per session
const sessionDepths = new Map<string, number>();

// Content at each depth level
const contentLevels = [
  {
    depth: 0,
    price: 0,
    title: "Start Your Journey",
    content: "Welcome to recursive x402 payments. This is the surface level - free to access.",
    nextPrompt: "Ready to go deeper? Pay 0.1 STX to unlock Layer 1: The Basics",
  },
  {
    depth: 1,
    price: 0.1,
    title: "Layer 1: The Basics",
    content: "Web3 payments eliminate intermediaries. Traditional platforms take 10-20% fees. With x402, creators keep 97.5% of revenue. The 2.5% protocol fee is orders of magnitude lower.",
    nextPrompt: "Want advanced insights? Pay 0.2 STX to unlock Layer 2: Technical Deep Dive",
  },
  {
    depth: 2,
    price: 0.2,
    title: "Layer 2: Technical Deep Dive",
    content: "x402 implements HTTP 402 Payment Required - a status code waiting 30 years for its killer app. Each request triggers on-chain verification. Smart contracts handle escrow. PoX stacking generates 10% APY on locked funds.",
    nextPrompt: "Ready for expert level? Pay 0.5 STX to unlock Layer 3: Business Strategy",
  },
  {
    depth: 3,
    price: 0.5,
    title: "Layer 3: Business Strategy",
    content: "The creator economy TAM is $128B. Current platforms extract $38B annually in fees. x402Pay can capture 1% of this market ($1.28B) by offering 5x better economics. Unit economics: $2.50 revenue per $100 transaction vs $10-20 for competitors.",
    nextPrompt: "Want the secret sauce? Pay 1.0 STX to unlock Layer 4: The Endgame",
  },
  {
    depth: 4,
    price: 1.0,
    title: "Layer 4: The Endgame",
    content: "The true innovation isn't payments - it's RECURSIVE VALUE CREATION. Each layer generates new paywalls. AI agents can hire other agents, each creating their own x402 endpoints. This is the autonomous agent economy. This is the future.",
    nextPrompt: "🎉 You've reached the deepest layer! Total spent: 1.8 STX",
  },
];

// Verify payment token (simplified)
async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/x402/verify?token=${token}`);
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

// ============================================
// GET /api/recursive
// Recursive x402 payment endpoint
// ============================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const sessionId = searchParams.get('session') || 'default';
  
  // Get current depth for this session
  let currentDepth = sessionDepths.get(sessionId) || 0;
  
  // If no token, return Layer 0 (free)
  if (!token) {
    const layer = contentLevels[0];
    
    return NextResponse.json({
      success: true,
      depth: 0,
      title: layer.title,
      content: layer.content,
      nextLayer: {
        depth: 1,
        price: contentLevels[1].price,
        prompt: layer.nextPrompt,
        paymentEndpoint: "/api/x402/verify",
      },
      sessionId,
      totalSpent: 0,
    });
  }
  
  // Verify token
  const isValid = await verifyToken(token);
  
  if (!isValid) {
    return NextResponse.json(
      {
        error: "Invalid or expired token",
        code: "INVALID_TOKEN",
      },
      { status: 401 }
    );
  }
  
  // Token valid - advance to next depth
  currentDepth += 1;
  sessionDepths.set(sessionId, currentDepth);
  
  // Check if we've reached max depth
  if (currentDepth >= contentLevels.length) {
    return NextResponse.json({
      success: true,
      depth: currentDepth - 1,
      title: "Journey Complete",
      content: "You've unlocked all layers! You've experienced recursive x402 payments - the future of the micropayment web.",
      totalSpent: contentLevels.slice(1, currentDepth).reduce((sum, l) => sum + l.price, 0),
      sessionId,
    });
  }
  
  // Return current layer content
  const layer = contentLevels[currentDepth];
  const totalSpent = contentLevels.slice(1, currentDepth + 1).reduce((sum, l) => sum + l.price, 0);
  
  const response: any = {
    success: true,
    depth: currentDepth,
    title: layer.title,
    content: layer.content,
    totalSpent,
    sessionId,
  };
  
  // If not at max depth, include next layer info
  if (currentDepth < contentLevels.length - 1) {
    response.nextLayer = {
      depth: currentDepth + 1,
      price: contentLevels[currentDepth + 1].price,
      prompt: layer.nextPrompt,
      paymentEndpoint: "/api/x402/verify",
    };
  } else {
    response.message = layer.nextPrompt;
  }
  
  return NextResponse.json(response);
}

// ============================================
// POST /api/recursive/reset
// Reset session depth
// ============================================
export async function POST(request: NextRequest) {
  const { sessionId } = await request.json();
  
  if (sessionId) {
    sessionDepths.delete(sessionId);
  }
  
  return NextResponse.json({ 
    success: true,
    message: "Session reset" 
  });
}
