use tauri::{
    AppHandle, LogicalPosition, LogicalSize, Manager, Position, Size, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

use crate::storage;

const OVERLAY_LABEL: &str = "break-overlay";
const REMINDER_MODE_MINI_POPUP: &str = "mini-popup";
const MINI_POPUP_WIDTH: f64 = 320.0;
const MINI_POPUP_HEIGHT: f64 = 180.0;
const MINI_POPUP_MARGIN: f64 = 24.0;

pub fn overlay_window(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    app.get_webview_window(OVERLAY_LABEL)
        .ok_or_else(|| tauri::Error::AssetNotFound(OVERLAY_LABEL.into()))
}

fn create_overlay_window(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    WebviewWindowBuilder::new(app, OVERLAY_LABEL, WebviewUrl::App("index.html".into()))
        .title("Break Overlay")
        .visible(false)
        .resizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .build()
}

pub fn show_overlay(app: &AppHandle) -> tauri::Result<()> {
    let rules = storage::load_rules_settings(app).unwrap_or_default();
    let window = match app.get_webview_window(OVERLAY_LABEL) {
        Some(existing_window) => existing_window,
        None => create_overlay_window(app)?,
    };

    apply_overlay_layout(&window, &rules.reminder_mode)?;
    window.show()?;
    window.set_focus()?;
    Ok(())
}

pub fn hide_overlay(app: &AppHandle) -> tauri::Result<()> {
    let window = overlay_window(app)?;
    window.close()?;
    Ok(())
}

fn apply_overlay_layout(window: &WebviewWindow, reminder_mode: &str) -> tauri::Result<()> {
    if reminder_mode == REMINDER_MODE_MINI_POPUP {
        window.set_fullscreen(false)?;
        window.set_decorations(true)?;
        window.set_resizable(false)?;
        window.set_size(Size::Logical(LogicalSize::new(
            MINI_POPUP_WIDTH,
            MINI_POPUP_HEIGHT,
        )))?;

        if let Some(monitor) = window.current_monitor()? {
            let monitor_position = monitor.position();
            let monitor_size = monitor.size();
            let x = monitor_position.x as f64 + monitor_size.width as f64 - MINI_POPUP_WIDTH - MINI_POPUP_MARGIN;
            let y = monitor_position.y as f64 + MINI_POPUP_MARGIN;

            window.set_position(Position::Logical(LogicalPosition::new(x, y)))?;
        }
    } else {
        window.set_decorations(false)?;
        window.set_fullscreen(true)?;
    }

    Ok(())
}
