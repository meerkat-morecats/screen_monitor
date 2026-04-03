use std::{fs, path::PathBuf};

use tauri::{AppHandle, Manager};

use crate::core::rules::RulesSettings;

const RULES_SETTINGS_FILE_NAME: &str = "rules-settings.json";

pub fn load_rules_settings(app: &AppHandle) -> Result<RulesSettings, String> {
    let config_path = rules_settings_path(app)?;

    if !config_path.exists() {
        return Ok(RulesSettings::default());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|error| format!("failed to read rules settings: {error}"))?;

    match serde_json::from_str::<RulesSettings>(&content) {
        Ok(settings) => Ok(settings),
        Err(_) => Ok(RulesSettings::default()),
    }
}

pub fn save_rules_settings(app: &AppHandle, settings: &RulesSettings) -> Result<(), String> {
    let config_path = rules_settings_path(app)?;

    if let Some(parent_dir) = config_path.parent() {
        fs::create_dir_all(parent_dir)
            .map_err(|error| format!("failed to create config directory: {error}"))?;
    }

    let serialized_settings = serde_json::to_string_pretty(settings)
        .map_err(|error| format!("failed to serialize rules settings: {error}"))?;

    fs::write(config_path, serialized_settings)
        .map_err(|error| format!("failed to write rules settings: {error}"))
}

fn rules_settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|error| format!("failed to resolve app config directory: {error}"))?;

    Ok(config_dir.join(RULES_SETTINGS_FILE_NAME))
}
