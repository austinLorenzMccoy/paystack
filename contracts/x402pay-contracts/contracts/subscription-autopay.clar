;; subscription-autopay.clar
;; Escrow-based recurring payments with optional PoX auto-stacking

;; -----------------------------------------------------------------------------
;; Constants & Error Codes
;; -----------------------------------------------------------------------------
(define-constant ERR-NOT-FOUND (err u600))
(define-constant ERR-INSUFFICIENT-FUNDS (err u601))
(define-constant ERR-TOO-EARLY (err u602))
(define-constant ERR-INVALID-PARAMS (err u603))
(define-constant ERR-UNAUTHORIZED (err u604))
(define-constant ERR-ALREADY-EXISTS (err u605))

(define-constant MAX-STRIKES u3)
(define-constant MIN-INTERVAL-BLOCKS u144)  ;; ~1 day (~24h) at 10-min blocks
(define-constant AUTO_STACK_LOCK_CYCLES u6)
(define-constant POX_CONTRACT 'ST000000000000000000002AMW42H.pox-4)

;; -----------------------------------------------------------------------------
;; Data Structures
;; -----------------------------------------------------------------------------
(define-map subscription-escrows
  principal
  {
    balance: uint,
    merchant: principal,
    amount-per-interval: uint,
    interval-blocks: uint,
    last-charge-block: uint,
    strikes: uint,
    auto-stack: bool,
    pox-addr: (optional { version: (buff 1), hashbytes: (buff 32) })
  }
)

(define-map merchant-stats
  principal
  {
    total-stacked: uint,
    total-charges: uint,
    last-stack-block: uint
  }
)

;; -----------------------------------------------------------------------------
;; Helpers
;; -----------------------------------------------------------------------------
(define-read-only (get-subscription (subscriber principal))
  (ok (map-get? subscription-escrows subscriber))
)

(define-read-only (charges-remaining (subscriber principal))
  (match (map-get? subscription-escrows subscriber)
    sub (/ (get balance sub) (get amount-per-interval sub))
    u0
  )
)

(define-read-only (is-charge-due (subscriber principal))
  (match (map-get? subscription-escrows subscriber)
    sub (>= (- block-height (get last-charge-block sub)) (get interval-blocks sub))
    false
  )
)

(define-private (transfer-to-contract (amount uint))
  (if (> amount u0)
    (stx-transfer? amount tx-sender (as-contract tx-sender))
    (ok true)
  )
)

(define-private (refund (recipient principal) (amount uint))
  (if (> amount u0)
    (as-contract (stx-transfer? amount tx-sender recipient))
    (ok true)
  )
)

;; -----------------------------------------------------------------------------
;; Public Functions
;; -----------------------------------------------------------------------------
(define-public (create-autopay-subscription
    (merchant principal)
    (amount-per-interval uint)
    (interval-blocks uint)
    (initial-deposit uint)
    (auto-stack bool)
    (pox-addr-opt (optional { version: (buff 1), hashbytes: (buff 32) }))
  )
  (begin
    (asserts! (> amount-per-interval u0) ERR-INVALID-PARAMS)
    (asserts! (>= interval-blocks MIN-INTERVAL-BLOCKS) ERR-INVALID-PARAMS)
    (asserts! (>= initial-deposit amount-per-interval) ERR-INVALID-PARAMS)
    (asserts! (not (is-eq merchant tx-sender)) ERR-INVALID-PARAMS)
    (asserts! (or (not auto-stack) (is-some pox-addr-opt)) ERR-INVALID-PARAMS)
    (asserts! (is-none (map-get? subscription-escrows tx-sender)) ERR-ALREADY-EXISTS)

    (try! (transfer-to-contract initial-deposit))

    (map-set subscription-escrows tx-sender {
      balance: initial-deposit,
      merchant: merchant,
      amount-per-interval: amount-per-interval,
      interval-blocks: interval-blocks,
      last-charge-block: block-height,
      strikes: u0,
      auto-stack: auto-stack,
      pox-addr: pox-addr-opt
    })

    (if (is-none (map-get? merchant-stats merchant))
      (map-set merchant-stats merchant {
        total-stacked: u0,
        total-charges: u0,
        last-stack-block: block-height
      })
      true
    )

    (print {
      event: "autopay-created",
      subscriber: tx-sender,
      merchant: merchant,
      amount: amount-per-interval,
      deposit: initial-deposit,
      interval: interval-blocks,
      auto-stack: auto-stack
    })
    (ok true)
  )
)

(define-public (charge-subscription (subscriber principal))
  (let (
    (sub (unwrap! (map-get? subscription-escrows subscriber) ERR-NOT-FOUND))
    (elapsed (- block-height (get last-charge-block sub)))
    (interval (get interval-blocks sub))
    (amount (get amount-per-interval sub))
    (merchant (get merchant sub))
    (stats (default-to { total-stacked: u0, total-charges: u0, last-stack-block: u0 }
      (map-get? merchant-stats merchant)))
  )
    (asserts! (>= elapsed interval) ERR-TOO-EARLY)

    (if (>= (get balance sub) amount)
      (begin
        ;; Transfer to merchant
        (try! (as-contract (stx-transfer? amount tx-sender merchant)))

        ;; Auto-stack if enabled (placeholder: update stats + event)
        (if (get auto-stack sub)
          (match (get pox-addr sub)
            pox-address
            (begin
              (map-set merchant-stats merchant {
                total-stacked: (+ (get total-stacked stats) amount),
                total-charges: (+ (get total-charges stats) u1),
                last-stack-block: block-height
              })
              (print {
                event: "auto-stack-scheduled",
                merchant: merchant,
                amount: amount,
                pox-address: pox-address
              })
              true
            )
            true
          )
          (begin
            (map-set merchant-stats merchant {
              total-stacked: (get total-stacked stats),
              total-charges: (+ (get total-charges stats) u1),
              last-stack-block: (get last-stack-block stats)
            })
            true
          )
        )

        ;; Update escrow
        (map-set subscription-escrows subscriber (merge sub {
          balance: (- (get balance sub) amount),
          last-charge-block: block-height,
          strikes: u0
        }))

        (print {
          event: "subscription-charged",
          subscriber: subscriber,
          merchant: merchant,
          amount: amount,
          auto-stacked: (get auto-stack sub)
        })
        (ok true)
      )
      (begin
        (let ((new-strikes (+ (get strikes sub) u1)))
          (map-set subscription-escrows subscriber (merge sub { strikes: new-strikes }))
          (print {
            event: "charge-failed",
            subscriber: subscriber,
            strikes: new-strikes,
            balance: (get balance sub)
          })
          (if (>= new-strikes MAX-STRIKES)
            (begin
              (map-delete subscription-escrows subscriber)
              (ok false)
            )
            (ok false))
        )
      )
    )
  )
)

(define-public (top-up-escrow (amount uint))
  (let ((sub (unwrap! (map-get? subscription-escrows tx-sender) ERR-NOT-FOUND)))
    (asserts! (> amount u0) ERR-INVALID-PARAMS)
    (try! (transfer-to-contract amount))
    (map-set subscription-escrows tx-sender (merge sub {
      balance: (+ (get balance sub) amount),
      strikes: u0
    }))
    (print { event: "escrow-topped-up", subscriber: tx-sender, amount: amount })
    (ok true)
  )
)

(define-public (cancel-subscription)
  (let ((sub (unwrap! (map-get? subscription-escrows tx-sender) ERR-NOT-FOUND)))
    (try! (refund tx-sender (get balance sub)))
    (map-delete subscription-escrows tx-sender)
    (print {
      event: "subscription-cancelled",
      subscriber: tx-sender,
      refunded: (get balance sub)
    })
    (ok true)
  )
)

(define-public (update-pox-address (new-pox-addr { version: (buff 1), hashbytes: (buff 32) }))
  (let ((sub (unwrap! (map-get? subscription-escrows tx-sender) ERR-NOT-FOUND)))
    (asserts! (get auto-stack sub) ERR-INVALID-PARAMS)
    (map-set subscription-escrows tx-sender (merge sub { pox-addr: (some new-pox-addr) }))
    (print {
      event: "pox-address-updated",
      subscriber: tx-sender
    })
    (ok true)
  )
)

(define-public (set-auto-stack (enabled bool))
  (let ((sub (unwrap! (map-get? subscription-escrows tx-sender) ERR-NOT-FOUND)))
    (map-set subscription-escrows tx-sender (merge sub { auto-stack: enabled }))
    (ok true)
  )
)

;; -----------------------------------------------------------------------------
;; Read-only Helpers
;; -----------------------------------------------------------------------------
(define-read-only (get-merchant-stats (merchant principal))
  (map-get? merchant-stats merchant)
)

(define-read-only (get-balance (subscriber principal))
  (match (map-get? subscription-escrows subscriber)
    sub (ok (get balance sub))
    (ok u0)
  )
)

(define-read-only (get-strikes (subscriber principal))
  (match (map-get? subscription-escrows subscriber)
    sub (ok (get strikes sub))
    (ok u0)
  )
)
