use axum::{http::StatusCode, extract::State,response::Html, routing::get, routing::post, Json, Router};
use std::sync::Arc;
use std::sync::Mutex;
use std::collections::HashMap;
use tower_http::services::ServeDir;
use serde::{Deserialize, Serialize};

struct AppState {
    rooms: Mutex<HashMap<String, HashMap<String, String>>>,
}

#[tokio::main]
async fn main() {
    // build our application with a route
    //let app = Router::new().route("/", get(handler));
    let app_state = Arc::new(AppState { rooms: Mutex::new(HashMap::new()) });
    let app = Router::new()
        .nest_service("/", ServeDir::new("public"))
        .route("/send-card", post(send_card))
        .with_state(app_state);

    // run it
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn handler() -> Html<&'static str> {
    Html("<h1>Hello, World!</h1>")
}

async fn send_card(State(state): State<Arc<AppState>>, Json(payload): Json<SendCard>) -> StatusCode {
    let mut rooms = state.rooms.lock().unwrap();
    if let Some(room) = rooms.get_mut(&payload.password) {
        room.insert(payload.name, payload.card);
    } else {
        let mut new_room = HashMap::new();
        new_room.insert(payload.name, payload.card);
        rooms.insert(payload.password, new_room);
    }
    
    StatusCode::IM_A_TEAPOT
}

async fn get_cards(State(state): State<Arc<AppState>>, Json(payload): Json<SendCards>) -> (StatusCode, SendCard) {
}

#[derive(Deserialize)]
struct get_cards {
    password: String,
    name: String,
    card: String,
}

#[derive(Deserialize)]
struct GetCards {
    password: String,
}

#[derive(Deserialize)]
struct GetCardsResponse {
    cards: String,
}


//
//        // `POST /users` goes to `create_user`
//        .route("/users", post(create_user));
//
//    // run our app with hyper, listening globally on port 3000
//    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
//    axum::serve(listener, app).await.unwrap();
//}
//
//// basic handler that responds with a static string
//async fn root() -> &'static str {
//    "Hello, World!"
//}
//
//async fn create_user(
//    // this argument tells axum to parse the request body
//    // as JSON into a `CreateUser` type
//    Json(payload): Json<CreateUser>,
//) -> (StatusCode, Json<User>) {
//    // insert your application logic here
//    let user = User {
//        id: 1337,
//        username: payload.username,
//    };
//
//    // this will be converted into a JSON response
//    // with a status code of `201 Created`
//    (StatusCode::CREATED, Json(user))
//}
// POST /send-card password name card

