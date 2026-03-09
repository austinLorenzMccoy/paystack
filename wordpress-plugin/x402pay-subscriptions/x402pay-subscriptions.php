<?php
/**
 * Plugin Name: x402Pay Subscriptions
 * Plugin URI: https://x402pay.app
 * Description: Bitcoin-native subscription payments for WordPress with automated recurring billing
 * Version: 1.0.0
 * Author: x402Pay
 * Author URI: https://x402pay.app
 * License: MIT
 * Text Domain: x402pay-subscriptions
 */

if (!defined('ABSPATH')) {
    exit;
}

define('X402PAY_VERSION', '1.0.0');
define('X402PAY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('X402PAY_PLUGIN_URL', plugin_dir_url(__FILE__));

class x402Pay_Subscriptions {
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
        add_shortcode('x402pay_subscribe', array($this, 'subscribe_shortcode'));
        add_shortcode('x402pay_paywall', array($this, 'paywall_shortcode'));
    }

    public function init() {
        // Register custom post type for protected content
        register_post_type('x402pay_content', array(
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
            'x402Pay Settings',
            'x402Pay',
            'manage_options',
            'x402pay-settings',
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
        if (isset($_POST['x402pay_save_settings'])) {
            check_admin_referer('x402pay_settings');
            update_option('x402pay_merchant_principal', sanitize_text_field($_POST['merchant_principal']));
            update_option('x402pay_contract_address', sanitize_text_field($_POST['contract_address']));
            update_option('x402pay_network', sanitize_text_field($_POST['network']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }

        $merchant_principal = get_option('x402pay_merchant_principal', '');
        $contract_address = get_option('x402pay_contract_address', 'STZMYH3JZXAHA1E993K0AATCCAAPTTFQVHWCVARF.subscription-autopay');
        $network = get_option('x402pay_network', 'testnet');

        ?>
        <div class="wrap">
            <h1>x402Pay Settings</h1>
            <form method="post" action="">
                <?php wp_nonce_field('x402pay_settings'); ?>
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
                            <p class="description">x402Pay subscription contract address</p>
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
                    <input type="submit" name="x402pay_save_settings" class="button-primary" value="Save Settings">
                </p>
            </form>

            <hr>

            <h2>Usage</h2>
            <h3>Subscription Button Shortcode</h3>
            <code>[x402pay_subscribe plan="monthly" amount="10"]</code>
            <p>Displays a subscription button. Parameters:</p>
            <ul>
                <li><strong>plan</strong>: monthly or annual</li>
                <li><strong>amount</strong>: Price in STX</li>
                <li><strong>text</strong>: Button text (optional)</li>
            </ul>

            <h3>Paywall Shortcode</h3>
            <code>[x402pay_paywall]Your premium content here[/x402pay_paywall]</code>
            <p>Wraps content that requires an active subscription to view.</p>
        </div>
        <?php
    }

    public function enqueue_scripts() {
        wp_enqueue_script(
            'x402pay-sdk',
            'https://unpkg.com/@x402pay/sdk@latest/dist/index.js',
            array(),
            PAYSTACK_VERSION,
            true
        );

        wp_enqueue_script(
            'x402pay-plugin',
            PAYSTACK_PLUGIN_URL . 'assets/x402pay.js',
            array('x402pay-sdk'),
            PAYSTACK_VERSION,
            true
        );

        wp_localize_script('x402pay-plugin', 'x402payConfig', array(
            'merchantPrincipal' => get_option('x402pay_merchant_principal'),
            'contractAddress' => get_option('x402pay_contract_address'),
            'network' => get_option('x402pay_network'),
            'apiUrl' => 'https://x402pay.app/api'
        ));

        wp_enqueue_style(
            'x402pay-styles',
            PAYSTACK_PLUGIN_URL . 'assets/x402pay.css',
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

        $merchant = get_option('x402pay_merchant_principal');
        if (empty($merchant)) {
            return '<p style="color: red;">x402Pay not configured. Please set merchant principal in settings.</p>';
        }

        return sprintf(
            '<button class="x402pay-subscribe-btn" data-plan="%s" data-amount="%s">%s</button>',
            esc_attr($atts['plan']),
            esc_attr($atts['amount']),
            esc_html($atts['text'])
        );
    }

    public function paywall_shortcode($atts, $content = null) {
        if (!is_user_logged_in()) {
            return '<div class="x402pay-paywall"><p>Please log in to view this content.</p></div>';
        }

        // Check if user has active subscription
        $user_id = get_current_user_id();
        $has_subscription = get_user_meta($user_id, 'x402pay_subscription_active', true);

        if ($has_subscription) {
            return do_shortcode($content);
        }

        return '<div class="x402pay-paywall">
            <p>This content requires an active subscription.</p>
            ' . $this->subscribe_shortcode(array()) . '
        </div>';
    }
}

// Initialize plugin
function x402pay_subscriptions() {
    return x402Pay_Subscriptions::instance();
}

x402pay_subscriptions();
