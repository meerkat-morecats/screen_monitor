mod commands;
mod core;
mod storage;
mod window;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let rules_settings = storage::load_rules_settings(&app_handle).unwrap_or_default();
            let runtime_controller = core::runtime::RuntimeController::from_rules(&rules_settings);
            app.manage(runtime_controller.clone());
            core::runtime::spawn_runtime_loop(app_handle, runtime_controller);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::show_overlay,
            commands::hide_overlay,
            commands::get_runtime_snapshot,
            commands::get_rules_settings,
            commands::save_rules_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
