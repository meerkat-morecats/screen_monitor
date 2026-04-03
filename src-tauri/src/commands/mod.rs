use tauri::{AppHandle, State};

use crate::{storage, window};
use crate::core::rules::RulesSettings;
use crate::core::runtime::{self, RuntimeController, RuntimeSnapshot};

#[tauri::command]
pub fn show_overlay(app: AppHandle) -> Result<(), String> {
    window::show_overlay(&app).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn hide_overlay(
    app: AppHandle,
    runtime_controller: State<'_, RuntimeController>,
) -> Result<(), String> {
    window::hide_overlay(&app).map_err(|error| error.to_string())?;
    let snapshot = runtime_controller.resume_after_break();
    runtime::emit_runtime_snapshot(&app, &snapshot);
    Ok(())
}

#[tauri::command]
pub fn get_runtime_snapshot(runtime_controller: State<'_, RuntimeController>) -> RuntimeSnapshot {
    runtime_controller.snapshot()
}

#[tauri::command]
pub fn get_rules_settings(app: AppHandle) -> Result<RulesSettings, String> {
    storage::load_rules_settings(&app)
}

#[tauri::command]
pub fn save_rules_settings(
    app: AppHandle,
    runtime_controller: State<'_, RuntimeController>,
    settings: RulesSettings,
) -> Result<(), String> {
    storage::save_rules_settings(&app, &settings)?;
    runtime_controller.apply_rules_settings(&settings);
    let snapshot = runtime_controller.snapshot();
    runtime::emit_runtime_snapshot(&app, &snapshot);
    Ok(())
}
