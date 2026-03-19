import { NextResponse } from "next/server";

// Mock subscription data for demo purposes
const mockSubscription = {
  status: "inactive",
  escrowBalance: 0,
  intervalBlocks: 4320,
  strikes: 0,
  autoStack: false,
  nextChargeBlock: null,
  lastChargeBlock: null,
  walletAddress: null,
};

export async function GET(request: Request) {
  try {
    // Get wallet address from headers for demo
    const walletAddress = request.headers.get('x-wallet-address');
    
    // Return mock subscription data
    return NextResponse.json({
      ...mockSubscription,
      walletAddress,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, ...data } = await request.json();
    
    // For demo purposes, just return success
    // In production, this would handle subscription actions
    console.log('Subscription action:', action, data);
    
    return NextResponse.json({
      success: true,
      message: `${action} action completed successfully`,
    });
  } catch (error) {
    console.error('Subscription action error:', error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
