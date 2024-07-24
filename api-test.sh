# Some clients will add cards
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"password":"gabagool", "name":"jeff", "card":"foul tarnished"}' \
  http://localhost:3000/api/card
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"password":"gabagool", "name":"joe", "card":"morb💕"}' \
  http://localhost:3000/api/card

# Fetch those cards
curl http://localhost:3000/api/room/gabagool/cards

