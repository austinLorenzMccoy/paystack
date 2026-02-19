;; revenue-optimizer.clar
;; Automatic DeFi yield optimization for creator revenue

;; -----------------------------------------------------------------------------
;; Constants & Error Codes
;; -----------------------------------------------------------------------------
(define-constant ERR-NOT-AUTHORIZED (err u700))
(define-constant ERR-INVALID-AMOUNT (err u701))
(define-constant ERR-ORACLE-FAILURE (err u702))
(define-constant ERR-STRATEGY-FAILED (err u703))
(define-constant ERR-INSUFFICIENT-BALANCE (err u704))
(define-constant ERR-REBALANCE-TOO-SOON (err u705))

(define-constant MIN-REBALANCE-INTERVAL u4320) ;; ~30 days at 10-min blocks
(define-constant MIN-STAKE-AMOUNT u1000000) ;; 1 STX minimum
(define-constant POX-CONTRACT 'ST000000000000000000002AMW42H.pox-4)

;; Strategy identifiers
(define-constant STRATEGY-POX "pox-stacking")
(define-constant STRATEGY-ALEX "alex-farming")
(define-constant STRATEGY-BITFLOW "bitflow-lp")
(define-constant STRATEGY-NONE "none")

;; -----------------------------------------------------------------------------
;; Data Structures
;; -----------------------------------------------------------------------------
(define-map creator-strategies
  principal
  {
    current-strategy: (string-ascii 20),
    total-deployed: uint,
    last-rebalance-block: uint,
    pox-address: (optional { version: (buff 1), hashbytes: (buff 32) })
  }
)

(define-map strategy-balances
  { creator: principal, strategy: (string-ascii 20) }
  { amount: uint }
)

;; Mock oracle data (in production, would call external oracles)
(define-map apy-rates
  (string-ascii 20)
  { apy-bps: uint } ;; APY in basis points (e.g., 1000 = 10%)
)

;; -----------------------------------------------------------------------------
;; Read-Only Functions
;; -----------------------------------------------------------------------------
(define-read-only (get-creator-strategy (creator principal))
  (ok (map-get? creator-strategies creator))
)

(define-read-only (get-strategy-balance (creator principal) (strategy (string-ascii 20)))
  (ok (map-get? strategy-balances { creator: creator, strategy: strategy }))
)

(define-read-only (get-apy-rate (strategy (string-ascii 20)))
  (ok (map-get? apy-rates strategy))
)

(define-read-only (can-rebalance (creator principal))
  (match (map-get? creator-strategies creator)
    strat (ok (>= (- block-height (get last-rebalance-block strat)) MIN-REBALANCE-INTERVAL))
    (ok true)
  )
)

;; -----------------------------------------------------------------------------
;; Admin Functions (Mock Oracle Updates)
;; -----------------------------------------------------------------------------
(define-public (set-apy-rate (strategy (string-ascii 20)) (apy-bps uint))
  (begin
    ;; In production, only oracle contract could call this
    (map-set apy-rates strategy { apy-bps: apy-bps })
    (ok true)
  )
)

;; -----------------------------------------------------------------------------
;; Core Optimization Logic
;; -----------------------------------------------------------------------------
(define-private (get-best-strategy)
  (let (
    (pox-apy (get apy-bps (default-to { apy-bps: u0 } (map-get? apy-rates STRATEGY-POX))))
    (alex-apy (get apy-bps (default-to { apy-bps: u0 } (map-get? apy-rates STRATEGY-ALEX))))
    (bitflow-apy (get apy-bps (default-to { apy-bps: u0 } (map-get? apy-rates STRATEGY-BITFLOW))))
  )
    (if (and (>= pox-apy alex-apy) (>= pox-apy bitflow-apy))
      STRATEGY-POX
      (if (>= alex-apy bitflow-apy)
        STRATEGY-ALEX
        STRATEGY-BITFLOW
      )
    )
  )
)

(define-public (optimize-yield 
    (amount uint) 
    (pox-addr-opt (optional { version: (buff 1), hashbytes: (buff 32) }))
  )
  (let (
    (creator tx-sender)
    (best-strategy (get-best-strategy))
    (existing-strat (map-get? creator-strategies creator))
  )
    (asserts! (>= amount MIN-STAKE-AMOUNT) ERR-INVALID-AMOUNT)
    
    ;; Check rebalance interval if strategy exists
    (asserts! 
      (match existing-strat
        strat (>= (- block-height (get last-rebalance-block strat)) MIN-REBALANCE-INTERVAL)
        true
      )
      ERR-REBALANCE-TOO-SOON
    )

    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    ;; Route to best strategy
    (unwrap-panic (route-to-strategy amount creator best-strategy pox-addr-opt))

    ;; Update creator strategy record
    (map-set creator-strategies creator {
      current-strategy: best-strategy,
      total-deployed: (+ amount (get total-deployed (default-to { current-strategy: STRATEGY-NONE, total-deployed: u0, last-rebalance-block: u0, pox-address: none } existing-strat))),
      last-rebalance-block: block-height,
      pox-address: pox-addr-opt
    })

    (ok best-strategy)
  )
)

(define-private (route-to-strategy 
    (amount uint) 
    (creator principal) 
    (strategy (string-ascii 20))
    (pox-addr-opt (optional { version: (buff 1), hashbytes: (buff 32) }))
  )
  (begin
    ;; Update strategy balance
    (map-set strategy-balances 
      { creator: creator, strategy: strategy }
      { amount: (+ amount (get amount (default-to { amount: u0 } (map-get? strategy-balances { creator: creator, strategy: strategy })))) }
    )

    ;; Execute strategy-specific logic (stubs always return ok for now)
    (if (is-eq strategy STRATEGY-POX)
      (stake-to-pox amount creator pox-addr-opt)
      (if (is-eq strategy STRATEGY-ALEX)
        (stake-to-alex amount creator)
        (if (is-eq strategy STRATEGY-BITFLOW)
          (stake-to-bitflow amount creator)
          (ok true)
        )
      )
    )
  )
)

;; -----------------------------------------------------------------------------
;; Strategy Implementation Stubs
;; -----------------------------------------------------------------------------
(define-private (stake-to-pox 
    (amount uint) 
    (creator principal)
    (pox-addr-opt (optional { version: (buff 1), hashbytes: (buff 32) }))
  )
  (begin
    ;; In production: delegate-stack-stx to PoX-4
    ;; For now, simulate successful stacking
    (print {
      event: "pox-staking-initiated",
      creator: creator,
      amount: amount,
      pox-address: pox-addr-opt
    })
    (ok true)
  )
)

(define-private (stake-to-alex (amount uint) (creator principal))
  (begin
    ;; In production: contract-call to ALEX vault
    (print {
      event: "alex-farming-initiated",
      creator: creator,
      amount: amount
    })
    (ok true)
  )
)

(define-private (stake-to-bitflow (amount uint) (creator principal))
  (begin
    ;; In production: contract-call to Bitflow LP
    (print {
      event: "bitflow-lp-initiated",
      creator: creator,
      amount: amount
    })
    (ok true)
  )
)

;; -----------------------------------------------------------------------------
;; Withdrawal Functions
;; -----------------------------------------------------------------------------
(define-public (withdraw-from-strategy (strategy (string-ascii 20)) (amount uint))
  (let (
    (creator tx-sender)
    (balance-entry (unwrap! (map-get? strategy-balances { creator: creator, strategy: strategy }) ERR-INSUFFICIENT-BALANCE))
    (current-balance (get amount balance-entry))
  )
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)

    ;; Update balance
    (map-set strategy-balances
      { creator: creator, strategy: strategy }
      { amount: (- current-balance amount) }
    )

    ;; Transfer back to creator
    (try! (as-contract (stx-transfer? amount tx-sender creator)))

    (print {
      event: "strategy-withdrawal",
      creator: creator,
      strategy: strategy,
      amount: amount
    })

    (ok true)
  )
)

