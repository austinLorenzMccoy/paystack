import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const TEST_ASSET = "SIM";

describe("revenue-split contract", () => {
  it("ensures contract deploys successfully", () => {
    expect(simnet.getContractSource("revenue-split")).toBeDefined();
  });

  it("allows registering new content", () => {
    const { result } = simnet.callPublicFn(
      "revenue-split",
      "register-content",
      [
        Cl.stringAscii("test-content-123"),
        Cl.uint(1000000) // 1 STX in microSTX
      ],
      address1
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("allows setting content configuration", () => {
    // First register content
    simnet.callPublicFn(
      "revenue-split",
      "register-content",
      [
        Cl.stringAscii("configurable-content"),
        Cl.uint(1000000)
      ],
      address1
    );

    // Then set configuration
    const { result } = simnet.callPublicFn(
      "revenue-split",
      "set-content-config",
      [
        Cl.stringAscii("configurable-content"),
        Cl.uint(1000000),
        Cl.uint(70), // 70% creator
        Cl.uint(20), // 20% platform
        Cl.uint(10), // 10% collaborator
        Cl.none() // no collaborator
      ],
      address1
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("allows payment processing", () => {
    // Register content first
    simnet.callPublicFn(
      "revenue-split",
      "register-content",
      [
        Cl.stringAscii("payable-content"),
        Cl.uint(1000000)
      ],
      address1
    );

    // Process payment
    const { result } = simnet.callPublicFn(
      "revenue-split",
      "pay-for-content",
      [
        Cl.stringAscii("payable-content"),
        Cl.uint(1000000), // payment amount
        Cl.stringAscii(TEST_ASSET), // asset type
        Cl.stringAscii("0x1234567890abcdef") // mock tx id
      ],
      address1
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("prevents duplicate payments", () => {
    // Register content first
    simnet.callPublicFn(
      "revenue-split",
      "register-content",
      [
        Cl.stringAscii("duplicate-test"),
        Cl.uint(1000000)
      ],
      address1
    );

    // First payment should succeed
    simnet.callPublicFn(
      "revenue-split",
      "pay-for-content",
      [
        Cl.stringAscii("duplicate-test"),
        Cl.uint(1000000),
        Cl.stringAscii(TEST_ASSET),
        Cl.stringAscii("0x1234567890abcdef")
      ],
      address1
    );

    // Second payment with same tx-id should fail
    const { result } = simnet.callPublicFn(
      "revenue-split",
      "pay-for-content",
      [
        Cl.stringAscii("duplicate-test"),
        Cl.uint(1000000),
        Cl.stringAscii(TEST_ASSET),
        Cl.stringAscii("0x1234567890abcdef") // same tx-id
      ],
      address1
    );

    expect(result).toBeErr(Cl.uint(104)); // ERR-ALREADY-PAID
  });

  it("validates payment amounts", () => {
    // Register content first
    simnet.callPublicFn(
      "revenue-split",
      "register-content",
      [
        Cl.stringAscii("insufficient-payment"),
        Cl.uint(2000000) // 2 STX price
      ],
      address1
    );

    // Payment below price should fail
    const { result } = simnet.callPublicFn(
      "revenue-split",
      "pay-for-content",
      [
        Cl.stringAscii("insufficient-payment"),
        Cl.uint(1000000), // 1 STX payment (below 2 STX price)
        Cl.stringAscii(TEST_ASSET),
        Cl.stringAscii("0xabcdef1234567890")
      ],
      address1
    );

    expect(result).toBeErr(Cl.uint(101)); // ERR-INSUFFICIENT-PAYMENT
  });
});
