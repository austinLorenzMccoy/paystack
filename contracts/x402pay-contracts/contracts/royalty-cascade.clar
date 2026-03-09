;; x402Pay Royalty Cascade Contract
;; Original creator earns perpetual royalties on every resale
;; Supports multi-level royalty chains for educational content, courses, NFTs

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u500))
(define-constant ERR-ASSET-NOT-FOUND (err u501))
(define-constant ERR-ALREADY-REGISTERED (err u502))
(define-constant ERR-INVALID-AMOUNT (err u503))
(define-constant ERR-SELF-TRANSFER (err u504))
(define-constant ERR-NOT-OWNER (err u505))

;; Data variables
(define-data-var contract-owner principal tx-sender)
(define-data-var asset-counter uint u0)

;; Maps

;; Asset registry
(define-map assets
  { asset-id: uint }
  {
    original-creator: principal,
    current-owner: principal,
    royalty-percent: uint,
    platform-percent: uint,
    last-sale-price: uint,
    total-royalties-paid: uint,
    resale-count: uint,
    metadata: (string-ascii 256)
  }
)

;; Sale history
(define-map sale-history
  { asset-id: uint, sale-index: uint }
  {
    seller: principal,
    buyer: principal,
    price: uint,
    royalty-paid: uint,
    block: uint
  }
)

;; Creator total royalties earned
(define-map creator-royalties
  { creator: principal }
  uint
)

;; Public functions

;; Mint/register a new royalty-enabled asset
(define-public (register-asset
    (royalty-percent uint)
    (platform-percent uint)
    (initial-price uint)
    (metadata (string-ascii 256))
  )
  (let (
    (asset-id (var-get asset-counter))
  )
    ;; Validate royalty + platform <= 50% (fair to resellers)
    (asserts! (<= (+ royalty-percent platform-percent) u50) ERR-INVALID-AMOUNT)
    (asserts! (> initial-price u0) ERR-INVALID-AMOUNT)

    (map-set assets
      { asset-id: asset-id }
      {
        original-creator: tx-sender,
        current-owner: tx-sender,
        royalty-percent: royalty-percent,
        platform-percent: platform-percent,
        last-sale-price: initial-price,
        total-royalties-paid: u0,
        resale-count: u0,
        metadata: metadata
      }
    )

    (var-set asset-counter (+ asset-id u1))

    (print {
      event: "asset-registered",
      asset-id: asset-id,
      creator: tx-sender,
      royalty-percent: royalty-percent,
      initial-price: initial-price
    })

    (ok asset-id)
  )
)

;; Purchase/resale an asset - royalties cascade to original creator
(define-public (purchase-asset
    (asset-id uint)
    (sale-price uint)
  )
  (let (
    (asset (unwrap! (map-get? assets { asset-id: asset-id }) ERR-ASSET-NOT-FOUND))
    (seller (get current-owner asset))
    (creator (get original-creator asset))
    (royalty-amount (/ (* sale-price (get royalty-percent asset)) u100))
    (platform-amount (/ (* sale-price (get platform-percent asset)) u100))
    (seller-amount (- sale-price (+ royalty-amount platform-amount)))
    (prev-creator-royalties (default-to u0 (map-get? creator-royalties { creator: creator })))
    (sale-index (get resale-count asset))
  )
    ;; Cannot buy from yourself
    (asserts! (not (is-eq tx-sender seller)) ERR-SELF-TRANSFER)
    (asserts! (> sale-price u0) ERR-INVALID-AMOUNT)

    ;; Pay seller
    (try! (stx-transfer? seller-amount tx-sender seller))

    ;; Pay royalty to original creator (even if seller != creator)
    (if (> royalty-amount u0)
      (begin (try! (stx-transfer? royalty-amount tx-sender creator)) true)
      true
    )

    ;; Pay platform fee
    (if (> platform-amount u0)
      (begin (try! (stx-transfer? platform-amount tx-sender (var-get contract-owner))) true)
      true
    )

    ;; Record sale history
    (map-set sale-history
      { asset-id: asset-id, sale-index: sale-index }
      {
        seller: seller,
        buyer: tx-sender,
        price: sale-price,
        royalty-paid: royalty-amount,
        block: block-height
      }
    )

    ;; Update asset ownership
    (map-set assets
      { asset-id: asset-id }
      (merge asset {
        current-owner: tx-sender,
        last-sale-price: sale-price,
        total-royalties-paid: (+ (get total-royalties-paid asset) royalty-amount),
        resale-count: (+ sale-index u1)
      })
    )

    ;; Track creator royalties
    (map-set creator-royalties
      { creator: creator }
      (+ prev-creator-royalties royalty-amount)
    )

    (print {
      event: "asset-sold",
      asset-id: asset-id,
      seller: seller,
      buyer: tx-sender,
      price: sale-price,
      royalty-to-creator: royalty-amount,
      original-creator: creator
    })

    (ok true)
  )
)

;; Read-only functions

;; Get asset details
(define-read-only (get-asset (asset-id uint))
  (ok (map-get? assets { asset-id: asset-id }))
)

;; Get sale history entry
(define-read-only (get-sale (asset-id uint) (sale-index uint))
  (ok (map-get? sale-history { asset-id: asset-id, sale-index: sale-index }))
)

;; Get total royalties earned by a creator
(define-read-only (get-total-royalties (creator principal))
  (ok (default-to u0 (map-get? creator-royalties { creator: creator })))
)

;; Get current asset count
(define-read-only (get-asset-count)
  (ok (var-get asset-counter))
)

;; Calculate royalty for a given sale price
(define-read-only (calculate-royalty (asset-id uint) (sale-price uint))
  (match (map-get? assets { asset-id: asset-id })
    asset (ok (/ (* sale-price (get royalty-percent asset)) u100))
    ERR-ASSET-NOT-FOUND
  )
)
