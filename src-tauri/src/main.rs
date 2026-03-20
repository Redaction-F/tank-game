// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::warn;
use std::io::Write;

fn main() {
    // read .env
    if let Err(_) = dotenv::from_filename("/home/redaction-f/.config/cash-in-out/.env") {
        warn!("Failed to read .env file");
    }

    // build logger
    env_logger::Builder::from_default_env()
        .format(|buf, record| {
            let time: env_logger::fmt::Timestamp = buf.timestamp();
            writeln!(
                buf,
                "[{} {:>5} {}]{}:{}\n\t{}\n",
                time,
                record.level(),
                record.target(),
                record.file().unwrap_or("unknown file"),
                record.line().unwrap_or(0),
                record.args()
            )
        })
        .init();

    tank_game_lib::run()
}

