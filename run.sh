container_id=$(docker run -d -p 4001:4001/tcp -p 4001:4001/udp js-libp2p-circuit-relay-server)

( docker logs -f "$container_id" 2>&1 | while read line; do
    echo "$line"
    if echo "$line" | grep -qE '/ip4/172.17.0.2/tcp'; then
        # If the line matches, kill the background process group
        kill -15 0 > /dev/null
    fi
done ) &

waiter_pid=$!

# Wait for the background process to exit
wait $waiter_pid
