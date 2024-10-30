<?php
/**
 * Plugin Name: Better Video & Playlist
 * Plugin URI: https://garridodiaz.com/better-video-plugin-for-wordpress/
 * Description: Improves video capabilities for WordPress and adds video playlist features.
 * Version: 2.1.1
 * Author: Chema
 * Author URI: https://garridodiaz.com
 * License: GPL2
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

class BetterVideoPlaylistPlugin
{
    const MAIN_FILE = __FILE__;

    public function __construct()
    {
        // Initialize the plugin by adding hooks and actions
        add_action('wp_enqueue_scripts', [$this, 'enqueueAssets']);
        add_action('wp_ajax_bbpl_store_video_time', [$this, 'storeVideoTime']);
        add_action('wp_ajax_bbpl_get_video_time', [$this, 'getVideoTime']);
        add_action('admin_menu', [$this, 'addAdminMenu']);
        add_action('admin_init', [$this, 'registerSettings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminScripts']);
        add_action('admin_notices', [$this, 'displayDonationMessage']);
        add_action('admin_head', [$this, 'addDonationMessageJS']);
        add_filter('plugin_row_meta', [$this, 'addPluginRowMeta'], 10, 2);
        add_filter('plugin_action_links_better-video/better-video.php',[$this,  'addSettingLinks']);
        add_action('admin_init', [$this, 'setupSettingsFields']);
    }

    /**
     * Enqueue assets (scripts and styles) for the plugin.
     */
    public function enqueueAssets()
    {
        // Enqueue scripts and localize for better-video.js
        wp_enqueue_script('better-video', plugin_dir_url(__FILE__) . 'js/better-video.js', array('jquery'), '2.1', true);

        wp_localize_script(
            'better-video',
            'betterVideo_ajax',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('better-video'),
            )
        );

        $bbpl_settings = array(
            'playedVideoEmoji' => get_option('bbpl_played_video_emoji', __('✔', 'bbpl-textdomain')),
            'playingEmoji' => get_option('bbpl_playing_emoji', __('▶️', 'bbpl-textdomain')),
            'downloadEmoji' => get_option('bbpl_download_emoji', __('💾', 'bbpl-textdomain')),
            'playingBackgroundColor' => get_option('bbpl_playing_background_color', '#FFFF00'),
            'autoplay' => get_option('bbpl_autoplay', true),
        );
        wp_localize_script('better-video', 'bbplSettings', $bbpl_settings);
    }

    /**
     * Handle AJAX request for storing video time.
     *
     * @return bool JSON response indicating success or failure.
     */
    public function storeVideoTime()
    {
        // Handle the AJAX request for storing video time
        check_ajax_referer('better-video');
        $return = false;

        if (is_user_logged_in()) {
            global $current_user;
            $time = sanitize_text_field($_POST['time']);
            $video = sanitize_url($_POST['video']);

            if (is_numeric($time) && wp_http_validate_url($video)) {
                $return = update_user_meta($current_user->ID, 'bvideo-' . md5($video), $time);
            }
        }

        wp_send_json($return);
    }

    /**
     * Handle AJAX request for getting video time.
     *
     * @return mixed JSON response containing the video time or 0.
     */
    public function getVideoTime()
    {
        // Handle the AJAX request for getting video time
        check_ajax_referer('better-video');
        $return = 0;

        if (is_user_logged_in()) {
            global $current_user;
            $video = sanitize_url($_POST['video']);
            if (wp_http_validate_url($video)) {
                $return = get_user_meta($current_user->ID, 'bvideo-' . md5($video));
            }
        }

        wp_send_json($return);
    }

    /**
     * Add the admin menu for plugin settings.
     */
    public function addAdminMenu()
    {
        // Add the admin menu for settings
        add_submenu_page(
            'options-general.php',
            __('Better Video & Playlist Settings', 'bbpl-textdomain'),
            __('Video Settings', 'bbpl-textdomain'),
            'manage_options',
            'bbpl-settings',
            [$this, 'renderSettingsPage']
        );
    }

    /**
     * Register plugin settings.
     */
    public function registerSettings()
    {
        // Register plugin settings
        register_setting('bbpl_settings_group', 'bbpl_played_video_emoji');
        register_setting('bbpl_settings_group', 'bbpl_playing_emoji');
        register_setting('bbpl_settings_group', 'bbpl_download_emoji');
        register_setting('bbpl_settings_group', 'bbpl_playing_background_color');
        register_setting('bbpl_settings_group', 'bbpl_autoplay');
    }

    /**
     * Enqueue scripts for the admin page.
     *
     * @param string $hook The current admin page hook.
     */
    public function enqueueAdminScripts($hook)
    {
        // Enqueue scripts for the admin page
        if ($hook === 'settings_page_bbpl-settings') {
            wp_enqueue_script('bbpl-admin', plugin_dir_url(__FILE__) . 'js/admin-better-video.js', array('jquery', 'wp-color-picker'), '1.0', true);
        }
    }

    /**
     * Display a donation message in the WordPress admin.
     */
    public function displayDonationMessage()
    {
        // Display the donation message
        if ((isset($_GET['page']) && $_GET['page'] === 'bbpl-settings') && !isset($_COOKIE['donation_message_closed'])) {
            echo '<div id="donation-message" class="notice notice-info is-dismissible" style="background-color: #f5f5f5; border-left: 4px solid #0073aa; padding: 10px;">
                <p style="font-size: 16px;">Enjoy using our plugin? Consider <a href="https://paypal.me/chema/10EUR" target="_blank" id="donate-link">making a donation</a> to support our work! THANKS!</p>
                </div>';
        }
    }

    /**
     * Add JavaScript for handling the donation message.
     */
    public function addDonationMessageJS()
    {
        // Add JavaScript for handling the donation message
        if (!isset($_COOKIE['donation_message_closed'])) {
            ?>
            <script type="text/javascript">
                jQuery(document).ready(function ($) {

                    $('#donate-link').click(function () {
                        $('#donation-message').remove();
                        var expirationDate = new Date();
                        expirationDate.setDate(expirationDate.getDate() + 30); // Expires in 30 days
                        document.cookie = 'donation_message_closed=true; expires=' + expirationDate.toUTCString() + '; path=/';

                    });
                });
            </script>
            <?php
        }
    }

    /**
     * Setup settings fields and sections for the plugin.
     */
    public function setupSettingsFields()
    {
        // Setup settings fields and sections
        add_settings_section('bbpl_general_section', __('General Settings', 'bbpl-textdomain'), [$this, 'renderGeneralSection'], 'bbpl-settings');

        // Define custom sanitize callbacks for each field
        $sanitize_callbacks = [
            'bbpl_played_video_emoji' => 'sanitize_text_field',
            'bbpl_playing_emoji' => 'sanitize_text_field',
            'bbpl_download_emoji' => 'sanitize_text_field',
            'bbpl_playing_background_color' => 'sanitize_hex_color',
            'bbpl_autoplay' => 'sanitize_checkbox',
        ];

        // Sanitize user input for each field
        add_settings_field('bbpl_played_video_emoji', __('Played Video Emoji', 'bbpl-textdomain'), [$this, 'renderPlayedVideoEmojiField'], 'bbpl-settings', 'bbpl_general_section', ['sanitize_callback' => $sanitize_callbacks['bbpl_played_video_emoji']]);
        add_settings_field('bbpl_playing_emoji', __('Playing Emoji', 'bbpl-textdomain'), [$this, 'renderPlayingEmojiField'], 'bbpl-settings', 'bbpl_general_section', ['sanitize_callback' => $sanitize_callbacks['bbpl_playing_emoji']]);
        add_settings_field('bbpl_download_emoji', __('Download Emoji', 'bbpl-textdomain'), [$this, 'renderDownloadEmojiField'], 'bbpl-settings', 'bbpl_general_section', ['sanitize_callback' => $sanitize_callbacks['bbpl_download_emoji']]);
        add_settings_field('bbpl_playing_background_color', __('Playing Background Color', 'bbpl-textdomain'), [$this, 'renderBackgroundColorField'], 'bbpl-settings', 'bbpl_general_section', ['sanitize_callback' => $sanitize_callbacks['bbpl_playing_background_color']]);
        add_settings_field('bbpl_autoplay', __('Autoplay', 'bbpl-textdomain'), [$this, 'renderAutoplayField'], 'bbpl-settings', 'bbpl_general_section', ['sanitize_callback' => $sanitize_callbacks['bbpl_autoplay']]);
    }

    // Custom sanitize function for checkbox input
    public function sanitize_checkbox($value)
    {
        return empty($value) ? false : true;
    }


    /**
     * Render the plugin's settings page.
     */
    public function renderSettingsPage()
    {
        ?>
        <div class="wrap">
            <h2><?php _e('Better Video & Playlist Settings', 'bbpl-textdomain'); ?></h2>
            <form method="post" action="options.php">
                <?php settings_fields('bbpl_settings_group'); ?>
                <?php do_settings_sections('bbpl-settings'); ?>
                <input type="submit" class="button-primary" value="<?php _e('Save Settings', 'bbpl-textdomain'); ?>">
            </form>
        </div>
        <?php
    }

    /**
     * Render the general section description.
     */
    public function renderGeneralSection()
    {
        echo __('Configure general settings for Better Video & Playlist.', 'bbpl-textdomain');
    }

    // Sanitize user input for each field before saving
    public function renderPlayedVideoEmojiField()
    {
        $value = get_option('bbpl_played_video_emoji', __('✔', 'bbpl-textdomain'));
        $value = sanitize_text_field($value); // Sanitize the input
        echo "<input type='text' name='bbpl_played_video_emoji' value='$value'>";
    }

    public function renderPlayingEmojiField()
    {
        $value = get_option('bbpl_playing_emoji', __('▶️', 'bbpl-textdomain'));
        $value = sanitize_text_field($value); // Sanitize the input
        echo "<input type='text' name='bbpl_playing_emoji' value='$value'>";
    }   

    public function renderDownloadEmojiField()
    {
        $value = get_option('bbpl_download_emoji', __('💾', 'bbpl-textdomain'));
        $value = sanitize_text_field($value); // Sanitize the input
        echo "<input type='text' name='bbpl_download_emoji' value='$value'>";
    }

    public function renderBackgroundColorField()
    {
        $value = get_option('bbpl_playing_background_color', '#FFFF00');
        $value = sanitize_hex_color($value); // Sanitize the color input
        echo "<input type='text' name='bbpl_playing_background_color' value='$value' class='color-picker'>";
    }

    public function renderAutoplayField()
    {
        $value = get_option('bbpl_autoplay', true);
        $value = $value ? '1' : '0'; // Ensure it's either '0' or '1'
        echo "<input type='hidden' name='bbpl_autoplay' value='0'>
        <label for='bbpl_autoplay'>
            <input type='checkbox' id='bbpl_autoplay' name='bbpl_autoplay' value='1' " . checked($value, '1', false) . ">
            " . __('Enable Autoplay', 'bbpl-textdomain') . "
        </label>";
    }


    /**
     * Add links to settings and sponsorship in plugin row meta.
     *
     * @param array $plugin_meta The existing plugin meta.
     * @param string $plugin_file The plugin file path.
     * @return array Modified plugin meta with added links.
     */
    public function addPluginRowMeta($plugin_meta, $plugin_file)
    {
        if (plugin_basename(self::MAIN_FILE) !== $plugin_file) {
            return $plugin_meta;
        }

        $settings_page_url = admin_url('options-general.php?page=bbpl-settings');

        $plugin_meta[] = sprintf(
            '<a href="%1$s"><span class="dashicons dashicons-admin-settings" aria-hidden="true" style="font-size:14px;line-height:1.3"></span>%2$s</a>',
            $settings_page_url,
            esc_html_x('Settings', 'verb', 'bbpl-textdomain')
        );

        $plugin_meta[] = sprintf(
            '<a href="%1$s"><span class="dashicons dashicons-star-filled" aria-hidden="true" style="font-size:14px;line-height:1.3"></span>%2$s</a>',
            'https://paypal.me/chema/10EUR',
            esc_html_x('Sponsor', 'verb', 'better-video')
        );

        return $plugin_meta;
    }

    /**
     * add link to settings next to activate deactivate
     * @param [type] $links [description]
     */
    function addSettingLinks($links) 
    {
        $settings_page_url = admin_url('options-general.php?page=bbpl-settings');

        $settings_link = sprintf(
            '<a href="%1$s">%2$s</a>',
            $settings_page_url,
            esc_html_x('Settings', 'verb', 'better-video')
        );

        array_unshift($links, $settings_link);
        return $links;
    }
}

// Initialize the plugin
new BetterVideoPlaylistPlugin();



 function enqueueBlockAssets() {
    wp_enqueue_script(
        'bbpl-block',
        plugins_url('blocks/block.js', __FILE__),
        array('wp-blocks', 'wp-components', 'wp-i18n'),
    );

}

add_action('enqueue_block_editor_assets', 'enqueueBlockAssets');

