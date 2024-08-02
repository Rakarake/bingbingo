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
};
use std::sync::Arc;
use std::sync::Mutex;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use log::info;
use std::env::var;

struct AppState {
    rooms: Mutex<HashMap<String, HashMap<String, String>>>,
}

#[tokio::main]
async fn main() {
    // Initialize logging
    pretty_env_logger::init();

    let app_state = Arc::new(AppState { rooms: Mutex::new(HashMap::new()) });
    let static_files = var("BINGBINGO_SERVE_DIR").unwrap_or("public".to_string());
    info!("serving dir: {:?}", static_files);
    let port = if let Ok(port_str) = var("BINGBINGO_PORT") {
        port_str.parse::<u16>().expect("PORT is malformed")
    } else { 3000 };
    let address = var("BINGBINGO_ADDRESS").unwrap_or("127.0.0.1".to_string());
    let sub_path = var("BINGBINGO_SUB_PATH").unwrap_or("/".to_string());
    //let static_file_service = 
    //    ServeDir::new(static_files.clone())
    //    .not_found_service(ServeFile::new(format!("{}/page404.html", static_files)))
    //    .append_index_html_on_directories(true);
        
    let app = Router::new()
        .nest(&sub_path, Router::new()
            .route("/api/room/:password/cards", get(get_cards))
            .route("/api/card", post(post_card))
            .route("/", get(get_index))
            .route("/:path", get(get_file))
            .with_state(app_state));

    let listener = tokio::net::TcpListener::bind((address, port))
        .await
        .unwrap();
    println!("listening on http://{}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

// Special case for the root index.html
async fn get_index() -> impl IntoResponse {
    get_file(Path("".to_string())).await
}

// Statically serve frontend
async fn get_file(Path(path): Path<String>) -> impl IntoResponse {
    info!("serving file 📁");
    use std::path::PathBuf;
    let static_files = PathBuf::from(var("BINGBINGO_SERVE_DIR").unwrap_or("public".to_string()))
        .canonicalize().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut path_buf = PathBuf::new();

    path_buf.push(&static_files);
    path_buf.push(&path);
    path_buf.canonicalize().map_err(|_| StatusCode::NOT_FOUND)?;
    if path_buf.starts_with(static_files) {
        // Add index.html to end of path_buf if it is a directory
        if path_buf.is_dir() {
            path_buf.push("index.html");
            info!("serving a directory: giving index.html");
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

