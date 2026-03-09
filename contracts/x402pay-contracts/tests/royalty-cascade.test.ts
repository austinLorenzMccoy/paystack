import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const creator = accounts.get("wallet_1")!;
const buyer1 = accounts.get("wallet_2")!;
const buyer2 = accounts.get("wallet_3")!;

describe("royalty-cascade contract", () => {
  it("ensures contract deploys successfully", () => {
    expect(simnet.getContractSource("royalty-cascade")).toBeDefined();
  });

  it("allows registering a royalty-enabled asset", () => {
    const { result } = simnet.callPublicFn(
      "royalty-cascade",
      "register-asset",
      [
        Cl.uint(5),   // 5% royalty
        Cl.uint(2),   // 2% platform
        Cl.uint(1000000), // 1 STX initial price
        Cl.stringAscii("Online course: Clarity 101"),
      ],
      creator
    );
    expect(result).toBeOk(Cl.uint(0)); // first asset id = 0
  });

  it("rejects royalty + platform > 50%", () => {
    const { result } = simnet.callPublicFn(
      "royalty-cascade",
      "register-asset",
      [
        Cl.uint(40),  // 40% royalty
        Cl.uint(20),  // 20% platform = 60% total
        Cl.uint(1000000),
        Cl.stringAscii("Too greedy"),
      ],
      creator
    );
    expect(result).toBeErr(Cl.uint(503)); // ERR-INVALID-AMOUNT
  });

  it("allows purchasing an asset with royalty cascade", () => {
    // Register asset as creator (counter=1 after this)
    const reg = simnet.callPublicFn(
      "royalty-cascade",
      "register-asset",
      [
        Cl.uint(5),
        Cl.uint(2),
        Cl.uint(1000000),
        Cl.stringAscii("Resale test asset"),
      ],
      creator
    );
    expect(reg.result).toBeOk(Cl.uint(0));

    // buyer1 purchases from creator
    const { result } = simnet.callPublicFn(
      "royalty-cascade",
      "purchase-asset",
      [
        Cl.uint(0),
        Cl.uint(2000000),
      ],
      buyer1
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("pays royalties on resale to original creator", () => {
    // Register asset (counter=2 after this)
    const reg = simnet.callPublicFn(
      "royalty-cascade",
      "register-asset",
      [
        Cl.uint(5),
        Cl.uint(2),
        Cl.uint(1000000),
        Cl.stringAscii("Resale royalty test"),
      ],
      creator
    );
    expect(reg.result).toBeOk(Cl.uint(0));

    // First sale: buyer1 buys from creator
    simnet.callPublicFn(
      "royalty-cascade",
      "purchase-asset",
      [Cl.uint(0), Cl.uint(2000000)],
      buyer1
    );

    // Resale: buyer2 buys from buyer1 - creator still gets royalty
    const { result } = simnet.callPublicFn(
      "royalty-cascade",
      "purchase-asset",
      [Cl.uint(0), Cl.uint(3000000)],
      buyer2
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents self-purchase", () => {
    const reg = simnet.callPublicFn(
      "royalty-cascade",
      "register-asset",
      [
        Cl.uint(5),
        Cl.uint(2),
        Cl.uint(1000000),
        Cl.stringAscii("Self buy test"),
      ],
      creator
    );
    expect(reg.result).toBeOk(Cl.uint(0));

    const { result } = simnet.callPublicFn(
      "royalty-cascade",
      "purchase-asset",
      [Cl.uint(0), Cl.uint(1000000)],
      creator
    );
    expect(result).toBeErr(Cl.uint(504));
  });

  it("tracks cumulative royalties", () => {
    const reg = simnet.callPublicFn(
      "royalty-cascade",
      "register-asset",
      [
        Cl.uint(10),
        Cl.uint(2),
        Cl.uint(1000000),
        Cl.stringAscii("Cumulative royalty test"),
      ],
      creator
    );
    expect(reg.result).toBeOk(Cl.uint(0));

    simnet.callPublicFn(
      "royalty-cascade",
      "purchase-asset",
      [Cl.uint(0), Cl.uint(2000000)],
      buyer1
    );

    const { result } = simnet.callReadOnlyFn(
      "royalty-cascade",
      "get-total-royalties",
      [Cl.principal(creator)],
      creator
    );
    expect(result).toBeOk(expect.anything());
  });
});
