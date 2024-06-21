import Peer from 'peerjs';
import io from 'socket.io-client';

export default class Level extends Phaser.Scene {
    constructor() {
        super("Level");
        this.localStream = null;
        this.peers = {};
        this.peer = null;
        this.socket = io('192.168.11.75:3000'); // Connect to your signaling server
    }

    preload() {
        // Load any assets here if necessary
    }

    create() {
        this.setupWebRTC();
    }

    async setupWebRTC() {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // Create a video element for the local stream
            const localVideo = document.createElement('video');
            localVideo.srcObject = this.localStream;
            localVideo.muted = true; // Mute local video to avoid feedback
            localVideo.play();
            this.add.dom(100, 100, localVideo); // Add local video to Phaser scene

            // Initialize PeerJS
            this.peer = new Peer(undefined, {
                host: '192.168.11.75',
                port: 9000,
            });

            // When the peer connection is open
            this.peer.on('open', id => {
                console.log('My peer ID is:', id);
                this.socket.emit('register-peer', id);
            });

            // Handle incoming calls
            this.peer.on('call', call => {
                call.answer(this.localStream); // Answer the call with the local stream

                call.on('stream', remoteStream => {
                    console.log(remoteStream);
                    this.addRemoteStream(call.peer, remoteStream, call);
                });
            });

            // When receiving a signal from the signaling server
            this.socket.on('update-peer-list', async (data) => {
                const { peers, client } = data;
                if (client) this.removeRemoteStream(client);
                console.log('Updated peers:', peers);
                this.connectToNewPeers(peers);
            });

        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    }

    connectToNewPeers(peers) {
        peers.forEach(peerId => {
            if (peerId !== this.peer.id && !this.peers[peerId]) {
                const call = this.peer.call(peerId, this.localStream);
                call.on('stream', remoteStream => {
                    this.addRemoteStream(peerId, remoteStream, call);
                    // this.peers[peerId] = call;
                });
            }
        });
    }

    addRemoteStream(peerId, remoteStream, call) {
        if (!this.peers[peerId]) {
            console.log('Adding remote stream', peerId);
            const remoteVideo = document.createElement('video');
            remoteVideo.id = peerId;
            remoteVideo.srcObject = remoteStream;
            remoteVideo.play();
            console.log(Object.keys(this.peers).length);
            this.add.dom(300 + Object.keys(this.peers).length * 100, 100, remoteVideo); // Add remote video to Phaser scene
            console.log('peer video:', remoteVideo);
            this.peers[peerId] = call;
        }
    }
    removeRemoteStream(client) {
        const remoteVideoes = document.querySelectorAll('video');
        remoteVideoes.forEach((video) => {
            if (video.id == client.id) {
                video.remove();
                console.log('peer video removed', video);
            }
        })
        console.log(this.peers[client.id]);
        this.peers = Object.keys(this.peers).filter(key => key !== client.id);
    }
}
