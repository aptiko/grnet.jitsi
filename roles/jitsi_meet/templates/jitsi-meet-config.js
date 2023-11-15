var config = {
    hosts: {
        domain: '{{ ansible_fqdn }}',
        muc: 'conference.{{ ansible_fqdn }}',
    },

    bosh: '//{{ ansible_fqdn }}/http-bind',

    testing: {
    },

    flags: {
    },

    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,
    liveStreamingEnabled: true,
    channelLastN: -1,
    enableWelcomePage: true,

    p2p: {
        enabled: true,
        stunServers: [
            { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' },
        ],
    },

    analytics: {
    },

    mouseMoveCallbackInterval: 1000,
};
