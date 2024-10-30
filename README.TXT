=== Better Video & Playlist ===
Contributors: deambulando
Donate link: https://paypal.me/chema/10EUR
Tags: video, playlist, video playlist, html5 video, start video, resume video, progress
Requires at least: 6.0
Tested up to: 6.4
Stable tag: 2.1.1
Requires PHP: 7.4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Improves WordPress Video Experience by adding playlist, resume video and a lot more!

== Description ==

**Elevate Your WordPress Video Experience!**

The Better Video & Playlist Plugin is designed to enhance the video capabilities of your WordPress website while adding a sophisticated video playlist feature. This plugin ensures that your site's visitors enjoy a seamless and engaging video-watching experience.

**Key Features:**

- **Resume Video Playback**: Never lose progress – our plugin remembers where you left off.
- **Video Progress Storage**: Store video progress in the WordPress database and local browser storage.
- **Customized Start Time**: Start your videos at specific times using the `?t=SECONDS` parameter (e.g., `?t=120` starts at 2 minutes).
- **Video Playlists**: Create and manage video playlists effortlessly using block editor.
- **Autoplay Next Video**: Keep viewers engaged with automatic playback of the next video.
- **Emoji Customization**: Add a personal touch with custom video emojis.
- **Background Color**: Tailor the video player's background color to match your site's aesthetics.

**Why Choose Better Video & Playlist?**

- **User-Friendly**: Seamlessly integrate advanced video features into your WordPress site.
- **Progress Tracking**: Never make viewers start from scratch; they can pick up right where they left off.
- **Playlist Management**: Create and organize video playlists with ease.
- **Community Support**: Join a community of users benefiting from this plugin's capabilities.

== Installation ==

**Via WordPress Admin:**

1. Go to **Plugins** -> **Add New**.
2. Search for "Better Video & Playlist."
3. Click **Install Now**.
4. Activate the plugin.

**Via FTP:**

1. Download the plugin.
2. Unzip the .zip file and upload the folder to `/wp-content/plugins/`.
3. Activate the plugin in the **Plugins** menu of WordPress.

== Frequently Asked Questions ==

**How to Use?**

To enable the video features, add a video from the post editor or use the HTML video tag. You can include as many video tags as needed.

**Creating Video Playlists**

You can create a video playlist within your editor by using the block. 

Or by using the advanced settings panel and setting it to "bvideo_playlist." Alternatively, you can create a list in your HTML with the id "bvideo_playlist."

Here's an example HTML playlist:

```html
<ol id="bvideo_playlist">
    <li><a href="video1.mp4">Video 1</a></li>
    <li><a href="video2.mp4">Video 2</a></li>
    <li><a href="video3.mp4">Video 3</a></li>
</ol>
```

You can also create a playlist using a JavaScript array:

```javascript
<script>
var video_playlist = [
    {
        "name": "Video 1",
        "link": "video1.mp4",
        "size": 55000000
    },
    {
        "name": "Video 2",
        "link": "video2.mp4",
        "size": 475000000
    },
    {
        "name": "Video 3",
        "link": "video3.mp4",
        "size": 105000000
    }
];
</script>
```

To add the JavaScript to your post/page, consider using a plugin like [this one](https://wordpress.org/plugins/header-and-footer-scripts/).

== Screenshots ==

1. Video Player
2. Playlist Player

== Upgrade History ==

= Version 2.1.1 =
- Tested for WordPress 6.4 compatibility

= Version 2.1 =
- Major jQuery and PHP code refactor
- Improved method for tracking played videos
- New admin panel with customizable settings

= Version 2.0.4 =
- Enhanced descriptions and FAQs

= Version 2.0.3 =
- Tested for WordPress 6.3 compatibility

= Version 2.0.2 =
- Added smooth scroll to video

= Version 2.0.1 =
- Implemented AJAX for storing video time for logged-in users

= Version 1.0 =
- Initial release