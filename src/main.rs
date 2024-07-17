use axum::{response::Html, routing::get, Router};

#[tokio::main]
async fn main() {
    // build our application with a route
    //let app = Router::new().route("/", get(handler));
    let app = init_router();

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

use tower_http::services::ServeDir;
fn init_router() -> Router {
    Router::new()
        .nest_service("/", ServeDir::new("public"))
}

