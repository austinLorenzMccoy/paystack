import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const creator = accounts.get("wallet_1")!;
const subscriber = accounts.get("wallet_2")!;

describe("subscription-manager contract", () => {
  it("ensures contract deploys successfully", () => {
    expect(simnet.getContractSource("subscription-manager")).toBeDefined();
  });

  it("allows creating a subscription plan", () => {
    const { result } = simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("premium"),
        Cl.uint(1000000),  // 1 STX monthly
        Cl.uint(10000000), // 10 STX annual
        Cl.uint(80),       // 80% creator
        Cl.uint(20),       // 20% platform
      ],
      creator
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents duplicate plan creation", () => {
    simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("dup-plan"),
        Cl.uint(1000000),
        Cl.uint(10000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    const { result } = simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("dup-plan"),
        Cl.uint(1000000),
        Cl.uint(10000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );
    expect(result).toBeErr(Cl.uint(200)); // ERR-NOT-AUTHORIZED (plan exists)
  });

  it("rejects invalid share percentages", () => {
    const { result } = simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("bad-shares"),
        Cl.uint(1000000),
        Cl.uint(10000000),
        Cl.uint(60),
        Cl.uint(60), // 120% total
      ],
      creator
    );
    expect(result).toBeErr(Cl.uint(205)); // ERR-INVALID-AMOUNT
  });

  it("allows subscribing to a plan (monthly)", () => {
    simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("sub-test"),
        Cl.uint(1000000),
        Cl.uint(10000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    const { result } = simnet.callPublicFn(
      "subscription-manager",
      "subscribe",
      [
        Cl.principal(creator),
        Cl.stringAscii("sub-test"),
        Cl.bool(false), // monthly
      ],
      subscriber
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents duplicate subscriptions", () => {
    simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("no-dup-sub"),
        Cl.uint(1000000),
        Cl.uint(10000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    simnet.callPublicFn(
      "subscription-manager",
      "subscribe",
      [
        Cl.principal(creator),
        Cl.stringAscii("no-dup-sub"),
        Cl.bool(false),
      ],
      subscriber
    );

    const { result } = simnet.callPublicFn(
      "subscription-manager",
      "subscribe",
      [
        Cl.principal(creator),
        Cl.stringAscii("no-dup-sub"),
        Cl.bool(false),
      ],
      subscriber
    );
    expect(result).toBeErr(Cl.uint(202)); // ERR-ALREADY-SUBSCRIBED
  });

  it("allows cancelling a subscription", () => {
    simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("cancel-test"),
        Cl.uint(1000000),
        Cl.uint(10000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    simnet.callPublicFn(
      "subscription-manager",
      "subscribe",
      [
        Cl.principal(creator),
        Cl.stringAscii("cancel-test"),
        Cl.bool(false),
      ],
      subscriber
    );

    const { result } = simnet.callPublicFn(
      "subscription-manager",
      "cancel",
      [
        Cl.principal(creator),
        Cl.stringAscii("cancel-test"),
      ],
      subscriber
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("allows deactivating a plan", () => {
    simnet.callPublicFn(
      "subscription-manager",
      "create-plan",
      [
        Cl.stringAscii("deactivate-test"),
        Cl.uint(1000000),
        Cl.uint(10000000),
        Cl.uint(80),
        Cl.uint(20),
      ],
      creator
    );

    const { result } = simnet.callPublicFn(
      "subscription-manager",
      "deactivate-plan",
      [Cl.stringAscii("deactivate-test")],
      creator
    );
    expect(result).toBeOk(Cl.bool(true));
  });
});
