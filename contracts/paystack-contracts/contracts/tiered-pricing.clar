;; x402Pay Tiered Pricing Contract
;; Dynamic pricing based on buyer tier (student, business, nonprofit, etc.)
;; Supports verified tier assignments and per-content tier overrides

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u600))
(define-constant ERR-CONTENT-NOT-FOUND (err u601))
(define-constant ERR-TIER-NOT-FOUND (err u602))
(define-constant ERR-ALREADY-REGISTERED (err u603))
(define-constant ERR-ALREADY-PURCHASED (err u604))
(define-constant ERR-INVALID-AMOUNT (err u605))
(define-constant ERR-TIER-NOT-ASSIGNED (err u606))

;; Tier constants
(define-constant TIER-STANDARD u1)
(define-constant TIER-STUDENT u2)
(define-constant TIER-NONPROFIT u3)
(define-constant TIER-BUSINESS u4)

;; Data variables
(define-data-var contract-owner principal tx-sender)

;; Maps

;; User tier assignment (verified by contract owner / oracle)
(define-map user-tiers
  { user: principal }
  {
    tier: uint,
    verified: bool,
    assigned-at: uint
  }
)

;; Content with tiered pricing
(define-map tiered-content
  { content-id: (string-ascii 256) }
  {
    creator: principal,
    price-standard: uint,
    price-student: uint,
    price-nonprofit: uint,
    price-business: uint,
    creator-share: uint,
    platform-share: uint,
    total-revenue: uint,
    total-purchases: uint
  }
)

;; Purchase records
(define-map tier-purchases
  { content-id: (string-ascii 256), buyer: principal }
  {
    tier-used: uint,
    price-paid: uint,
    purchased-at: uint
  }
)

;; Public functions

;; Assign a tier to a user (contract owner / oracle only)
(define-public (assign-tier
    (user principal)
    (tier uint)
  )
  (begin
    ;; Only contract owner can assign tiers
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    ;; Validate tier
    (asserts! (and (>= tier TIER-STANDARD) (<= tier TIER-BUSINESS)) ERR-TIER-NOT-FOUND)

    (map-set user-tiers
      { user: user }
      {
        tier: tier,
        verified: true,
        assigned-at: block-height
      }
    )

    (print {
      event: "tier-assigned",
      user: user,
      tier: tier
    })

    (ok true)
  )
)

;; Self-declare tier (unverified - can be verified later by oracle)
(define-public (declare-tier (tier uint))
  (begin
    (asserts! (and (>= tier TIER-STANDARD) (<= tier TIER-BUSINESS)) ERR-TIER-NOT-FOUND)

    (map-set user-tiers
      { user: tx-sender }
      {
        tier: tier,
        verified: false,
        assigned-at: block-height
      }
    )

    (ok true)
  )
)

;; Register content with tiered pricing
(define-public (register-tiered-content
    (content-id (string-ascii 256))
    (price-standard uint)
    (price-student uint)
    (price-nonprofit uint)
    (price-business uint)
    (creator-share uint)
    (platform-share uint)
  )
  (begin
    ;; Validate
    (asserts! (> price-standard u0) ERR-INVALID-AMOUNT)
    (asserts! (is-eq (+ creator-share platform-share) u100) ERR-INVALID-AMOUNT)
    ;; Ensure not already registered
    (asserts! (is-none (map-get? tiered-content { content-id: content-id })) ERR-ALREADY-REGISTERED)

    (map-set tiered-content
      { content-id: content-id }
      {
        creator: tx-sender,
        price-standard: price-standard,
        price-student: price-student,
        price-nonprofit: price-nonprofit,
        price-business: price-business,
        creator-share: creator-share,
        platform-share: platform-share,
        total-revenue: u0,
        total-purchases: u0
      }
    )

    (print {
      event: "tiered-content-registered",
      content-id: content-id,
      creator: tx-sender,
      price-standard: price-standard,
      price-student: price-student,
      price-nonprofit: price-nonprofit,
      price-business: price-business
    })

    (ok true)
  )
)

;; Purchase content at tier-appropriate price
(define-public (purchase-tiered
    (content-id (string-ascii 256))
  )
  (let (
    (content (unwrap! (map-get? tiered-content { content-id: content-id }) ERR-CONTENT-NOT-FOUND))
    (buyer-tier-data (default-to { tier: TIER-STANDARD, verified: false, assigned-at: u0 }
      (map-get? user-tiers { user: tx-sender })))
    (buyer-tier (get tier buyer-tier-data))
    (price (if (is-eq buyer-tier TIER-STUDENT) (get price-student content)
            (if (is-eq buyer-tier TIER-NONPROFIT) (get price-nonprofit content)
            (if (is-eq buyer-tier TIER-BUSINESS) (get price-business content)
            (get price-standard content)))))
    (creator-amount (/ (* price (get creator-share content)) u100))
    (platform-amount (/ (* price (get platform-share content)) u100))
  )
    ;; Not already purchased
    (asserts! (is-none (map-get? tier-purchases { content-id: content-id, buyer: tx-sender })) ERR-ALREADY-PURCHASED)

    ;; Transfer payments
    (try! (stx-transfer? creator-amount tx-sender (get creator content)))
    (try! (stx-transfer? platform-amount tx-sender (var-get contract-owner)))

    ;; Record purchase
    (map-set tier-purchases
      { content-id: content-id, buyer: tx-sender }
      {
        tier-used: buyer-tier,
        price-paid: price,
        purchased-at: block-height
      }
    )

    ;; Update content stats
    (map-set tiered-content
      { content-id: content-id }
      (merge content {
        total-revenue: (+ (get total-revenue content) price),
        total-purchases: (+ (get total-purchases content) u1)
      })
    )

    (print {
      event: "tiered-purchase",
      content-id: content-id,
      buyer: tx-sender,
      tier: buyer-tier,
      price: price
    })

    (ok true)
  )
)

;; Read-only functions

;; Get user's tier
(define-read-only (get-user-tier (user principal))
  (ok (map-get? user-tiers { user: user }))
)

;; Get content details
(define-read-only (get-tiered-content (content-id (string-ascii 256)))
  (ok (map-get? tiered-content { content-id: content-id }))
)

;; Get price for a specific user (based on their tier)
(define-read-only (get-price-for-user
    (content-id (string-ascii 256))
    (user principal)
  )
  (let (
    (content (map-get? tiered-content { content-id: content-id }))
    (tier-data (default-to { tier: TIER-STANDARD, verified: false, assigned-at: u0 }
      (map-get? user-tiers { user: user })))
    (tier (get tier tier-data))
  )
    (match content
      c (ok (if (is-eq tier TIER-STUDENT) (get price-student c)
          (if (is-eq tier TIER-NONPROFIT) (get price-nonprofit c)
          (if (is-eq tier TIER-BUSINESS) (get price-business c)
          (get price-standard c)))))
      ERR-CONTENT-NOT-FOUND
    )
  )
)

;; Get purchase record
(define-read-only (get-tier-purchase
    (content-id (string-ascii 256))
    (buyer principal)
  )
  (ok (map-get? tier-purchases { content-id: content-id, buyer: buyer }))
)
