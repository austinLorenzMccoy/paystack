;; StackingDAO Liquid Staking Adapter
;; Enables creators to stake STX and receive stSTX liquid staking tokens
;; stSTX accrues BTC rewards while remaining liquid and tradeable

;; -----------------------------------------------------------------------------
;; Constants & Error Codes
;; -----------------------------------------------------------------------------
(define-constant ERR-NOT-AUTHORIZED (err u800))
(define-constant ERR-INVALID-AMOUNT (err u801))
(define-constant ERR-STACKING-FAILED (err u802))
(define-constant ERR-UNSTAKING-FAILED (err u803))

;; StackingDAO mainnet: SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v1
;; For testnet, using placeholder
(define-constant STACKING-DAO-CORE 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stacking-dao-core-v1)
(define-constant MIN-STAKE-AMOUNT u1000000) ;; 1 STX minimum

;; -----------------------------------------------------------------------------
;; Data Maps
;; -----------------------------------------------------------------------------
(define-map user-stakes
  principal
  {
    stx-staked: uint,
    ststx-received: uint,
    staked-at-block: uint
  }
)

;; -----------------------------------------------------------------------------
;; Read-Only Functions
;; -----------------------------------------------------------------------------
(define-read-only (get-user-stake (user principal))
  (ok (map-get? user-stakes user))
)

(define-read-only (get-exchange-rate)
  ;; In production: fetch from StackingDAO contract
  ;; 1 STX = 0.98 stSTX (2% protocol fee)
  (ok u980000)
)

;; -----------------------------------------------------------------------------
;; Public Functions
;; -----------------------------------------------------------------------------
(define-public (stake-for-ststx (amount uint))
  (let (
    (user tx-sender)
    (current-stake (default-to { stx-staked: u0, ststx-received: u0, staked-at-block: u0 } 
                                (map-get? user-stakes user)))
  )
    (asserts! (>= amount MIN-STAKE-AMOUNT) ERR-INVALID-AMOUNT)
    
    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount user (as-contract tx-sender)))
    
    ;; In production: contract-call to StackingDAO to deposit and receive stSTX
    ;; (try! (contract-call? STACKING-DAO-CORE deposit amount))
    
    ;; Calculate stSTX received (simplified - actual rate from StackingDAO)
    (let (
      (exchange-rate (unwrap! (get-exchange-rate) ERR-STACKING-FAILED))
      (ststx-amount (/ (* amount exchange-rate) u1000000))
    )
      ;; Update user stake record
      (map-set user-stakes user {
        stx-staked: (+ (get stx-staked current-stake) amount),
        ststx-received: (+ (get ststx-received current-stake) ststx-amount),
        staked-at-block: block-height
      })
      
      (print {
        event: "ststx-staked",
        user: user,
        stx-amount: amount,
        ststx-amount: ststx-amount,
        exchange-rate: exchange-rate
      })
      
      (ok ststx-amount)
    )
  )
)

(define-public (unstake-ststx (ststx-amount uint))
  (let (
    (user tx-sender)
    (current-stake (unwrap! (map-get? user-stakes user) ERR-NOT-AUTHORIZED))
  )
    (asserts! (>= (get ststx-received current-stake) ststx-amount) ERR-INVALID-AMOUNT)
    
    ;; In production: contract-call to StackingDAO to withdraw
    ;; (try! (contract-call? STACKING-DAO-CORE withdraw ststx-amount))
    
    ;; Calculate STX to return (simplified)
    (let (
      (exchange-rate (unwrap! (get-exchange-rate) ERR-UNSTAKING-FAILED))
      (stx-amount (/ (* ststx-amount u1000000) exchange-rate))
    )
      ;; Transfer STX back to user
      (try! (as-contract (stx-transfer? stx-amount tx-sender user)))
      
      ;; Update user stake record
      (map-set user-stakes user {
        stx-staked: (- (get stx-staked current-stake) stx-amount),
        ststx-received: (- (get ststx-received current-stake) ststx-amount),
        staked-at-block: block-height
      })
      
      (print {
        event: "ststx-unstaked",
        user: user,
        ststx-amount: ststx-amount,
        stx-amount: stx-amount
      })
      
      (ok stx-amount)
    )
  )
)

;; Claim accumulated BTC rewards from StackingDAO
(define-public (claim-btc-rewards)
  (let (
    (user tx-sender)
    (stake (unwrap! (map-get? user-stakes user) ERR-NOT-AUTHORIZED))
  )
    ;; In production: contract-call to StackingDAO to claim BTC rewards
    ;; (try! (contract-call? STACKING-DAO-CORE claim-rewards))
    
    (print {
      event: "btc-rewards-claimed",
      user: user,
      ststx-balance: (get ststx-received stake)
    })
    
    (ok true)
  )
)
