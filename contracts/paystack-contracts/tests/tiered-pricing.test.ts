import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator = accounts.get("wallet_1")!;
const student = accounts.get("wallet_2")!;
const business = accounts.get("wallet_3")!;

describe("tiered-pricing contract", () => {
  it("ensures contract deploys successfully", () => {
    expect(simnet.getContractSource("tiered-pricing")).toBeDefined();
  });

  it("allows registering tiered content", () => {
    const { result } = simnet.callPublicFn(
      "tiered-pricing",
      "register-tiered-content",
      [
        Cl.stringAscii("course-001"),
        Cl.uint(1000000),  // standard: 1 STX
        Cl.uint(500000),   // student: 0.5 STX
        Cl.uint(300000),   // nonprofit: 0.3 STX
        Cl.uint(2000000),  // business: 2 STX
        Cl.uint(80),       // 80% creator
        Cl.uint(20),       // 20% platform
      ],
      creator
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents duplicate content registration", () => {
    simnet.callPublicFn(
      "tiered-pricing",
      "register-tiered-content",
      [
        Cl.stringAscii("dup-course"),
        Cl.uint(1000000),
        Cl.uint(500000),
        Cl.uint(300000),
        Cl.uint(2000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    const { result } = simnet.callPublicFn(
      "tiered-pricing",
      "register-tiered-content",
      [
        Cl.stringAscii("dup-course"),
        Cl.uint(1000000),
        Cl.uint(500000),
        Cl.uint(300000),
        Cl.uint(2000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );
    expect(result).toBeErr(Cl.uint(603)); // ERR-ALREADY-REGISTERED
  });

  it("allows contract owner to assign tiers", () => {
    const { result } = simnet.callPublicFn(
      "tiered-pricing",
      "assign-tier",
      [
        Cl.principal(student),
        Cl.uint(2), // TIER-STUDENT
      ],
      deployer // contract owner
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("allows self-declaring a tier", () => {
    const { result } = simnet.callPublicFn(
      "tiered-pricing",
      "declare-tier",
      [Cl.uint(4)], // TIER-BUSINESS
      business
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects invalid tier values", () => {
    const { result } = simnet.callPublicFn(
      "tiered-pricing",
      "declare-tier",
      [Cl.uint(99)], // invalid tier
      student
    );
    expect(result).toBeErr(Cl.uint(602)); // ERR-TIER-NOT-FOUND
  });

  it("allows purchasing at tier-appropriate price", () => {
    // Register content
    simnet.callPublicFn(
      "tiered-pricing",
      "register-tiered-content",
      [
        Cl.stringAscii("tier-buy-test"),
        Cl.uint(1000000),
        Cl.uint(500000),
        Cl.uint(300000),
        Cl.uint(2000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    // Assign student tier
    simnet.callPublicFn(
      "tiered-pricing",
      "assign-tier",
      [Cl.principal(student), Cl.uint(2)],
      deployer
    );

    // Student purchases at student price
    const { result } = simnet.callPublicFn(
      "tiered-pricing",
      "purchase-tiered",
      [Cl.stringAscii("tier-buy-test")],
      student
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents duplicate purchases", () => {
    simnet.callPublicFn(
      "tiered-pricing",
      "register-tiered-content",
      [
        Cl.stringAscii("no-dup-tier"),
        Cl.uint(1000000),
        Cl.uint(500000),
        Cl.uint(300000),
        Cl.uint(2000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    simnet.callPublicFn(
      "tiered-pricing",
      "purchase-tiered",
      [Cl.stringAscii("no-dup-tier")],
      student
    );

    const { result } = simnet.callPublicFn(
      "tiered-pricing",
      "purchase-tiered",
      [Cl.stringAscii("no-dup-tier")],
      student
    );
    expect(result).toBeErr(Cl.uint(604)); // ERR-ALREADY-PURCHASED
  });
});
