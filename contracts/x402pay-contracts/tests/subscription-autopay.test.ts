import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const merchant = accounts.get("wallet_1")!;
const subscriber = accounts.get("wallet_2")!;
const other = accounts.get("wallet_3")!;
type SimnetAccount = typeof merchant;
const poxAddress = Cl.some(
  Cl.tuple({
    version: Cl.bufferFromHex("00"),
    hashbytes: Cl.bufferFromHex("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
  })
);

describe("subscription-autopay contract", () => {

  const createSub = (options?: {
    deposit?: bigint;
    amount?: bigint;
    interval?: bigint;
    autoStack?: boolean;
    caller?: SimnetAccount;
    merchantOverride?: SimnetAccount;
  }) => {
    const {
      deposit = 2_000_000n,
      amount = 1_000_000n,
      interval = 200n,
      autoStack = false,
      caller = subscriber,
      merchantOverride = merchant
    } = options || {};

    return simnet.callPublicFn(
      "subscription-autopay",
      "create-autopay-subscription",
      [
        Cl.principal(merchantOverride),
        Cl.uint(amount),
        Cl.uint(interval),
        Cl.uint(deposit),
        Cl.bool(autoStack),
        autoStack ? poxAddress : Cl.none()
      ],
      caller
    );
  };

  it("deploys successfully", () => {
    expect(simnet.getContractSource("subscription-autopay")).toBeDefined();
  });

  it("reports remaining charges based on escrow balance", () => {
    createSub({ deposit: 5_000_000n, amount: 1_000_000n });
    const remaining = simnet.callReadOnlyFn(
      "subscription-autopay",
      "charges-remaining",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(remaining.result).toStrictEqual(Cl.uint(5));
  });

  it("creates subscription with valid params", () => {
    const { result } = createSub();
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects initial deposit smaller than interval amount", () => {
    const { result } = createSub({ deposit: 500_000n });
    expect(result).toBeErr(Cl.uint(603));
  });

  it("rejects interval below minimum", () => {
    const { result } = createSub({ interval: 10n });
    expect(result).toBeErr(Cl.uint(603));
  });

  it("rejects missing PoX address when auto-stack enabled", () => {
    const { result } = simnet.callPublicFn(
      "subscription-autopay",
      "create-autopay-subscription",
      [
        Cl.principal(merchant),
        Cl.uint(1_000_000),
        Cl.uint(200),
        Cl.uint(2_000_000),
        Cl.bool(true),
        Cl.none()
      ],
      subscriber
    );
    expect(result).toBeErr(Cl.uint(603));
  });

  it("prevents duplicate subscriptions per subscriber", () => {
    createSub();
    const { result } = createSub();
    expect(result).toBeErr(Cl.uint(605));
  });

  it("reports charge due correctly", () => {
    createSub({ interval: 150n });
    const dueNow = simnet.callReadOnlyFn(
      "subscription-autopay",
      "is-charge-due",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(dueNow.result).toStrictEqual(Cl.bool(false));

    simnet.mineEmptyBlocks(200);

    const dueLater = simnet.callReadOnlyFn(
      "subscription-autopay",
      "is-charge-due",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(dueLater.result).toStrictEqual(Cl.bool(true));
  });

  it("charges successfully and resets strikes", () => {
    createSub({ deposit: 5_000_000n });
    simnet.mineEmptyBlocks(200);

    const { result } = simnet.callPublicFn(
      "subscription-autopay",
      "charge-subscription",
      [Cl.principal(subscriber)],
      other
    );

    expect(result).toBeOk(Cl.bool(true));

    const balance = simnet.callReadOnlyFn(
      "subscription-autopay",
      "get-balance",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(balance.result).toStrictEqual(Cl.ok(Cl.uint(4_000_000)));
  });

  it("rejects charge if too early", () => {
    createSub();
    const { result } = simnet.callPublicFn(
      "subscription-autopay",
      "charge-subscription",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(result).toBeErr(Cl.uint(602));
  });

  it("increments strikes and cancels after three failures", () => {
    createSub({ deposit: 1_000_000n });
    simnet.mineEmptyBlocks(200);

    // First charge succeeds and drains escrow
    simnet.callPublicFn(
      "subscription-autopay",
      "charge-subscription",
      [Cl.principal(subscriber)],
      merchant
    );
    simnet.mineEmptyBlocks(200);

    for (let strike = 1; strike <= 3; strike++) {
      const { result } = simnet.callPublicFn(
        "subscription-autopay",
        "charge-subscription",
        [Cl.principal(subscriber)],
        merchant
      );
      if (strike < 3) {
        expect(result).toBeOk(Cl.bool(false));
        simnet.mineEmptyBlocks(200);
      } else {
        expect(result).toBeOk(Cl.bool(false));
      }
    }

    const strikes = simnet.callReadOnlyFn(
      "subscription-autopay",
      "get-strikes",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(strikes.result).toStrictEqual(Cl.ok(Cl.uint(0))); // entry removed
  });

  it("supports escrow top-ups and resets strikes", () => {
    createSub({ deposit: 1_000_000n });
    simnet.mineEmptyBlocks(200);

    simnet.callPublicFn(
      "subscription-autopay",
      "charge-subscription",
      [Cl.principal(subscriber)],
      merchant
    );

    const topUp = simnet.callPublicFn(
      "subscription-autopay",
      "top-up-escrow",
      [Cl.uint(2_000_000)],
      subscriber
    );
    expect(topUp.result).toBeOk(Cl.bool(true));

    const balance = simnet.callReadOnlyFn(
      "subscription-autopay",
      "get-balance",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(balance.result).toStrictEqual(Cl.ok(Cl.uint(2_000_000)));
  });

  it("cancels subscription and refunds balance", () => {
    createSub({ deposit: 3_000_000n });
    const cancel = simnet.callPublicFn(
      "subscription-autopay",
      "cancel-subscription",
      [],
      subscriber
    );
    expect(cancel.result).toBeOk(Cl.bool(true));

    const sub = simnet.callReadOnlyFn(
      "subscription-autopay",
      "get-subscription",
      [Cl.principal(subscriber)],
      merchant
    );
    expect(sub.result).toStrictEqual(Cl.ok(Cl.none()));
  });

  it("updates PoX address when auto-stack enabled", () => {
    createSub({ autoStack: true });

    const newAddr = Cl.tuple({
      version: Cl.bufferFromHex("00"),
      hashbytes: Cl.bufferFromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    });

    const update = simnet.callPublicFn(
      "subscription-autopay",
      "update-pox-address",
      [newAddr],
      subscriber
    );
    expect(update.result).toBeOk(Cl.bool(true));
  });

  it("allows toggling auto-stack flag", () => {
    createSub({ autoStack: true });
    const toggle = simnet.callPublicFn(
      "subscription-autopay",
      "set-auto-stack",
      [Cl.bool(false)],
      subscriber
    );
    expect(toggle.result).toBeOk(Cl.bool(true));
  });

  it("tracks merchant stacking stats after charges", () => {
    createSub({ deposit: 3_000_000n, autoStack: true });
    simnet.mineEmptyBlocks(200);

    simnet.callPublicFn(
      "subscription-autopay",
      "charge-subscription",
      [Cl.principal(subscriber)],
      merchant
    );

    const stats = simnet.callReadOnlyFn(
      "subscription-autopay",
      "get-merchant-stats",
      [Cl.principal(merchant)],
      subscriber
    );
    const statsValue = stats.result as any;
    expect(statsValue.type).toBe("some");
    const tuple = statsValue.value.value as Record<string, any>;
    expect(tuple["total-stacked"]).toStrictEqual(Cl.uint(1_000_000));
    expect(tuple["total-charges"]).toStrictEqual(Cl.uint(1));
  });
});
