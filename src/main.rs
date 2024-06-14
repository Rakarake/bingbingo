use yew::prelude::*;

#[function_component]
fn App() -> Html {
    let counter = use_state(|| 0);
    let onclick = {
        let counter = counter.clone();
        move |_| {
            let value = *counter + 1;
            counter.set(value);
        }
    };

    html! {
        <>
            <h1> {"The BING 🗿 bingo!"} </h1>
              <div class="bingo-card">
                <div class="bingo-item">{"Hot springs"}</div>
                <div class="bingo-item">{"Truck kun"}</div>
                <div class="bingo-item">{"3"}</div>
                <div class="bingo-item">{4}</div>
                <div class="bingo-item">{5}</div>
                <div class="bingo-item">{6}</div>
                <div class="bingo-item">{7}</div>
                <div class="bingo-item">{8}</div>
                <div class="bingo-item">{9}</div>
              </div> 
            <button {onclick}>{ "+1" }</button>
            <p class="amongus">{ *counter }</p>
        </>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
