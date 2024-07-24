use axum::{
    http::StatusCode,
    extract::State,
    routing::get,
    routing::post,
    Json,
    Router
};
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
    let app_state = Arc::new(AppState { rooms: Mutex::new(HashMap::new()) });
    let app = Router::new()
        .nest_service("/", ServeDir::new("public"))
        .route("/card", post(post_card))
        .route("/cards", get(get_cards))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn post_card(State(state): State<Arc<AppState>>, Json(payload): Json<PostCard>) {
    let mut rooms = state.rooms.lock().unwrap();
    if let Some(room) = rooms.get_mut(&payload.password) {
        room.insert(payload.name, payload.card);
    } else {
        let mut new_room = HashMap::new();
        new_room.insert(payload.name, payload.card);
        rooms.insert(payload.password, new_room);
    }
}

#[derive(Deserialize)]
struct PostCard {
    password: String,
    name: String,
    card: String,
}

async fn get_cards(State(state): State<Arc<AppState>>, Json(payload): Json<GetCards>) -> Result<Json<GetCardsResponse>, StatusCode> {
    let rooms = state.rooms.lock().unwrap();
    if let Some(room) = rooms.get(&payload.password) {
        Ok(Json(GetCardsResponse { cards: room.clone() }))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

#[derive(Deserialize)]
struct GetCards {
    password: String,
}

#[derive(Serialize)]
struct GetCardsResponse {
    cards: HashMap<String, String>,
}

