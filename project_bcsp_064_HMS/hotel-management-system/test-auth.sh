node server.js > server.log 2>&1 &
SERVER_PID=$!
sleep 2

echo "--- REGISTER ---"
curl -s -i -c cookies.txt -X POST -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","phone":"1234567890"}' http://localhost:3000/api/auth/register

echo -e "\n\n--- LOGIN ---"
curl -s -i -b cookies.txt -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' http://localhost:3000/api/auth/login

echo -e "\n\n--- SERVER LOGS ---"
cat server.log

kill $SERVER_PID
