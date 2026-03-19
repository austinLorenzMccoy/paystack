import { NextRequest, NextResponse } from "next/server";

// Simulated payment verification
// In production, this would verify on-chain transaction
async function verifyPayment(txHash: string): Promise<boolean> {
  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo: accept any valid-looking hash
  return txHash.length === 64 && /^[0-9a-f]+$/i.test(txHash);
}

// Generate access token after payment
function generateAccessToken(txHash: string, address: string): string {
  return Buffer.from(`${txHash}:${address}:${Date.now()}`).toString('base64');
}

// Store for tracking payments (in production, use database)
const paymentStore = new Map<string, { 
  txHash: string, 
  address: string, 
  timestamp: number,
  amount: number 
}>();

// Stats tracking
let stats = {
  totalTransactions: 0,
  totalRevenue: 0,
  usedHashes: new Set<string>(),
};

// ============================================
// POST /api/x402/verify
// Verify payment and get access token
// ============================================
export async function POST(request: NextRequest) {
  try {
    const { txHash, walletAddress, amount } = await request.json();

    if (!txHash || !walletAddress) {
      return NextResponse.json(
        { error: "Missing txHash or walletAddress" },
        { status: 400 }
      );
    }

    // Check if hash already used
    if (stats.usedHashes.has(txHash)) {
      return NextResponse.json(
        { error: "Transaction hash already used" },
        { status: 400 }
      );
    }

    // Verify payment on-chain
    const isValid = await verifyPayment(txHash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 402 } // HTTP 402 Payment Required
      );
    }

    // Generate access token
    const accessToken = generateAccessToken(txHash, walletAddress);

    // Store payment
    paymentStore.set(accessToken, {
      txHash,
      address: walletAddress,
      timestamp: Date.now(),
      amount: amount || 1,
    });

    // Update stats
    stats.usedHashes.add(txHash);
    stats.totalTransactions += 1;
    stats.totalRevenue += (amount || 1);

    console.log("✅ Payment verified:", {
      txHash: txHash.slice(0, 16) + "...",
      address: walletAddress.slice(0, 10) + "...",
      token: accessToken.slice(0, 20) + "...",
    });

    return NextResponse.json({
      success: true,
      accessToken,
      message: "Payment verified successfully",
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/x402/verify?token=xxx
// Check if token is valid
// ============================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: "No token provided" },
      { status: 400 }
    );
  }

  const payment = paymentStore.get(token);

  if (!payment) {
    return NextResponse.json(
      { valid: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Check if token expired (1 hour)
  const isExpired = Date.now() - payment.timestamp > 60 * 60 * 1000;

  if (isExpired) {
    paymentStore.delete(token);
    return NextResponse.json(
      { valid: false, error: "Token expired" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    valid: true,
    payment: {
      address: payment.address,
      timestamp: payment.timestamp,
      amount: payment.amount,
    }
  });
}
