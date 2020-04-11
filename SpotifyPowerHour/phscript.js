// Get the hash of the url
const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function(initial, item) {
        if (item) {
            var parts = item.split('=');
            initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
    }, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;
let player;
let userid;
const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '71d0ff96a0ae4889971ba7e67f1783e4';
const redirectUri = 'https://boonebaker.github.io/SpotifyPowerHour/ph1.html';
const scopes = [
    'streaming',
    'playlist-read-private',
    'playlist-read-collaborative',
    //'user-read-birthdate',
    'user-read-private',
    'user-modify-playback-state'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}

//Get current user details
//https://api.spotify.com/v1/me


// Chill Live Albums URI
// spotify:playlist:3mXoUl8XpnRmE2zNhCG9te
// playlist id: 3mXoUl8XpnRmE2zNhCG9te


// Set up the Web Playback SDK

window.onSpotifyPlayerAPIReady = () => {
    console.log('onSpotify');
    player = new Spotify.Player({
        name: 'Power Hour Player',
        getOAuthToken: cb => {
            cb(_token);
            console.log('spotify player');
            console.log('token = ' + _token);
        }
    });

    getUser();

    getPlaylists();

    player.addListener('player_state_changed', ({
        position,
        duration,
        track_window: { current_track }
    }) => {
        console.log('Currently Playing ', current_track.name);
        console.log('By ', current_track.artists[0].name);
        console.log('Position in Song', position);
        console.log('Duration of Song', duration);
    });
}

function getUser() {
    $.ajax({
        url: "https://api.spotify.com/v1/me",
        type: "GET",
        //data: '{"uris": ["spotify:track:76wJIkA63AgwA92hUhpE2V"]}',
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
        success: function(data) {
            console.log(data)
            userid = data.id;
            console.log(userid);
        }
    });
}

function getPlaylists() {
    var dropdown = document.getElementById("playlistsDD");
    $.ajax({
        url: "https://api.spotify.com/v1/me/playlists?offset=0&limit=50",
        type: "GET",
        //data: '{"uris": ["spotify:track:76wJIkA63AgwA92hUhpE2V"]}',
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
        success: function(data) {
            console.log(data)
            data.items.forEach(function(i) {
                console.log(i.name + '\t' + i.id);
                var option = document.createElement("option");
                option.value = i.id;
                option.text = i.name;
                dropdown.appendChild(option);
            })
        }
    });

}

function start() {
    if (document.getElementById("playlistsDD").value != "null") {

        player.getCurrentState().then(state => {
            if (state) {
                player.removeListener('ready');
            }

            // Error handling
            player.on('initialization_error', e => console.error(e));
            player.on('authentication_error', e => console.error(e));
            player.on('account_error', e => console.error(e));
            player.on('playback_error', e => console.error(e));

            // Playback status updates
            player.on('player_state_changed', state => {
                console.log(state)
                $('#current-track').attr('src', state.track_window.current_track.album.images[0].url);
                $('#current-track-name').text(state.track_window.current_track.name);
            });

            // Ready
            player.on('ready', data => {
                console.log('Ready with Device ID', data.device_id);

                // Play a track using our new device ID
                play(data.device_id);
                nextTrack();
            });

            // Connect to the player!
            player.connect();
        })
    } else {
        alert('Please select a playlist');
    }
};

function nextTrack() {
    player.nextTrack();
}

function toggle() {
    player.togglePlay().then(() => {
        console.log('Toggled playback');
    })
}
// Play a specified track
function play(device_id) {
    playlistId = document.getElementById("playlistsDD").value;
    //alert(playlistId);
    var uris = new Array();
    //uris.splice(0, uris.length);
    //alert('gettingTracks');
    $.ajax({
        url: "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
        type: "GET",
        async: false,
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
        success: function(data) {
            console.log(data);
            data.items.forEach(function(i) {
                console.log(i.track.uri);
                uris.push(i.track.uri);
            });

            //alert(uris.length);
        }
    });
    //alert(JSON.stringify(uris));
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        //data: '{"uris": ["spotify:track:76wJIkA63AgwA92hUhpE2V"]}',
        data: '{"uris": ' + JSON.stringify(uris) + '}',
        //data: '{"uris": ["spotify:playlist:' + playlistId + '"]}',
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
        success: function(data) {
            console.log(data)
        }
    });
}

function getPlaylistTracks(playlistId) {

}