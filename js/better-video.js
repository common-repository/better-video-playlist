/**
 * Better Video and Playlist jQuery Plugin
 * Version: 2.1
 */

const config = {
    playedVideoEmoji: bbplSettings.playedVideoEmoji,
    playingEmoji: bbplSettings.playingEmoji,
    downloadEmoji: bbplSettings.downloadEmoji,
    playingBackgroundColor: bbplSettings.playingBackgroundColor,
    autoplay: bbplSettings.autoplay,
};

jQuery(document).ready(function($) {
    

    //cache for DOM optimization
    let bvideo = $("video");

    // If you close the window and a video is playing, store the current time by invoking the pause method
    $(window).on("unload", function(e) {
        bvideo.each(function(index, value) {
            if (!this.paused) 
                this.pause();
        });
    });

    // When we pause, we store the current time
    bvideo.on("pause", function(event) {
        storeVideoTime(this);
    });

    // First time we force the player from the time we have stored. This is used so playlist works.
    let firstTime = true;

    // Play video restores the video from the last point or from the query string using ?t=444
    bvideo.on("play", function(event) {

        // Only load the stored time the first time they click play.
        if (firstTime == true) {
            firstTime = false;
            // Using time provided via URL only once!!
            let startTime = new URLSearchParams(window.location.search).get('t');

            if (startTime !== null && $.isNumeric(startTime))  {
                if (startTime < this.duration)
                    this.currentTime = startTime;
            } else { // Init video at last stored time

                storedTime = getVideoTime(this);
                // if not at the end or already played
                if (storedTime >= this.duration || storedTime == -1) {
                    storedTime = 0;
                }

                this.currentTime = storedTime;
            }
        } // End if first time

        this.play();
    });

    // On finished video mark as played
    bvideo.on('ended', function(e) {
        markPlayedVideo(this);
    });

    /**
     * Playlist player for 1 video HTML tag
     */
    let bvideo_playlist = $('#bvideo_playlist');

    if (bvideo_playlist.length) {
        let currentUrl = btoa(window.location.href.split('?')[0].split('#')[0]);
        let videoList  = getVideoList();

        // Playlist video player
        if (typeof videoList !== 'undefined') {
            // Start video from parameter ID
            let startVideo = new URLSearchParams(window.location.search).get('start_video');
            if (startVideo !== null && $.isNumeric(startVideo))
                idCurrent = startVideo - 1; // We start counting from 1 so we do not use 0.
            else // Init video at last play
                idCurrent = localStorage.getItem('bvideo-playlist-' + currentUrl);
            idCurrent = ($.isNumeric(idCurrent)) ? idCurrent : 0;
            idCurrent = (idCurrent > videoList.length - 1) ? 0 : idCurrent;

            // gets the data from an A tag using the data attribute
            currentLinkVideo = $('a[data-bvideo_id~="' + idCurrent + '"]');

            // Current video playing
            localStorage.setItem('bvideo-playlist-' + currentUrl, idCurrent);

            // Setup player to play current video
            bvideo.attr({
                "id": "bvideo",
                "src": currentLinkVideo.attr("href"),
                "data-bvideo_id": idCurrent // Which video are we playing
            });

            // Change title for video playing
            $('#bvideo_title').text(currentLinkVideo.text());

            listVideoHighlight(currentLinkVideo);

            // On finished video, play next
            bvideo.on('ended', function(e) {

                // Current ID, using attribute since data gets cached and we are updating it
                id = parseInt($(this).attr("data-bvideo_id"));

                // Icon marked played
                if (config.playedVideoEmoji != '')
                    currentLinkVideo.parent().prepend(config.playedVideoEmoji);

                // Remove background color
                if (config.playingBackgroundColor != '')
                    currentLinkVideo.parent().css("background-color", "");

                // What to play next
                idNext = (id == videoList.length - 1) ? 0 : id + 1;

                // Getting the source of the a
                videoNext = $('a[data-bvideo_id~="' + idNext + '"]');

                $(this).attr({
                    "src": videoNext.attr("href"),
                    "data-bvideo_id": idNext // Which video are we playing
                });

                if (config.autoplay == 1)
                    $(this).attr("autoplay", "autoplay");

                // Remember next video
                localStorage.setItem('bvideo-playlist-' + currentUrl, idNext);

                // Change title for video playing
                $('#bvideo_title').text(videoNext.text());

                listVideoHighlight(videoNext);
            });

            // Sets the source of the video from an ahref
            $("#bvideo_playlist a[target!='_blank']").on("click", function(e) {

                // We prevent any default action, so we do not go to the URL
                e.preventDefault();

                bvideo.attr({
                    "src": $(this).attr("href"),
                    "data-bvideo_id": $(this).data("bvideo_id") // Which video are we playing
                });

                if (config.autoplay == true)
                    bvideo.attr("autoplay", "autoplay");

                // Scroll to video
                if ($('#bvideo_title').length) // Location.href = "#bvideo_title"; 
                    document.querySelector('#bvideo_title').scrollIntoView({
                        behavior: 'smooth'
                    });
                else // Location.href = "#bvideo"; 
                    document.querySelector('#bvideo').scrollIntoView({
                        behavior: 'smooth'
                    });

                // Remember last video
                localStorage.setItem('bvideo-playlist-' + currentUrl, $(this).data("bvideo_id"));

                // Change title for video playing
                $('#bvideo_title').text($(this).text());

                listVideoHighlight($(this));

            });

        }
    }


    /**
     * generates the videoList used for the play list
     * if uses ARRAY JS generates the inner LI HTML
     * @return Array videoList
     */
    function getVideoList(){
        let videoList = [];

        // 1st way to load the playlist comes from a playlist JS array
        if (typeof directLinkData !== 'undefined' || typeof video_playlist !== 'undefined') {
            // In case there's a default playlist array
            if (typeof video_playlist !== 'undefined') {
                videoList = video_playlist;
            }

            // Loading playlist from a pCloud array, in a public folder view page use the directLinkData array embedded in the HTML
            if (typeof directLinkData !== 'undefined') {
                // Create the list of links
                let pCloud = directLinkData.content;
                let path = 'https://filedn.eu/' + directLinkData.code + directLinkData.dirpath;

                for (i = 0; i < pCloud.length; i++) {
                    let temp = [];
                    temp["name"] = pCloud[i].name.slice(0, -4);
                    temp["link"] = path + pCloud[i].urlencodedname;
                    temp["size"] = pCloud[i].size;
                    videoList.push(temp);
                }
            }

            // From array videoList to a table
            let htmlList = "";
            for (i = 0; i < videoList.length; i++) {

                htmlList += '<li>';

                if (isPlayedVideo(videoList[i].link))
                    htmlList += config.playedVideoEmoji;

                htmlList += '<a data-bvideo_id="' + i + '" href="' + videoList[i].link + '" title="' + videoList[i].name + '">' + videoList[i].name + '</a>';

                if (videoList[i].size != undefined) {
                    videoSize = (videoList[i].size != undefined ? fileSize(videoList[i].size) : '-')
                    htmlList += '<span style="float:right;"><a target="_blank" title="' + videoSize + ' Download" download href="' + videoList[i].link + '">' + config.downloadEmoji + '</a></span>';
                }

                htmlList += '</li>';
            }

            // Print HTML
            bvideo_playlist.html(htmlList);
            bvideo_playlist.parent().css({
                "height": bvideo.height() + 120,
                "overflow-y": "auto"
            });

        }

        // 2nd way to get a playlist: load videoList array from a list instead than JS array    
        else if (bvideo_playlist.is('ol, ul')) {
            videoList = [];
            $("#bvideo_playlist li a").each(function(e) {
                a = $(this);
                a.attr('data-bvideo_id', e);

                // Icon marked played
                if (config.playedVideoEmoji != '' && isPlayedVideo(this.href) )
                    a.parent().prepend(config.playedVideoEmoji);

                let temp = {};
                temp["name"] = this.text;
                temp["link"] = this.href;
                temp["size"] = a.data('size') !== undefined ? a.data('size') : 0;
                videoList.push(temp);
            });
            
        }

        return videoList;
    }


    /**
     * store video time in local and WP
     * @param   video 
     * @param   time we can specify the time we store. For instance -1 means video played.
     */
    function storeVideoTime(video, time = false){
        //time not set then using video current
        if (time==false)
            time = video.currentTime;

        // Save into local storage; if you change the browser, it will not work
        localStorage.setItem('bvideo-' + btoa(video.src), time);

        // Ajax call
        $.post(betterVideo_ajax.ajax_url, {
            _ajax_nonce: betterVideo_ajax.nonce, // Nonce
            action: "bbpl_store_video_time", // Action
            time: time, // Time
            video: video.src, // Video URL
        }).fail(handleAjaxError);
    }

    /**
     * get the video time from a SRC
     * @param  video 
     * @return integer
     */
    function getVideoTime(video){
        storedTime = getVideoTimeSrc(video.src);
        if (storedTime > video.duration)
            storedTime = 0;

        return storedTime;
    }


    function getVideoTimeSrc(videoSrc){
        // First, retrieve from local storage
        let storedTime = localStorage.getItem('bvideo-' + btoa(videoSrc));

        // TODO needed improvement here!!
        // Only Ajax if stored time is empty, saves queries
        // but we may have different values if used in different browsers
        if (storedTime == null) {
            // Ajax call
            $.post(betterVideo_ajax.ajax_url, {
                _ajax_nonce: betterVideo_ajax.nonce, // Nonce
                action: "bbpl_get_video_time", // Action
                video: videoSrc, // Video URL
            }, function(data) { // Callback
                storedTime = data[0];
            }).fail(handleAjaxError);
        }
        
        return storedTime;
    }

    /**
     * video is marked as played using -1
     * @param   video 
     */
    function markPlayedVideo(video){

        if (isPlayedVideo(video.src) == false)
            storeVideoTime(video,-1);
    }

    /**
     * Tells us if we have seen that video in this URL
     * @param  string btoa src of the video
     * @return boolean    
     */
    function isPlayedVideo(videoSrc) {
        return getVideoTimeSrc(videoSrc) == -1;
    }

    /**
     * Highlights the item on the playlist to know what is been playing
     * @return none
     */
    function listVideoHighlight(linkList) {
        // Highlight what's currently playing
        if (config.playingEmoji != '') {
            $("#bvideoCurrentVideoEmoji").remove();
            linkList.parent().prepend('<span id="bvideoCurrentVideoEmoji">' + config.playingEmoji + '&nbsp;</span>');
        }
        if (config.playingBackgroundColor != '') {
            $(".bvideoCurrentVideoColor").css("background-color", "");
            linkList.parent().addClass('bvideoCurrentVideoColor');
            linkList.parent().css("background-color", config.playingBackgroundColor);
        }
    }

    // AJAX error handling function
    function handleAjaxError(xhr, textStatus, errorThrown) {
        console.error("AJAX Error: " + textStatus);
        console.error("Error Details: " + errorThrown);
    }


})

// From https://stackoverflow.com/a/20463021
function fileSize(a, b, c, d, e) {
    return (b = Math, c = b.log, d = 1e3, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(e ? 2 : 0) + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes')
}
