node server.js > server.log 2>&1 &
SERVER_PID=$!
sleep 2

echo "--- LOGIN CURL ---"
curl -v -X POST -H "Content-Type: application/json" -d '{"email":"admin@hotel.com","password":"password"}' http://localhost:3000/api/auth/login 2>&1

kill $SERVER_PID