(define-public (rebalance-strategy (new-pox-addr-opt (optional { version: (buff 1), hashbytes: (buff 32) })))
  (let (
    (creator tx-sender)
    (current-strat (unwrap! (map-get? creator-strategies creator) ERR-NOT-AUTHORIZED))
    (old-strategy (get current-strategy current-strat))
    (deployed-amount (get total-deployed current-strat))
    (best-strategy (get-best-strategy))
  )
    (asserts! (>= (- block-height (get last-rebalance-block current-strat)) MIN-REBALANCE-INTERVAL) ERR-REBALANCE-TOO-SOON)

    ;; If strategy hasn't changed, just update timestamp
    (if (is-eq old-strategy best-strategy)
      (begin
        (map-set creator-strategies creator (merge current-strat { last-rebalance-block: block-height }))
        (ok best-strategy)
      )
      (begin
        ;; Withdraw from old strategy and deploy to new one
        ;; (Simplified: in production would actually move funds)
        (map-set creator-strategies creator {
          current-strategy: best-strategy,
          total-deployed: deployed-amount,
          last-rebalance-block: block-height,
          pox-address: new-pox-addr-opt
        })

        (print {
          event: "strategy-rebalanced",
          creator: creator,
          old-strategy: old-strategy,
          new-strategy: best-strategy,
          amount: deployed-amount
        })

        (ok best-strategy)
      )
    )
  )
)
