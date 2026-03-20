node server.js > server.log 2>&1 &
SERVER_PID=$!
sleep 4

curl -i -X POST -H "Content-Type: application/json" -d '{"email":"admin@hotel.com","password":"password"}' http://127.0.0.1:3000/api/auth/login > curl.log 2>&1

kill $SERVER_PID
