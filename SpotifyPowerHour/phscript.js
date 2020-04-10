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

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '71d0ff96a0ae4889971ba7e67f1783e4';
const redirectUri = 'https://boonebaker.github.io/SpotifyPowerHour/ph1.html';
const scopes = [
    'streaming',
    //'user-read-birthdate',
    'user-read-private',
    'user-modify-playback-state'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}

// Set up the Web Playback SDK

window.onSpotifyPlayerAPIReady = () => {
    console.log('onSpotify');
    player = new Spotify.Player({
        name: 'Power Hour Player',
        getOAuthToken: cb => {
            cb(_token);
            console.log('spotify player');
            console.log(cb(_token));
            console.log('token = ' + _token);
            console.log(player);
        }

    });

    player.addListener('player_state_changed', ({
        position,
        duration,
        track_window: { current_track }
    }) => {
        console.log('Currently Playing ', current_track.name);
        console.log('By ', current_track.artists[0. name]);
        console.log('Position in Song', position);
        console.log('Duration of Song', duration);
    });
}

function start() {
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
    });

    // Connect to the player!
    player.connect();
};

function toggle() {
    player.togglePlay().then(() => {
        console.log('Toggled playback');
    })
}
// Play a specified track
function play(device_id) {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: '{"uris": ["spotify:track:76wJIkA63AgwA92hUhpE2V"]}',
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
        success: function(data) {
            console.log(data)
        }
    });
}