use axum::{
    extract::{
        State,
        Path,
    },
    http,
    http::{
        StatusCode,
        HeaderMap,
    },
    routing::get,
    routing::post,
    Json,
    Router,
    response::IntoResponse,
    response::Redirect,
};
use std::sync::Arc;
use std::sync::Mutex;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use log::info;
use std::env::var;
use std::path::PathBuf;
use std::format;

struct AppState {
    rooms: Mutex<HashMap<String, HashMap<String, String>>>,
}

#[tokio::main]
async fn main() {
    // Initialize logging
    pretty_env_logger::init();

    let served_dir = PathBuf::from(var("BINGBINGO_SERVE_DIR").unwrap_or("public".to_string()));

    let app_state = Arc::new(AppState { rooms: Mutex::new(HashMap::new()) });

    let address = var("BINGBINGO_ADDRESS").unwrap_or("127.0.0.1".to_string());

    let port = if let Ok(port_str) = var("BINGBINGO_PORT") {
        port_str.parse::<u16>().expect("PORT is malformed")
    } else { 3000 };

    let sub_path = get_sub_path();

    info!("serving, address: {:?}, port {:?}, sub path: {:?}, served dir: {:?}", address, port, sub_path, served_dir);

    let app = Router::new()
        .route(&format!("/{}/", sub_path), get(get_index))
        .nest(&format!("/{}", sub_path), Router::new()
            .route("/:path", get(get_file))
            .route("/", get(redirect_to_dir))
            .route("/api/room/:password/cards", get(get_cards))
            .route("/api/card", post(post_card))
            .with_state(app_state))
            .fallback(get(get_not_found));

    let listener = tokio::net::TcpListener::bind((address, port))
        .await
        .expect("failed to bind to tcp socket");
    info!("listening on http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

// Need to redirect to url with "/" at the end so resources are read
fn get_sub_path() -> String {
    var("BINGBINGO_SUB_PATH").unwrap_or("/".to_string())
}
async fn redirect_to_dir() -> impl IntoResponse {
    info!("redirecting to dir url!");
    Redirect::permanent(&format!("/{}/", get_sub_path()))
}

use axum::extract::Request;
async fn get_not_found(request: Request) -> impl IntoResponse {
    info!("404 failed to deliver request: {:?}", request);
    "404 not found u_u\n"
}

// Special case for the root index.html
async fn get_index() -> impl IntoResponse {
    info!("serving root index.html");
    get_file(Path("".to_string())).await
}

// Statically serve frontend
async fn get_file(Path(path): Path<String>) -> impl IntoResponse {
    info!("serving file 📁: {}", path);
    let served_dir = PathBuf::from(var("BINGBINGO_SERVE_DIR").unwrap_or("public".to_string()))
        .canonicalize().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut path_buf = PathBuf::new();

    path_buf.push(&served_dir);
    path_buf.push(&path);
    path_buf.canonicalize().map_err(|_| StatusCode::NOT_FOUND)?;
    if path_buf.starts_with(served_dir) {
        // Add index.html to end of path_buf if it is a directory
        if path_buf.is_dir() {
            path_buf.push("index.html");
            info!("serving a directory, giving {:?}", path_buf);
        }
        let file = tokio::fs::read(&path_buf).await.map_err(|_| StatusCode::NOT_FOUND)?;
        // Mime type of file
        let content_type = mime_guess::from_path(&path_buf)
            .first()
            .map(|mime| mime.to_string())
            .unwrap_or("text/plain".to_string())
            .parse()
            .map_err(|_| StatusCode::NOT_FOUND)?;

        // Header
        let mut header = HeaderMap::new();
        header.insert(http::header::CONTENT_TYPE, content_type);

        Ok((header, file))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
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

