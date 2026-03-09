import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator1 = accounts.get("wallet_1")!;
const creator2 = accounts.get("wallet_2")!;

describe("revenue-optimizer contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  it("deploys successfully", () => {
    const contract = simnet.getContractSource("revenue-optimizer");
    expect(contract).toBeDefined();
  });

  describe("APY Rate Management", () => {
    it("sets and retrieves APY rates", () => {
      // Set PoX APY to 10% (1000 bps)
      const setPox = simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("pox-stacking"), Cl.uint(1000)],
        deployer
      );
      expect(setPox.result).toBeOk(Cl.bool(true));

      // Retrieve PoX APY
      const getPox = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "get-apy-rate",
        [Cl.stringAscii("pox-stacking")],
        deployer
      );
      const poxValue = getPox.result as any;
      expect(poxValue.type).toBe("ok");
      expect(poxValue.value.type).toBe("some");
      const tuple = poxValue.value.value.value as Record<string, any>;
      expect(tuple["apy-bps"]).toStrictEqual(Cl.uint(1000));
    });

    it("allows multiple strategy APY rates", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("pox-stacking"), Cl.uint(1000)],
        deployer
      );
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("bitflow-lp"), Cl.uint(1200)],
        deployer
      );

      const getAlex = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "get-apy-rate",
        [Cl.stringAscii("alex-farming")],
        deployer
      );
      const alexValue = getAlex.result as any;
      const alexTuple = alexValue.value.value.value as Record<string, any>;
      expect(alexTuple["apy-bps"]).toStrictEqual(Cl.uint(1500));
    });
  });

  describe("Yield Optimization", () => {
    it("rejects optimization with amount below minimum", () => {
      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(500000), Cl.none()],
        creator1
      );
      expect(result).toBeErr(Cl.uint(701)); // ERR-INVALID-AMOUNT
    });

    it("optimizes yield and selects best strategy", () => {
      // Set APY rates: PoX = 10%, ALEX = 15%, Bitflow = 12%
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("pox-stacking"), Cl.uint(1000)],
        deployer
      );
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("bitflow-lp"), Cl.uint(1200)],
        deployer
      );

      // Optimize 2 STX
      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );
      expect(result).toBeOk(Cl.stringAscii("alex-farming")); // Best APY
    });

    it("selects PoX when it has highest APY", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("pox-stacking"), Cl.uint(2000)],
        deployer
      );
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("bitflow-lp"), Cl.uint(1200)],
        deployer
      );

      const poxAddr = {
        version: Cl.buffer(Uint8Array.from([0x01])),
        hashbytes: Cl.buffer(
          Uint8Array.from(new Array(32).fill(0x12))
        ),
      };

      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.some(Cl.tuple(poxAddr))],
        creator1
      );
      expect(result).toBeOk(Cl.stringAscii("pox-stacking"));
    });

    it("updates creator strategy record", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(3000000), Cl.none()],
        creator1
      );

      const strategy = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "get-creator-strategy",
        [Cl.principal(creator1)],
        deployer
      );
      const stratValue = strategy.result as any;
      expect(stratValue.type).toBe("ok");
      expect(stratValue.value.type).toBe("some");
      const tuple = stratValue.value.value.value as Record<string, any>;
      expect(tuple["current-strategy"]).toStrictEqual(
        Cl.stringAscii("alex-farming")
      );
      expect(tuple["total-deployed"]).toStrictEqual(Cl.uint(3000000));
    });

    it("enforces rebalance interval", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      // First optimization
      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );

      // Try to optimize again immediately
      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(1000000), Cl.none()],
        creator1
      );
      expect(result).toBeErr(Cl.uint(705)); // ERR-REBALANCE-TOO-SOON
    });

    it("allows optimization after rebalance interval", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );

      // Mine blocks to pass rebalance interval
      simnet.mineEmptyBlocks(4320);

      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(1000000), Cl.none()],
        creator1
      );
      expect(result).toBeOk(Cl.stringAscii("alex-farming"));
    });
  });

  describe("Strategy Balance Tracking", () => {
    it("tracks balance per creator per strategy", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("bitflow-lp"), Cl.uint(1200)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(5000000), Cl.none()],
        creator1
      );

      const balance = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "get-strategy-balance",
        [Cl.principal(creator1), Cl.stringAscii("bitflow-lp")],
        deployer
      );
      const balValue = balance.result as any;
      expect(balValue.type).toBe("ok");
      expect(balValue.value.type).toBe("some");
      const tuple = balValue.value.value.value as Record<string, any>;
      expect(tuple.amount).toStrictEqual(Cl.uint(5000000));
    });

    it("accumulates balance on multiple deposits", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );

      simnet.mineEmptyBlocks(4320);

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(3000000), Cl.none()],
        creator1
      );

      const balance = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "get-strategy-balance",
        [Cl.principal(creator1), Cl.stringAscii("alex-farming")],
        deployer
      );
      const balValue = balance.result as any;
      const tuple = balValue.value.value.value as Record<string, any>;
      expect(tuple.amount).toStrictEqual(Cl.uint(5000000));
    });
  });

  describe("Withdrawal", () => {
    it("withdraws from strategy successfully", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(5000000), Cl.none()],
        creator1
      );

      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "withdraw-from-strategy",
        [Cl.stringAscii("alex-farming"), Cl.uint(2000000)],
        creator1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check remaining balance
      const balance = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "get-strategy-balance",
        [Cl.principal(creator1), Cl.stringAscii("alex-farming")],
        deployer
      );
      const balValue = balance.result as any;
      const tuple = balValue.value.value.value as Record<string, any>;
      expect(tuple.amount).toStrictEqual(Cl.uint(3000000));
    });

    it("rejects withdrawal exceeding balance", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );

      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "withdraw-from-strategy",
        [Cl.stringAscii("alex-farming"), Cl.uint(3000000)],
        creator1
      );
      expect(result).toBeErr(Cl.uint(704)); // ERR-INSUFFICIENT-BALANCE
    });

    it("rejects withdrawal from non-existent strategy", () => {
      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "withdraw-from-strategy",
        [Cl.stringAscii("alex-farming"), Cl.uint(1000000)],
        creator1
      );
      expect(result).toBeErr(Cl.uint(704)); // ERR-INSUFFICIENT-BALANCE
    });
  });

  describe("Rebalancing", () => {
    it("rebalances to new best strategy", () => {
      // Set initial APYs: ALEX = 15%, Bitflow = 12%
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("bitflow-lp"), Cl.uint(1200)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(3000000), Cl.none()],
        creator1
      );

      // Change APYs: Bitflow now better
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("bitflow-lp"), Cl.uint(2000)],
        deployer
      );

      simnet.mineEmptyBlocks(4320);

      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "rebalance-strategy",
        [Cl.none()],
        creator1
      );
      expect(result).toBeOk(Cl.stringAscii("bitflow-lp"));
    });

    it("enforces rebalance interval", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );

      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "rebalance-strategy",
        [Cl.none()],
        creator1
      );
      expect(result).toBeErr(Cl.uint(705)); // ERR-REBALANCE-TOO-SOON
    });

    it("rejects rebalance for non-existent strategy", () => {
      const { result } = simnet.callPublicFn(
        "revenue-optimizer",
        "rebalance-strategy",
        [Cl.none()],
        creator2
      );
      expect(result).toBeErr(Cl.uint(700)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Can Rebalance Check", () => {
    it("returns true for new creator", () => {
      const canRebalance = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "can-rebalance",
        [Cl.principal(creator1)],
        deployer
      );
      expect(canRebalance.result).toBeOk(Cl.bool(true));
    });

    it("returns false before interval elapsed", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );

      const canRebalance = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "can-rebalance",
        [Cl.principal(creator1)],
        deployer
      );
      expect(canRebalance.result).toBeOk(Cl.bool(false));
    });

    it("returns true after interval elapsed", () => {
      simnet.callPublicFn(
        "revenue-optimizer",
        "set-apy-rate",
        [Cl.stringAscii("alex-farming"), Cl.uint(1500)],
        deployer
      );

      simnet.callPublicFn(
        "revenue-optimizer",
        "optimize-yield",
        [Cl.uint(2000000), Cl.none()],
        creator1
      );

      simnet.mineEmptyBlocks(4320);

      const canRebalance = simnet.callReadOnlyFn(
        "revenue-optimizer",
        "can-rebalance",
        [Cl.principal(creator1)],
        deployer
      );
      expect(canRebalance.result).toBeOk(Cl.bool(true));
    });
  });
});
