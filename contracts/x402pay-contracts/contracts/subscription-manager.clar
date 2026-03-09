;; x402Pay Subscription Manager Contract
;; Recurring payment management for creator subscriptions
;; Supports monthly/annual billing cycles with auto-renewal tracking

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-PLAN-NOT-FOUND (err u201))
(define-constant ERR-ALREADY-SUBSCRIBED (err u202))
(define-constant ERR-NOT-SUBSCRIBED (err u203))
(define-constant ERR-SUBSCRIPTION-EXPIRED (err u204))
(define-constant ERR-INVALID-AMOUNT (err u205))
(define-constant ERR-INVALID-DURATION (err u206))

;; Constants
(define-constant BLOCKS-PER-MONTH u4320)   ;; ~30 days at 10-min blocks
(define-constant BLOCKS-PER-YEAR u52560)   ;; ~365 days at 10-min blocks

;; Data variables
(define-data-var contract-owner principal tx-sender)

;; Maps

;; Subscription plan definition
(define-map subscription-plans
  { creator: principal, plan-id: (string-ascii 64) }
  {
    price-monthly: uint,
    price-annual: uint,
    creator-share: uint,
    platform-share: uint,
    active: bool
  }
)

;; Active subscriber record
(define-map subscriptions
  { subscriber: principal, creator: principal, plan-id: (string-ascii 64) }
  {
    start-block: uint,
    end-block: uint,
    is-annual: bool,
    auto-renew: bool,
    total-paid: uint
  }
)

;; Subscriber count per plan
(define-map plan-subscriber-count
  { creator: principal, plan-id: (string-ascii 64) }
  uint
)

;; Revenue tracking per creator
(define-map creator-revenue
  { creator: principal }
  uint
)

;; Public functions

;; Create a new subscription plan
(define-public (create-plan
    (plan-id (string-ascii 64))
    (price-monthly uint)
    (price-annual uint)
    (creator-share uint)
    (platform-share uint)
  )
  (begin
    ;; Validate shares sum to 100
    (asserts! (is-eq (+ creator-share platform-share) u100) ERR-INVALID-AMOUNT)
    ;; Validate prices > 0
    (asserts! (> price-monthly u0) ERR-INVALID-AMOUNT)
    (asserts! (> price-annual u0) ERR-INVALID-AMOUNT)
    ;; Ensure plan doesn't already exist
    (asserts! (is-none (map-get? subscription-plans { creator: tx-sender, plan-id: plan-id })) ERR-NOT-AUTHORIZED)

    (map-set subscription-plans
      { creator: tx-sender, plan-id: plan-id }
      {
        price-monthly: price-monthly,
        price-annual: price-annual,
        creator-share: creator-share,
        platform-share: platform-share,
        active: true
      }
    )

    (map-set plan-subscriber-count
      { creator: tx-sender, plan-id: plan-id }
      u0
    )

    (print {
      event: "plan-created",
      creator: tx-sender,
      plan-id: plan-id,
      price-monthly: price-monthly,
      price-annual: price-annual
    })

    (ok true)
  )
)

;; Subscribe to a creator's plan
(define-public (subscribe
    (creator principal)
    (plan-id (string-ascii 64))
    (is-annual bool)
  )
  (let (
    (plan (unwrap! (map-get? subscription-plans { creator: creator, plan-id: plan-id }) ERR-PLAN-NOT-FOUND))
    (price (if is-annual (get price-annual plan) (get price-monthly plan)))
    (duration (if is-annual BLOCKS-PER-YEAR BLOCKS-PER-MONTH))
    (creator-amount (/ (* price (get creator-share plan)) u100))
    (platform-amount (/ (* price (get platform-share plan)) u100))
    (current-count (default-to u0 (map-get? plan-subscriber-count { creator: creator, plan-id: plan-id })))
    (prev-revenue (default-to u0 (map-get? creator-revenue { creator: creator })))
  )
    ;; Plan must be active
    (asserts! (get active plan) ERR-PLAN-NOT-FOUND)
    ;; Not already subscribed (or subscription expired)
    (asserts! (is-none (map-get? subscriptions { subscriber: tx-sender, creator: creator, plan-id: plan-id }))
      ERR-ALREADY-SUBSCRIBED)

    ;; Transfer payment to creator
    (try! (stx-transfer? creator-amount tx-sender creator))
    ;; Transfer platform fee
    (try! (stx-transfer? platform-amount tx-sender (var-get contract-owner)))

    ;; Record subscription
    (map-set subscriptions
      { subscriber: tx-sender, creator: creator, plan-id: plan-id }
      {
        start-block: block-height,
        end-block: (+ block-height duration),
        is-annual: is-annual,
        auto-renew: true,
        total-paid: price
      }
    )

    ;; Increment subscriber count
    (map-set plan-subscriber-count
      { creator: creator, plan-id: plan-id }
      (+ current-count u1)
    )

    ;; Track revenue
    (map-set creator-revenue { creator: creator } (+ prev-revenue price))

    (print {
      event: "subscription-started",
      subscriber: tx-sender,
      creator: creator,
      plan-id: plan-id,
      price: price,
      is-annual: is-annual,
      end-block: (+ block-height duration)
    })

    (ok true)
  )
)

