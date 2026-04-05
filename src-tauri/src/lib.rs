mod general;
mod stage;
mod game_maneger;
mod move_maneger;
mod error;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            stage::read_stage,
            game_maneger::check_key_down,
            game_maneger::check_key_up,
            game_maneger::hit_wall,
            move_maneger::player_maneger_init,
            move_maneger::move_by_controller,
            move_maneger::bullet_create
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
