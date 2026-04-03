use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RulesSettings {
    pub reminder_enabled: bool,
    pub reminder_mode: String,
    pub popup_theme: String,
    pub interval_minutes: u32,
    pub break_minutes: u32,
    pub play_sound_after_break: bool,
}

impl Default for RulesSettings {
    fn default() -> Self {
        Self {
            reminder_enabled: true,
            reminder_mode: "fullscreen".into(),
            popup_theme: "system".into(),
            interval_minutes: 30,
            break_minutes: 5,
            play_sound_after_break: true,
        }
    }
}
