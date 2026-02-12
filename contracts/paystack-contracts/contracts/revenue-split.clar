;; PayStack Revenue Split Contract
;; Clarity smart contract for programmable revenue distribution
;; Built for Stacks blockchain - Bitcoin-native creator monetization

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-PAYMENT (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant ERR-CONTENT-NOT-FOUND (err u103))
(define-constant ERR-ALREADY-PAID (err u104))

;; Data variables
(define-data-var contract-owner principal tx-sender)

;; Maps
(define-map content-prices { content-id: (string-ascii 256) } uint)
(define-map content-creators { content-id: (string-ascii 256) } principal)
(define-map revenue-splits { content-id: (string-ascii 256) }
  {
    creator-share: uint,
    platform-share: uint,
    collaborator-share: uint,
    collaborator-address: (optional principal)
  }
)
(define-map payment-history
  {
    content-id: (string-ascii 256),
    payer: principal,
    tx-id: (string-ascii 64)
  }
  {
    amount: uint,
    asset: (string-ascii 10),
    timestamp: uint
  }
)

;; Public functions

;; Set content price and revenue split
(define-public (set-content-config
    (content-id (string-ascii 256))
    (price uint)
    (creator-share-percent uint)
    (platform-share-percent uint)
    (collaborator-share-percent uint)
    (collaborator-address (optional principal))
  )
  (let (
    (creator (unwrap-panic (map-get? content-creators { content-id: content-id })))
  )
    ;; Only creator can set config
    (asserts! (is-eq tx-sender creator) ERR-NOT-AUTHORIZED)

    ;; Validate percentages add up to 100
    (asserts! (is-eq (+ creator-share-percent (+ platform-share-percent collaborator-share-percent)) u100) ERR-INVALID-AMOUNT)

    ;; Set price
    (map-set content-prices { content-id: content-id } price)

    ;; Set revenue split
    (map-set revenue-splits { content-id: content-id }
      {
        creator-share: creator-share-percent,
        platform-share: platform-share-percent,
        collaborator-share: collaborator-share-percent,
        collaborator-address: collaborator-address
      }
    )

    (ok true)
  )
)

;; Process payment and distribute revenue
(define-public (pay-for-content
    (content-id (string-ascii 256))
    (payment-amount uint)
    (asset (string-ascii 10))
    (tx-id (string-ascii 64))
  )
  (begin
    (let (
      (price (default-to u0 (map-get? content-prices { content-id: content-id })))
      (splits (unwrap! (map-get? revenue-splits { content-id: content-id }) ERR-CONTENT-NOT-FOUND))
      (creator (unwrap! (map-get? content-creators { content-id: content-id }) ERR-CONTENT-NOT-FOUND))
      (creator-share (/ (* payment-amount (get creator-share splits)) u100))
      (platform-share (/ (* payment-amount (get platform-share splits)) u100))
      (collaborator-share (/ (* payment-amount (get collaborator-share splits)) u100))
    )
    (begin
      ;; Verify payment amount meets minimum
      (asserts! (>= payment-amount price) ERR-INSUFFICIENT-PAYMENT)

      ;; Check for duplicate payment
      (asserts! (is-none (map-get? payment-history { content-id: content-id, payer: tx-sender, tx-id: tx-id })) ERR-ALREADY-PAID)

      ;; Transfer to creator
      (try! (distribute-payment creator creator-share asset))

      ;; Transfer to platform (contract owner)
      (try! (distribute-payment (var-get contract-owner) platform-share asset))

      ;; Transfer to collaborator if exists
      (match (get collaborator-address splits)
        collaborator-addr (try! (distribute-payment collaborator-addr collaborator-share asset))
        true ;; No collaborator, continue
      )

      ;; Record payment history
      (map-set payment-history
        { content-id: content-id, payer: tx-sender, tx-id: tx-id }
        {
          amount: payment-amount,
          asset: asset,
          timestamp: block-height
        }
      )

      ;; Emit payment event
      (print {
        event: "payment-processed",
        content-id: content-id,
        payer: tx-sender,
        amount: payment-amount,
        asset: asset,
        creator: creator,
        timestamp: block-height
      })

      (ok true)
    )
    )
  )
)
;; Helper function to distribute payments based on asset type
(define-private (distribute-payment (recipient principal) (amount uint) (asset (string-ascii 10)))
  (if (is-eq asset "STX")
    (stx-transfer? amount tx-sender recipient)
    ;; For other assets, would need additional contract calls
    ;; This is a simplified version - in production, would handle sBTC, USDCx, etc.
    (ok true)
  )
)

;; Register new content
(define-public (register-content
    (content-id (string-ascii 256))
    (price uint)
  )
  (begin
    ;; Check content doesn't already exist
    (asserts! (is-none (map-get? content-creators { content-id: content-id })) ERR-NOT-AUTHORIZED)

    ;; Register creator
    (map-set content-creators { content-id: content-id } tx-sender)

    ;; Set default price
    (map-set content-prices { content-id: content-id } price)

    ;; Set default 80/20 split (80% creator, 20% platform)
    (map-set revenue-splits { content-id: content-id }
      {
        creator-share: u80,
        platform-share: u20,
        collaborator-share: u0,
        collaborator-address: none
      }
    )

    (ok true)
  )
)

;; Read-only functions

;; Get content price
(define-read-only (get-content-price (content-id (string-ascii 256)))
  (ok (default-to u0 (map-get? content-prices { content-id: content-id })))
)

;; Get revenue split configuration
(define-read-only (get-revenue-split (content-id (string-ascii 256)))
  (ok (map-get? revenue-splits { content-id: content-id }))
)

;; Get content creator
(define-read-only (get-content-creator (content-id (string-ascii 256)))
  (ok (map-get? content-creators { content-id: content-id }))
)

;; Check if payment was made
(define-read-only (get-payment-status
    (content-id (string-ascii 256))
    (payer principal)
    (tx-id (string-ascii 64))
  )
  (ok (is-some (map-get? payment-history { content-id: content-id, payer: payer, tx-id: tx-id })))
)

