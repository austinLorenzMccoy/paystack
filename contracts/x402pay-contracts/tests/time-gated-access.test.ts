import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const creator = accounts.get("wallet_1")!;
const buyer = accounts.get("wallet_2")!;

describe("time-gated-access contract", () => {
  it("ensures contract deploys successfully", () => {
    expect(simnet.getContractSource("time-gated-access")).toBeDefined();
  });

  it("allows registering gated content", () => {
    const { result } = simnet.callPublicFn(
      "time-gated-access",
      "register-gated-content",
      [
        Cl.stringAscii("article-001"),
        Cl.uint(500000),  // 0.5 STX
        Cl.uint(4320),    // ~30 days
        Cl.uint(80),      // 80% creator
        Cl.uint(20),      // 20% platform
      ],
      creator
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents duplicate content registration", () => {
    simnet.callPublicFn(
      "time-gated-access",
      "register-gated-content",
      [
        Cl.stringAscii("dup-article"),
        Cl.uint(500000),
        Cl.uint(4320),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    const { result } = simnet.callPublicFn(
      "time-gated-access",
      "register-gated-content",
      [
        Cl.stringAscii("dup-article"),
        Cl.uint(500000),
        Cl.uint(4320),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );
    expect(result).toBeErr(Cl.uint(402)); // ERR-ALREADY-REGISTERED
  });

  it("allows purchasing access during gate window", () => {
    simnet.callPublicFn(
      "time-gated-access",
      "register-gated-content",
      [
        Cl.stringAscii("buy-article"),
        Cl.uint(500000),
        Cl.uint(4320),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    const { result } = simnet.callPublicFn(
      "time-gated-access",
      "purchase-access",
      [Cl.stringAscii("buy-article")],
      buyer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents duplicate purchases", () => {
    simnet.callPublicFn(
      "time-gated-access",
      "register-gated-content",
      [
        Cl.stringAscii("no-dup-buy"),
        Cl.uint(500000),
        Cl.uint(4320),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    simnet.callPublicFn(
      "time-gated-access",
      "purchase-access",
      [Cl.stringAscii("no-dup-buy")],
      buyer
    );

    const { result } = simnet.callPublicFn(
      "time-gated-access",
      "purchase-access",
      [Cl.stringAscii("no-dup-buy")],
      buyer
    );
    expect(result).toBeErr(Cl.uint(403)); // ERR-ALREADY-PURCHASED
  });

  it("allows creator to extend gate window", () => {
    simnet.callPublicFn(
      "time-gated-access",
      "register-gated-content",
      [
        Cl.stringAscii("extend-article"),
        Cl.uint(500000),
        Cl.uint(100),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    const { result } = simnet.callPublicFn(
      "time-gated-access",
      "extend-gate",
      [
        Cl.stringAscii("extend-article"),
        Cl.uint(500), // extend by 500 blocks
      ],
      creator
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects invalid share percentages", () => {
    const { result } = simnet.callPublicFn(
      "time-gated-access",
      "register-gated-content",
      [
        Cl.stringAscii("bad-shares"),
        Cl.uint(500000),
        Cl.uint(4320),
        Cl.uint(60),
        Cl.uint(60), // 120% total
      ],
      creator
    );
    expect(result).toBeErr(Cl.uint(404)); // ERR-INVALID-AMOUNT
  });
});
