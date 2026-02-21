// PayStack WordPress Plugin JavaScript
(function($) {
    'use strict';

    // Initialize PayStack on document ready
    $(document).ready(function() {
        initializePayStack();
    });

    function initializePayStack() {
        // Get config from localized script
        const config = window.paystackConfig || {};

        // Handle subscribe button clicks
        $('.paystack-subscribe-btn').on('click', function(e) {
            e.preventDefault();
            
            const $btn = $(this);
            const plan = $btn.data('plan');
            const amount = $btn.data('amount');
            
            // Disable button
            $btn.prop('disabled', true).text('Processing...');
            
            // Open subscription modal
            openSubscriptionModal(plan, amount, config)
                .then(() => {
                    $btn.text('Subscribed!').addClass('subscribed');
                })
                .catch((error) => {
                    console.error('Subscription error:', error);
                    $btn.prop('disabled', false).text('Subscribe Now');
                    alert('Subscription failed. Please try again.');
                });
        });
    }

    async function openSubscriptionModal(plan, amount, config) {
        // Create modal overlay
        const modal = $(`
            <div class="paystack-modal-overlay">
                <div class="paystack-modal">
                    <div class="paystack-modal-header">
                        <h2>Subscribe to ${plan} Plan</h2>
                        <button class="paystack-modal-close">&times;</button>
                    </div>
                    <div class="paystack-modal-body">
                        <p>Amount: ${amount} STX per ${plan === 'monthly' ? 'month' : 'year'}</p>
                        <p>Merchant: ${config.merchantPrincipal}</p>
                        <div class="paystack-modal-actions">
                            <button class="paystack-connect-wallet">Connect Wallet</button>
                            <button class="paystack-magic-link">Sign in with Email</button>
                        </div>
                        <div class="paystack-status"></div>
                    </div>
                </div>
            </div>
        `);

        $('body').append(modal);

        // Handle close
        modal.find('.paystack-modal-close').on('click', function() {
            modal.remove();
        });

        // Handle wallet connection
        modal.find('.paystack-connect-wallet').on('click', async function() {
            try {
                const status = modal.find('.paystack-status');
                status.html('<p>Connecting to Stacks wallet...</p>');

                // Use Stacks Connect to open wallet
                const userSession = new window.StacksConnect.UserSession();
                
                if (!userSession.isUserSignedIn()) {
                    await window.StacksConnect.showConnect({
                        appDetails: {
                            name: 'PayStack WordPress',
                            icon: window.location.origin + '/wp-content/plugins/paystack-subscriptions/assets/icon.png'
                        },
                        onFinish: () => {
                            status.html('<p>Wallet connected! Creating subscription...</p>');
                            createSubscription(plan, amount, config, modal);
                        },
                        onCancel: () => {
                            status.html('<p>Connection cancelled</p>');
                        }
                    });
                } else {
                    createSubscription(plan, amount, config, modal);
                }
            } catch (error) {
                console.error('Wallet connection error:', error);
                modal.find('.paystack-status').html('<p class="error">Failed to connect wallet</p>');
            }
        });

        // Handle magic link
        modal.find('.paystack-magic-link').on('click', function() {
            const email = prompt('Enter your email address:');
            if (email) {
                modal.find('.paystack-status').html('<p>Sending magic link to ' + email + '...</p>');
                // Redirect to PayStack app for magic link flow
                window.location.href = config.apiUrl + '/auth/magic-link?email=' + encodeURIComponent(email) + 
                    '&redirect=' + encodeURIComponent(window.location.href);
            }
        });

        return new Promise((resolve, reject) => {
            modal.data('resolve', resolve);
            modal.data('reject', reject);
        });
    }

    async function createSubscription(plan, amount, config, modal) {
        try {
            const status = modal.find('.paystack-status');
            status.html('<p>Creating subscription on-chain...</p>');

            // Call WordPress AJAX to create subscription
            const response = await $.ajax({
                url: '/wp-admin/admin-ajax.php',
                method: 'POST',
                data: {
                    action: 'paystack_create_subscription',
                    plan: plan,
                    amount: amount,
                    nonce: config.nonce
                }
            });

            if (response.success) {
                status.html('<p class="success">Subscription created successfully!</p>');
                setTimeout(() => {
                    modal.remove();
                    modal.data('resolve')();
                    location.reload(); // Reload to show unlocked content
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Subscription failed');
            }
        } catch (error) {
            console.error('Subscription creation error:', error);
            modal.find('.paystack-status').html('<p class="error">Failed to create subscription: ' + error.message + '</p>');
            modal.data('reject')(error);
        }
    }

})(jQuery);
