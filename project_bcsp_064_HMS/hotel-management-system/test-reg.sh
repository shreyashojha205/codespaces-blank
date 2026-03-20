node server.js > server.log 2>&1 &
SERVER_PID=$!
sleep 4

curl -i -X POST -H "Content-Type: application/json" -d '{"firstName":"Demo","lastName":"Guest","email":"demo@example.com","password":"mypassword123"}' http://127.0.0.1:3000/api/auth/register > reg.log 2>&1

kill $SERVER_PID
