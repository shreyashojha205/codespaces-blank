node server.js > server.log 2>&1 &
SERVER_PID=$!
sleep 4

curl -i -c cookies.txt -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' http://127.0.0.1:3000/api/auth/login > login.log 2>&1

cat cookies.txt

kill $SERVER_PID