;; Renew an existing subscription
(define-public (renew
    (creator principal)
    (plan-id (string-ascii 64))
  )
  (let (
    (plan (unwrap! (map-get? subscription-plans { creator: creator, plan-id: plan-id }) ERR-PLAN-NOT-FOUND))
    (sub (unwrap! (map-get? subscriptions { subscriber: tx-sender, creator: creator, plan-id: plan-id }) ERR-NOT-SUBSCRIBED))
    (is-annual (get is-annual sub))
    (price (if is-annual (get price-annual plan) (get price-monthly plan)))
    (duration (if is-annual BLOCKS-PER-YEAR BLOCKS-PER-MONTH))
    (creator-amount (/ (* price (get creator-share plan)) u100))
    (platform-amount (/ (* price (get platform-share plan)) u100))
    (prev-revenue (default-to u0 (map-get? creator-revenue { creator: creator })))
  )
    ;; Transfer payment
    (try! (stx-transfer? creator-amount tx-sender creator))
    (try! (stx-transfer? platform-amount tx-sender (var-get contract-owner)))

    ;; Update subscription with new end block
    (map-set subscriptions
      { subscriber: tx-sender, creator: creator, plan-id: plan-id }
      {
        start-block: block-height,
        end-block: (+ block-height duration),
        is-annual: is-annual,
        auto-renew: (get auto-renew sub),
        total-paid: (+ (get total-paid sub) price)
      }
    )

    ;; Track revenue
    (map-set creator-revenue { creator: creator } (+ prev-revenue price))

    (print {
      event: "subscription-renewed",
      subscriber: tx-sender,
      creator: creator,
      plan-id: plan-id,
      price: price
    })

    (ok true)
  )
)

;; Cancel subscription (no refund, access until end-block)
(define-public (cancel
    (creator principal)
    (plan-id (string-ascii 64))
  )
  (let (
    (sub (unwrap! (map-get? subscriptions { subscriber: tx-sender, creator: creator, plan-id: plan-id }) ERR-NOT-SUBSCRIBED))
    (current-count (default-to u0 (map-get? plan-subscriber-count { creator: creator, plan-id: plan-id })))
  )
    ;; Update auto-renew to false (access continues until end-block)
    (map-set subscriptions
      { subscriber: tx-sender, creator: creator, plan-id: plan-id }
      (merge sub { auto-renew: false })
    )

    ;; Decrement subscriber count
    (map-set plan-subscriber-count
      { creator: creator, plan-id: plan-id }
      (if (> current-count u0) (- current-count u1) u0)
    )

    (print {
      event: "subscription-cancelled",
      subscriber: tx-sender,
      creator: creator,
      plan-id: plan-id
    })

    (ok true)
  )
)

;; Deactivate a plan (creator only)
(define-public (deactivate-plan (plan-id (string-ascii 64)))
  (let (
    (plan (unwrap! (map-get? subscription-plans { creator: tx-sender, plan-id: plan-id }) ERR-PLAN-NOT-FOUND))
  )
    (map-set subscription-plans
      { creator: tx-sender, plan-id: plan-id }
      (merge plan { active: false })
    )
    (ok true)
  )
)

;; Read-only functions

;; Check if a subscription is currently active
(define-read-only (is-subscription-active
    (subscriber principal)
    (creator principal)
    (plan-id (string-ascii 64))
  )
  (match (map-get? subscriptions { subscriber: subscriber, creator: creator, plan-id: plan-id })
    sub (ok (>= (get end-block sub) block-height))
    (ok false)
  )
)

;; Get subscription details
(define-read-only (get-subscription
    (subscriber principal)
    (creator principal)
    (plan-id (string-ascii 64))
  )
  (ok (map-get? subscriptions { subscriber: subscriber, creator: creator, plan-id: plan-id }))
)

;; Get plan details
(define-read-only (get-plan
    (creator principal)
    (plan-id (string-ascii 64))
  )
  (ok (map-get? subscription-plans { creator: creator, plan-id: plan-id }))
)

;; Get subscriber count for a plan
(define-read-only (get-subscriber-count
    (creator principal)
    (plan-id (string-ascii 64))
  )
  (ok (default-to u0 (map-get? plan-subscriber-count { creator: creator, plan-id: plan-id })))
)

;; Get total revenue for a creator
(define-read-only (get-creator-revenue (creator principal))
  (ok (default-to u0 (map-get? creator-revenue { creator: creator })))
)
