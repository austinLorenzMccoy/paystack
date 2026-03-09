;; x402Pay Time-Gated Access Contract
;; Content is paid before a deadline, free after (journalism/NYT model)
;; Creators set a paywall window; once expired, content becomes public

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u400))
(define-constant ERR-CONTENT-NOT-FOUND (err u401))
(define-constant ERR-ALREADY-REGISTERED (err u402))
(define-constant ERR-ALREADY-PURCHASED (err u403))
(define-constant ERR-INVALID-AMOUNT (err u404))
(define-constant ERR-CONTENT-FREE (err u405))

;; Data variables
(define-data-var contract-owner principal tx-sender)

;; Maps

;; Content with time gate
(define-map gated-content
  { content-id: (string-ascii 256) }
  {
    creator: principal,
    price: uint,
    gate-end-block: uint,
    creator-share: uint,
    platform-share: uint,
    total-revenue: uint,
    total-purchases: uint
  }
)

;; Purchase records
(define-map purchases
  { content-id: (string-ascii 256), buyer: principal }
  {
    paid-amount: uint,
    purchased-at: uint
  }
)

;; Public functions

;; Register time-gated content
(define-public (register-gated-content
    (content-id (string-ascii 256))
    (price uint)
    (gate-duration-blocks uint)
    (creator-share uint)
    (platform-share uint)
  )
  (begin
    ;; Validate
    (asserts! (> price u0) ERR-INVALID-AMOUNT)
    (asserts! (> gate-duration-blocks u0) ERR-INVALID-AMOUNT)
    (asserts! (is-eq (+ creator-share platform-share) u100) ERR-INVALID-AMOUNT)
    ;; Ensure not already registered
    (asserts! (is-none (map-get? gated-content { content-id: content-id })) ERR-ALREADY-REGISTERED)

    (map-set gated-content
      { content-id: content-id }
      {
        creator: tx-sender,
        price: price,
        gate-end-block: (+ block-height gate-duration-blocks),
        creator-share: creator-share,
        platform-share: platform-share,
        total-revenue: u0,
        total-purchases: u0
      }
    )

    (print {
      event: "gated-content-registered",
      content-id: content-id,
      creator: tx-sender,
      price: price,
      gate-end-block: (+ block-height gate-duration-blocks)
    })

    (ok true)
  )
)

;; Purchase access to gated content (only needed during paywall window)
(define-public (purchase-access
    (content-id (string-ascii 256))
  )
  (let (
    (content (unwrap! (map-get? gated-content { content-id: content-id }) ERR-CONTENT-NOT-FOUND))
    (price (get price content))
    (creator-amount (/ (* price (get creator-share content)) u100))
    (platform-amount (/ (* price (get platform-share content)) u100))
  )
    ;; Content must still be gated (not free yet)
    (asserts! (< block-height (get gate-end-block content)) ERR-CONTENT-FREE)
    ;; Not already purchased
    (asserts! (is-none (map-get? purchases { content-id: content-id, buyer: tx-sender })) ERR-ALREADY-PURCHASED)

    ;; Transfer payments
    (try! (stx-transfer? creator-amount tx-sender (get creator content)))
    (try! (stx-transfer? platform-amount tx-sender (var-get contract-owner)))

    ;; Record purchase
    (map-set purchases
      { content-id: content-id, buyer: tx-sender }
      {
        paid-amount: price,
        purchased-at: block-height
      }
    )

    ;; Update content stats
    (map-set gated-content
      { content-id: content-id }
      (merge content {
        total-revenue: (+ (get total-revenue content) price),
        total-purchases: (+ (get total-purchases content) u1)
      })
    )

    (print {
      event: "gated-content-purchased",
      content-id: content-id,
      buyer: tx-sender,
      price: price
    })

    (ok true)
  )
)

;; Extend the gate window (creator only)
(define-public (extend-gate
    (content-id (string-ascii 256))
    (additional-blocks uint)
  )
  (let (
    (content (unwrap! (map-get? gated-content { content-id: content-id }) ERR-CONTENT-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get creator content)) ERR-NOT-AUTHORIZED)
    (asserts! (> additional-blocks u0) ERR-INVALID-AMOUNT)

    (map-set gated-content
      { content-id: content-id }
      (merge content { gate-end-block: (+ (get gate-end-block content) additional-blocks) })
    )

    (ok true)
  )
)

;; Read-only functions

;; Check if content is currently free (gate expired)
(define-read-only (is-content-free (content-id (string-ascii 256)))
  (match (map-get? gated-content { content-id: content-id })
    content (ok (>= block-height (get gate-end-block content)))
    ERR-CONTENT-NOT-FOUND
  )
)

;; Check if user has access (purchased or gate expired)
(define-read-only (has-access
    (content-id (string-ascii 256))
    (user principal)
  )
  (match (map-get? gated-content { content-id: content-id })
    content (ok (or
      (>= block-height (get gate-end-block content))
      (is-some (map-get? purchases { content-id: content-id, buyer: user }))
      (is-eq user (get creator content))
    ))
    ERR-CONTENT-NOT-FOUND
  )
)

;; Get content details
(define-read-only (get-gated-content (content-id (string-ascii 256)))
  (ok (map-get? gated-content { content-id: content-id }))
)

;; Get purchase record
(define-read-only (get-purchase
    (content-id (string-ascii 256))
    (buyer principal)
  )
  (ok (map-get? purchases { content-id: content-id, buyer: buyer }))
)

;; Get blocks remaining on gate
(define-read-only (get-blocks-remaining (content-id (string-ascii 256)))
  (match (map-get? gated-content { content-id: content-id })
    content (ok (if (>= block-height (get gate-end-block content))
      u0
      (- (get gate-end-block content) block-height)
    ))
    ERR-CONTENT-NOT-FOUND
  )
)
