pub mod general;
pub mod stage;
pub mod game_maneger;
pub mod move_maneger;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            stage::tauri_command::load_stage,
            game_maneger::tauri_command::controller_update,
            move_maneger::tauri_command::player_move_by_controller,
            move_maneger::tauri_command::bullet_move_forward,
            move_maneger::tauri_command::enemy_move_auto,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
