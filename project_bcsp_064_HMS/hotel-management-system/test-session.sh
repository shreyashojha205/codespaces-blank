node server.js > server.log 2>&1 &
SERVER_PID=$!
sleep 2

echo "--- LOGIN ---"
curl -s -c cookies.txt -X POST -H "Content-Type: application/json" -d '{"email":"admin@hotel.com","password":"password"}' http://localhost:3000/api/auth/login

echo -e "\n--- COOKIES ---"
cat cookies.txt

echo -e "\n--- DASHBOARD ---"
curl -s -i -b cookies.txt http://localhost:3000/views/manager-dashboard

kill $SERVER_PID
