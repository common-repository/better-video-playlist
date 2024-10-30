<?php

defined('WP_UNINSTALL_PLUGIN') or die('Slow down cowboy');

// Define the uninstall callback function
function bbpl_uninstall() {
    if (!current_user_can('activate_plugins')) {
        return;
    }

    // Delete any plugin-related data from the database here

    // Delete plugin settings
    delete_option('bbpl_played_video_emoji');
    delete_option('bbpl_playing_emoji');
    delete_option('bbpl_download_emoji');
    delete_option('bbpl_playing_background_color');
    delete_option('bbpl_autoplay');

    // Delete all user data:
    delete_user_meta_for_all_users();
}

// Hook the uninstall callback function
register_uninstall_hook(__FILE__, 'bbpl_uninstall');

// Delete user meta data by prefix for all users
function delete_user_meta_for_all_users() {
    global $wpdb;
    $wpdb->query( $wpdb->prepare("DELETE FROM $wpdb->usermeta WHERE meta_key LIKE 'bvideo-%'") );

}