<?php
/**
 * Plugin Name: PayStack Subscriptions
 * Plugin URI: https://paystack.app
 * Description: Bitcoin-native subscription payments for WordPress with automated recurring billing
 * Version: 1.0.0
 * Author: PayStack
 * Author URI: https://paystack.app
 * License: MIT
 * Text Domain: paystack-subscriptions
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PAYSTACK_VERSION', '1.0.0');
define('PAYSTACK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PAYSTACK_PLUGIN_URL', plugin_dir_url(__FILE__));

class PayStack_Subscriptions {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('paystack_subscribe', array($this, 'subscribe_shortcode'));
        add_shortcode('paystack_paywall', array($this, 'paywall_shortcode'));
    }

    public function init() {
        // Register custom post type for protected content
        register_post_type('paystack_content', array(
            'labels' => array(
                'name' => 'Protected Content',
                'singular_name' => 'Protected Content'
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail'),
            'menu_icon' => 'dashicons-lock'
        ));
    }

    public function admin_menu() {
        add_menu_page(
            'PayStack Settings',
            'PayStack',
            'manage_options',
            'paystack-settings',
            array($this, 'settings_page'),
            'dashicons-money-alt',
            30
        );
    }

    public function settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Save settings
        if (isset($_POST['paystack_save_settings'])) {
            check_admin_referer('paystack_settings');
            update_option('paystack_merchant_principal', sanitize_text_field($_POST['merchant_principal']));
            update_option('paystack_contract_address', sanitize_text_field($_POST['contract_address']));
            update_option('paystack_network', sanitize_text_field($_POST['network']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }

        $merchant_principal = get_option('paystack_merchant_principal', '');
        $contract_address = get_option('paystack_contract_address', 'STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-autopay');
        $network = get_option('paystack_network', 'testnet');

        ?>
        <div class="wrap">
            <h1>PayStack Settings</h1>
            <form method="post" action="">
                <?php wp_nonce_field('paystack_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="merchant_principal">Merchant Principal</label></th>
                        <td>
                            <input type="text" id="merchant_principal" name="merchant_principal" 
                                   value="<?php echo esc_attr($merchant_principal); ?>" 
                                   class="regular-text" required>
                            <p class="description">Your Stacks wallet address to receive payments</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="contract_address">Contract Address</label></th>
                        <td>
                            <input type="text" id="contract_address" name="contract_address" 
                                   value="<?php echo esc_attr($contract_address); ?>" 
                                   class="regular-text" required>
                            <p class="description">PayStack subscription contract address</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="network">Network</label></th>
                        <td>
                            <select id="network" name="network">
                                <option value="testnet" <?php selected($network, 'testnet'); ?>>Testnet</option>
                                <option value="mainnet" <?php selected($network, 'mainnet'); ?>>Mainnet</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <input type="submit" name="paystack_save_settings" class="button-primary" value="Save Settings">
                </p>
            </form>

            <hr>

            <h2>Usage</h2>
            <h3>Subscription Button Shortcode</h3>
            <code>[paystack_subscribe plan="monthly" amount="10"]</code>
            <p>Displays a subscription button. Parameters:</p>
            <ul>
                <li><strong>plan</strong>: monthly or annual</li>
                <li><strong>amount</strong>: Price in STX</li>
                <li><strong>text</strong>: Button text (optional)</li>
            </ul>

            <h3>Paywall Shortcode</h3>
            <code>[paystack_paywall]Your premium content here[/paystack_paywall]</code>
            <p>Wraps content that requires an active subscription to view.</p>
        </div>
        <?php
    }

    public function enqueue_scripts() {
        wp_enqueue_script(
            'paystack-sdk',
            'https://unpkg.com/@x402pay/sdk@latest/dist/index.js',
            array(),
            PAYSTACK_VERSION,
            true
        );

        wp_enqueue_script(
            'paystack-plugin',
            PAYSTACK_PLUGIN_URL . 'assets/paystack.js',
            array('paystack-sdk'),
            PAYSTACK_VERSION,
            true
        );

        wp_localize_script('paystack-plugin', 'paystackConfig', array(
            'merchantPrincipal' => get_option('paystack_merchant_principal'),
            'contractAddress' => get_option('paystack_contract_address'),
            'network' => get_option('paystack_network'),
            'apiUrl' => 'https://paystack.app/api'
        ));

        wp_enqueue_style(
            'paystack-styles',
            PAYSTACK_PLUGIN_URL . 'assets/paystack.css',
            array(),
            PAYSTACK_VERSION
        );
    }

    public function subscribe_shortcode($atts) {
        $atts = shortcode_atts(array(
            'plan' => 'monthly',
            'amount' => '10',
            'text' => 'Subscribe Now'
        ), $atts);

        $merchant = get_option('paystack_merchant_principal');
        if (empty($merchant)) {
            return '<p style="color: red;">PayStack not configured. Please set merchant principal in settings.</p>';
        }

        return sprintf(
            '<button class="paystack-subscribe-btn" data-plan="%s" data-amount="%s">%s</button>',
            esc_attr($atts['plan']),
            esc_attr($atts['amount']),
            esc_html($atts['text'])
        );
    }

    public function paywall_shortcode($atts, $content = null) {
        if (!is_user_logged_in()) {
            return '<div class="paystack-paywall"><p>Please log in to view this content.</p></div>';
        }

        // Check if user has active subscription
        $user_id = get_current_user_id();
        $has_subscription = get_user_meta($user_id, 'paystack_subscription_active', true);

        if ($has_subscription) {
            return do_shortcode($content);
        }

        return '<div class="paystack-paywall">
            <p>This content requires an active subscription.</p>
            ' . $this->subscribe_shortcode(array()) . '
        </div>';
    }
}

// Initialize plugin
function paystack_subscriptions() {
    return PayStack_Subscriptions::instance();
}

paystack_subscriptions();
