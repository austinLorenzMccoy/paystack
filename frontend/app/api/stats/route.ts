import { NextRequest, NextResponse } from "next/server";

// In-memory stats (in production, use database)
let stats = {
  totalTransactions: 0,
  totalRevenue: 0,
  usedHashes: [] as string[],
  activeSubscriptions: 0,
  recentTransactions: [] as Array<{
    txHash: string;
    amount: number;
    timestamp: number;
    address: string;
  }>,
};

// ============================================
// GET /api/stats
// Get current statistics
// ============================================
export async function GET(request: NextRequest) {
  return NextResponse.json({
    totalTransactions: stats.totalTransactions,
    totalRevenue: stats.totalRevenue,
    usedHashesCount: stats.usedHashes.length,
    activeSubscriptions: stats.activeSubscriptions,
    recentTransactions: stats.recentTransactions.slice(0, 10),
  });
}

// ============================================
// POST /api/stats
// Update statistics (internal use)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    if (update.type === 'transaction') {
      stats.totalTransactions += 1;
      stats.totalRevenue += update.amount || 0;
      
      if (update.txHash && !stats.usedHashes.includes(update.txHash)) {
        stats.usedHashes.push(update.txHash);
      }
      
      stats.recentTransactions.unshift({
        txHash: update.txHash,
        amount: update.amount,
        timestamp: Date.now(),
        address: update.address,
      });
      
      // Keep only last 100 transactions
      if (stats.recentTransactions.length > 100) {
        stats.recentTransactions = stats.recentTransactions.slice(0, 100);
      }
    }
    
    if (update.type === 'subscription') {
      if (update.action === 'create') {
        stats.activeSubscriptions += 1;
      } else if (update.action === 'cancel') {
        stats.activeSubscriptions = Math.max(0, stats.activeSubscriptions - 1);
      }
    }
    
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
