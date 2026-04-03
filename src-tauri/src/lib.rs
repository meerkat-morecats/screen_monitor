mod commands;
mod core;
mod storage;
mod window;

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    ActivationPolicy, Manager, WindowEvent,
};

const MAIN_WINDOW_LABEL: &str = "main";
const TRAY_MENU_SHOW_ID: &str = "tray-show-main";
const TRAY_MENU_QUIT_ID: &str = "tray-quit";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
        .on_window_event(|window, event| {
            if window.label() != MAIN_WINDOW_LABEL {
                return;
            }

            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .setup(|app| {
            setup_tray(app)?;

            let app_handle = app.handle().clone();
            let rules_settings = storage::load_rules_settings(&app_handle).unwrap_or_default();
            let runtime_controller = core::runtime::RuntimeController::from_rules(&rules_settings);
            app.manage(runtime_controller.clone());
            core::runtime::spawn_runtime_loop(app_handle, runtime_controller);

            #[cfg(target_os = "macos")]
            app.set_activation_policy(ActivationPolicy::Accessory);

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

fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    let show_item = MenuItem::with_id(app, TRAY_MENU_SHOW_ID, "打开 Monitor", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, TRAY_MENU_QUIT_ID, "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

    let mut tray_builder = TrayIconBuilder::with_id(core::runtime::TRAY_ICON_ID)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("Screen Monitor")
        .on_menu_event(|app, event| match event.id().as_ref() {
            TRAY_MENU_SHOW_ID => {
                show_main_window(app);
            }
            TRAY_MENU_QUIT_ID => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.to_owned()).icon_as_template(true);
    }

    let _ = tray_builder.build(app)?;
    Ok(())
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}
