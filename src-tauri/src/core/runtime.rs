use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::core::rules::RulesSettings;
use crate::window;

pub const RUNTIME_SNAPSHOT_EVENT: &str = "screen-monitor:runtime-snapshot-updated";

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeSnapshot {
    pub phase: String,
    pub seconds_remaining: u32,
    pub next_break_at: String,
    pub started_at: String,
}

impl Default for RuntimeSnapshot {
    fn default() -> Self {
        Self {
            phase: "focus".into(),
            seconds_remaining: 30 * 60,
            next_break_at: "--:--".into(),
            started_at: "--:--".into(),
        }
    }
}

#[derive(Clone)]
pub struct RuntimeController {
    inner: Arc<Mutex<RuntimeInner>>,
}

struct RuntimeInner {
    snapshot: RuntimeSnapshot,
    overlay_triggered: bool,
}

impl RuntimeController {
    pub fn from_rules(rules: &RulesSettings) -> Self {
        let interval_seconds = normalize_interval_seconds(rules.interval_minutes);
        let snapshot = RuntimeSnapshot {
            seconds_remaining: interval_seconds,
            ..RuntimeSnapshot::default()
        };

        Self {
            inner: Arc::new(Mutex::new(RuntimeInner {
                snapshot,
                overlay_triggered: false,
            })),
        }
    }

    pub fn snapshot(&self) -> RuntimeSnapshot {
        let guard = self
            .inner
            .lock()
            .expect("runtime controller mutex poisoned");
        guard.snapshot.clone()
    }

    pub fn apply_rules_settings(&self, rules: &RulesSettings) {
        let mut guard = self
            .inner
            .lock()
            .expect("runtime controller mutex poisoned");
        let interval_seconds = normalize_interval_seconds(rules.interval_minutes);
        guard.snapshot.phase = "focus".into();
        guard.snapshot.seconds_remaining = interval_seconds;
        guard.overlay_triggered = false;
    }

    fn tick(&self) -> TickResult {
        let mut guard = self
            .inner
            .lock()
            .expect("runtime controller mutex poisoned");

        if guard.snapshot.phase != "focus" {
            return TickResult {
                snapshot: guard.snapshot.clone(),
                should_show_overlay: false,
            };
        }

        if guard.snapshot.seconds_remaining > 0 {
            guard.snapshot.seconds_remaining -= 1;
        }

        if guard.snapshot.seconds_remaining == 0 {
            guard.snapshot.phase = "break".into();
            let should_show_overlay = !guard.overlay_triggered;
            guard.overlay_triggered = true;
            return TickResult {
                snapshot: guard.snapshot.clone(),
                should_show_overlay,
            };
        }

        TickResult {
            snapshot: guard.snapshot.clone(),
            should_show_overlay: false,
        }
    }
}

struct TickResult {
    snapshot: RuntimeSnapshot,
    should_show_overlay: bool,
}

pub fn spawn_runtime_loop(app: AppHandle, controller: RuntimeController) {
    thread::spawn(move || {
        emit_runtime_snapshot(&app, &controller.snapshot());

        loop {
            thread::sleep(Duration::from_secs(1));

            let tick_result = controller.tick();
            emit_runtime_snapshot(&app, &tick_result.snapshot);

            if tick_result.should_show_overlay {
                let _ = window::show_overlay(&app);
            }
        }
    });
}

pub fn emit_runtime_snapshot(app: &AppHandle, snapshot: &RuntimeSnapshot) {
    let _ = app.emit(RUNTIME_SNAPSHOT_EVENT, snapshot);
}

fn normalize_interval_seconds(interval_minutes: u32) -> u32 {
    interval_minutes.max(1) * 60
}
