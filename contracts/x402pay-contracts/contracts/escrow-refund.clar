;; x402Pay Escrow with Refunds Contract
;; Refundable payments for service completion with dispute resolution
;; Funds held in escrow until service delivered or refund triggered

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-ESCROW-NOT-FOUND (err u301))
(define-constant ERR-ALREADY-RELEASED (err u302))
(define-constant ERR-ALREADY-REFUNDED (err u303))
(define-constant ERR-INVALID-AMOUNT (err u304))
(define-constant ERR-ESCROW-EXPIRED (err u305))
(define-constant ERR-NOT-EXPIRED (err u306))
(define-constant ERR-DISPUTE-ACTIVE (err u307))

;; Escrow states
(define-constant STATE-ACTIVE u1)
(define-constant STATE-RELEASED u2)
(define-constant STATE-REFUNDED u3)
(define-constant STATE-DISPUTED u4)

;; Data variables
(define-data-var contract-owner principal tx-sender)
(define-data-var escrow-counter uint u0)

;; Maps

;; Escrow record
(define-map escrows
  { escrow-id: uint }
  {
    payer: principal,
    payee: principal,
    amount: uint,
    platform-fee: uint,
    state: uint,
    created-at: uint,
    expires-at: uint,
    description: (string-ascii 256)
  }
)

;; Dispute record
(define-map disputes
  { escrow-id: uint }
  {
    reason: (string-ascii 256),
    raised-by: principal,
    raised-at: uint
  }
)

;; Public functions

;; Create a new escrow payment
(define-public (create-escrow
    (payee principal)
    (amount uint)
    (platform-fee-percent uint)
    (expiry-blocks uint)
    (description (string-ascii 256))
  )
  (let (
    (escrow-id (var-get escrow-counter))
    (platform-fee (/ (* amount platform-fee-percent) u100))
    (total (+ amount platform-fee))
  )
    ;; Validate
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (> expiry-blocks u0) ERR-INVALID-AMOUNT)

    ;; Transfer funds to contract (held in escrow)
    (try! (stx-transfer? total tx-sender (as-contract tx-sender)))

    ;; Record escrow
    (map-set escrows
      { escrow-id: escrow-id }
      {
        payer: tx-sender,
        payee: payee,
        amount: amount,
        platform-fee: platform-fee,
        state: STATE-ACTIVE,
        created-at: block-height,
        expires-at: (+ block-height expiry-blocks),
        description: description
      }
    )

    ;; Increment counter
    (var-set escrow-counter (+ escrow-id u1))

    (print {
      event: "escrow-created",
      escrow-id: escrow-id,
      payer: tx-sender,
      payee: payee,
      amount: amount,
      expires-at: (+ block-height expiry-blocks)
    })

    (ok escrow-id)
  )
)

;; Release escrow to payee (payer confirms delivery)
(define-public (release-escrow (escrow-id uint))
  (let (
    (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND))
  )
    ;; Only payer can release
    (asserts! (is-eq tx-sender (get payer escrow)) ERR-NOT-AUTHORIZED)
    ;; Must be active
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-ALREADY-RELEASED)

    ;; Transfer amount to payee from contract
    (try! (as-contract (stx-transfer? (get amount escrow) tx-sender (get payee escrow))))

    ;; Update state
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { state: STATE-RELEASED })
    )

    (print {
      event: "escrow-released",
      escrow-id: escrow-id,
      payee: (get payee escrow),
      amount: (get amount escrow)
    })

    (ok true)
  )
)

;; Refund escrow to payer (payee agrees or expiry reached)
(define-public (refund-escrow (escrow-id uint))
  (let (
    (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND))
  )
    ;; Must be active
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-ALREADY-REFUNDED)
    ;; Either payee agrees to refund OR escrow has expired
    (asserts! (or
      (is-eq tx-sender (get payee escrow))
      (>= block-height (get expires-at escrow))
    ) ERR-NOT-AUTHORIZED)

    ;; Transfer amount back to payer from contract
    (try! (as-contract (stx-transfer? (get amount escrow) tx-sender (get payer escrow))))

    ;; Update state
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { state: STATE-REFUNDED })
    )

    (print {
      event: "escrow-refunded",
      escrow-id: escrow-id,
      payer: (get payer escrow),
      amount: (get amount escrow)
    })

    (ok true)
  )
)

;; Raise a dispute on an escrow
(define-public (raise-dispute
    (escrow-id uint)
    (reason (string-ascii 256))
  )
  (let (
    (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND))
  )
    ;; Must be active
    (asserts! (is-eq (get state escrow) STATE-ACTIVE) ERR-ALREADY-RELEASED)
    ;; Only payer or payee can dispute
    (asserts! (or
      (is-eq tx-sender (get payer escrow))
      (is-eq tx-sender (get payee escrow))
    ) ERR-NOT-AUTHORIZED)

    ;; Record dispute
    (map-set disputes
      { escrow-id: escrow-id }
      {
        reason: reason,
        raised-by: tx-sender,
        raised-at: block-height
      }
    )

    ;; Update state to disputed
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { state: STATE-DISPUTED })
    )

    (print {
      event: "escrow-disputed",
      escrow-id: escrow-id,
      raised-by: tx-sender,
      reason: reason
    })

    (ok true)
  )
)

;; Resolve dispute (contract owner only - platform arbitration)
(define-public (resolve-dispute
    (escrow-id uint)
    (release-to-payee bool)
  )
  (let (
    (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND))
  )
    ;; Only contract owner can resolve
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    ;; Must be disputed
    (asserts! (is-eq (get state escrow) STATE-DISPUTED) ERR-ESCROW-NOT-FOUND)

    (if release-to-payee
      ;; Release to payee
      (begin
        (try! (as-contract (stx-transfer? (get amount escrow) tx-sender (get payee escrow))))
        (map-set escrows { escrow-id: escrow-id } (merge escrow { state: STATE-RELEASED }))
      )
      ;; Refund to payer
      (begin
        (try! (as-contract (stx-transfer? (get amount escrow) tx-sender (get payer escrow))))
        (map-set escrows { escrow-id: escrow-id } (merge escrow { state: STATE-REFUNDED }))
      )
    )

    (print {
      event: "dispute-resolved",
      escrow-id: escrow-id,
      release-to-payee: release-to-payee
    })

    (ok true)
  )
)

;; Read-only functions

;; Get escrow details
(define-read-only (get-escrow (escrow-id uint))
  (ok (map-get? escrows { escrow-id: escrow-id }))
)

;; Get dispute details
(define-read-only (get-dispute (escrow-id uint))
  (ok (map-get? disputes { escrow-id: escrow-id }))
)

;; Check if escrow is expired
(define-read-only (is-expired (escrow-id uint))
  (match (map-get? escrows { escrow-id: escrow-id })
    escrow (ok (>= block-height (get expires-at escrow)))
    (ok false)
  )
)

;; Get current escrow count
(define-read-only (get-escrow-count)
  (ok (var-get escrow-counter))
)
