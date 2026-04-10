pub mod general;
pub mod stage;
pub mod game_maneger;
pub mod move_maneger;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            stage::read_stage,
            game_maneger::check_keydown,
            game_maneger::check_keyup,
            move_maneger::player_maneger_init,
            move_maneger::player_move_by_controller,
            move_maneger::bullet_move_forward
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
