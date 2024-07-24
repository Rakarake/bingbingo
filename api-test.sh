# Some clients will add cards
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"password":"gabagool", "name":"jeff", "card":"foul tarnished"}' \
  http://localhost:3000/card
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"password":"gabagool", "name":"joe", "card":"morb💕"}' \
  http://localhost:3000/card

## Fetch those cards
#curl \
#  --request GET\
#  http://localhost:3000/cards/gabagool

