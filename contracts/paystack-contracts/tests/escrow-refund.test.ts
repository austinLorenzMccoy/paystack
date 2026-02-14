import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const payer = accounts.get("wallet_1")!;
const payee = accounts.get("wallet_2")!;

function createEscrow(amount: number = 1000000, desc: string = "test") {
  const { result } = simnet.callPublicFn(
    "escrow-refund",
    "create-escrow",
    [
      Cl.principal(payee),
      Cl.uint(amount),
      Cl.uint(5),
      Cl.uint(100),
      Cl.stringAscii(desc),
    ],
    payer
  );
  return result;
}

describe("escrow-refund contract", () => {
  it("ensures contract deploys successfully", () => {
    expect(simnet.getContractSource("escrow-refund")).toBeDefined();
  });

  it("allows creating an escrow", () => {
    const result = createEscrow(1000000, "Web design project");
    expect(result).toBeOk(Cl.uint(0));
  });

  it("allows releasing escrow to payee", () => {
    const createResult = createEscrow(1000000, "Release test");
    expect(createResult).toBeOk(Cl.uint(0));

    const { result } = simnet.callPublicFn(
      "escrow-refund",
      "release-escrow",
      [Cl.uint(0)],
      payer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents non-payer from releasing escrow", () => {
    const createResult = createEscrow(1000000, "Auth test");
    expect(createResult).toBeOk(Cl.uint(0));

    const { result } = simnet.callPublicFn(
      "escrow-refund",
      "release-escrow",
      [Cl.uint(0)],
      payee
    );
    expect(result).toBeErr(Cl.uint(300));
  });

  it("allows payee to refund escrow", () => {
    const createResult = createEscrow(1000000, "Refund test");
    expect(createResult).toBeOk(Cl.uint(0));

    const { result } = simnet.callPublicFn(
      "escrow-refund",
      "refund-escrow",
      [Cl.uint(0)],
      payee
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("allows raising a dispute", () => {
    const createResult = createEscrow(1000000, "Dispute test");
    expect(createResult).toBeOk(Cl.uint(0));

    const { result } = simnet.callPublicFn(
      "escrow-refund",
      "raise-dispute",
      [
        Cl.uint(0),
        Cl.stringAscii("Work not delivered as agreed"),
      ],
      payer
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents double release", () => {
    const createResult = createEscrow(1000000, "Double release test");
    expect(createResult).toBeOk(Cl.uint(0));

    simnet.callPublicFn(
      "escrow-refund",
      "release-escrow",
      [Cl.uint(0)],
      payer
    );

    const { result } = simnet.callPublicFn(
      "escrow-refund",
      "release-escrow",
      [Cl.uint(0)],
      payer
    );
    expect(result).toBeErr(Cl.uint(302));
  });
});
