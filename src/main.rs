use axum::{
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
use serde::{Deserialize, Serialize};
use log::info;
use std::env::var;
use std::format;

struct AppState {
    rooms: Mutex<HashMap<String, HashMap<String, String>>>,
}

#[tokio::main]
async fn main() {
    // Initialize logging
    pretty_env_logger::init();

    let served_dir = var("BINGBINGO_SERVE_DIR").unwrap_or("public".to_string());

    let app_state = Arc::new(AppState { rooms: Mutex::new(HashMap::new()) });

    let address = var("BINGBINGO_ADDRESS").unwrap_or("127.0.0.1".to_string());

    let port = if let Ok(port_str) = var("BINGBINGO_PORT") {
        port_str.parse::<u16>().expect("PORT is malformed")
    } else { 3000 };

    let sub_path = var("BINGBINGO_SUB_PATH").unwrap_or("".to_string());

    info!("serving, address: {:?}, port {:?}, sub path: {:?}, served dir: {:?}", address, port, sub_path, served_dir);

    use tower_http::services::{ServeDir, ServeFile};
    let static_file_service = 
        ServeDir::new(&served_dir)
        .append_index_html_on_directories(true)
        .not_found_service(ServeFile::new(format!("{}/page404.html", served_dir)));

    let app = Router::new()
        .nest_service(&format!("/{}", sub_path), static_file_service)
        .nest(&format!("/{}", sub_path), Router::new()
          .route("/api/room/:password/cards", get(get_cards))
          .route("/api/card", post(post_card))
          .with_state(app_state)
        );

    let listener = tokio::net::TcpListener::bind((address, port))
        .await
        .expect("failed to bind to tcp socket");
    info!("listening on http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

use axum::extract::Request;
async fn get_not_found(request: Request) -> &'static str {
    info!("404 failed to deliver request: {:?}", request);
    "404 not found u_u\n"
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

