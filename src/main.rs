use axum::{
    http::StatusCode,
    extract::{
        State,
        Path,
    },
    routing::get,
    routing::post,
    Json,
    Router,
};
use std::sync::Arc;
use std::sync::Mutex;
use std::collections::HashMap;
use tower_http::services::ServeDir;
use serde::{Deserialize, Serialize};
use log::info;

struct AppState {
    rooms: Mutex<HashMap<String, HashMap<String, String>>>,
}

#[tokio::main]
async fn main() {
    // Initialize logging
    pretty_env_logger::init();

    let app_state = Arc::new(AppState { rooms: Mutex::new(HashMap::new()) });
    let static_file_service = ServeDir::new("public")
        .not_found_service(tower_http::services::ServeFile::new("public/page404.html"));
    let app = Router::new()
        .route("/api/room/:password/cards", get(get_cards))
        .route("/api/card", post(post_card))
        .nest_service("/", static_file_service)
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("listening on http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn post_card(State(state): State<Arc<AppState>>, Json(payload): Json<PostCard>) {
    info!("posted card! password: {:?}, name: {:?}, card: {:?}", payload.password, payload.name, payload.card);

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

async fn get_cards(State(state): State<Arc<AppState>>, Path(password): Path<String>) -> Result<Json<GetCardsResponse>, &'static str> {
    info!("getting cards! password: {:?}", password);

    let rooms = state.rooms.lock().unwrap();
    if let Some(room) = rooms.get(&password) {
        Ok(Json(GetCardsResponse { cards: room.clone() }))
    } else {
        Err("bad, no such room")
    }
}

#[derive(Serialize)]
struct GetCardsResponse {
    cards: HashMap<String, String>,
}

