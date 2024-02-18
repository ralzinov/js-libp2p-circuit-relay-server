import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import { createLibp2p } from 'libp2p'

const node = await createLibp2p({
    addresses: {
        listen: ['/ip4/0.0.0.0/tcp/4001/ws']
    },
    transports: [
        webSockets()
    ],
    connectionEncryption: [
        noise()
    ],
    streamMuxers: [
        yamux()
    ],
    services: {
        identify: identify(),
        relay: circuitRelayServer()
    }
});

console.log(`Node started with id ${node.peerId.toString()}`)
console.log('Listening on:')
node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))