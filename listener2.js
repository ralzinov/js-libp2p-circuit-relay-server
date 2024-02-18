import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'
import { multiaddr } from '@multiformats/multiaddr'
import {pipe} from "it-pipe";
import first from "it-first";
import { fromString, toString } from 'uint8arrays'
import {webRTC} from "@libp2p/webrtc";

import debug from 'debug'
debug.enable('libp2p:*,*:trace');

const ECHO_PROTOCOL = '/echo/1.0.0';

const relayAddr = process.argv[2]
if (!relayAddr) {
    throw new Error('the relay address needs to be specified as a parameter')
}

const node = await createLibp2p({
    transports: [
        webRTC(),
        webSockets(),
        circuitRelayTransport({
            discoverRelays: 0,
        })
    ],
    connectionManager: {
        minConnections: 0,
    },
    addresses: {
        listen: ['/webrtc'] // your webrtc dns multiaddr
    },
    connectionEncryption: [noise()],
    streamMuxers: [
        yamux()
    ],
    services: {
        identify: identify()
    }
});

node.handle(ECHO_PROTOCOL, ({ stream }) => {
    // pipe the stream output back to the stream input
    first(stream.source).then((response) => {
        console.log(`Received message by echo protocol`);
        console.log(response);
        // console.log(toString(response.slice(0, response.length)));
    })
    pipe(stream, stream)
});

const connection = await node.dial(multiaddr(relayAddr));

console.log(`Connected to the relay ${connection.remotePeer.toString()}`)

// Wait for connection and relay to be bind for the example purpose
node.addEventListener('self:peer:update', () => {
    console.log(`Advertising with a relay addresses:`)
    console.log(node.getMultiaddrs().map((addr) => addr.toString()).join('\n'));
    setTimeout(dial, 5000);
});

// const PEER_ID = '/ip4/80.211.215.60/tcp/4001/ws/p2p/12D3KooWHLvqFPpHNjjfYhEwugSsJd4B4kp7PStMs8rvcDkWxCEQ/p2p-circuit/p2p/12D3KooWJZQGCM3GNAX2yqYihsys6Eco3UZ99GPZZyBBtt74gtGr';
const PEER_ID = '/ip4/80.211.215.60/tcp/4001/ws/p2p/12D3KooWHLvqFPpHNjjfYhEwugSsJd4B4kp7PStMs8rvcDkWxCEQ/p2p-circuit/webrtc/p2p/12D3KooWLmgfffJnZ4TuW6fXe7MwyCQ4kXrUwYky7ZfbVVebJLq3';
const dial = async () => {
    console.log('Dialing peer');
    if (!node) {
        return;
    }

    const peedId = multiaddr(PEER_ID);
    console.log(peedId);
    const stream = await node.dialProtocol(peedId, [ECHO_PROTOCOL]);

    const message = 'hello world';
    const response = await pipe([fromString(message)], stream, async (source) => await first(source))
    const responseDecoded = response && toString(response.slice(0, response.length))
    console.log(responseDecoded);
}
