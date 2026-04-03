# Screen Monitor

一个基于 `Tauri + Vite + React + TypeScript + pnpm` 的桌面休息提醒应用。

核心目标：
- 按设定的节奏提醒休息
- 休息开始时播放可配置提示音
- 通过全屏倒计时遮罩强提醒用户离开当前任务
- 为后续的系统托盘、开机自启、多窗口和持久化配置预留结构

## 技术选型

- 桌面容器：Tauri 2
- 前端：React 19 + TypeScript + Vite
- 包管理：pnpm
- Rust 侧职责：调度、窗口控制、系统能力桥接、音频能力扩展预留

## 推荐架构

### 前端分层

- `src/app`：应用入口、布局壳层、路由或视图装配
- `src/features`：按业务功能组织页面和组件
- `src/services`：外部能力接入，如 Tauri API、音频、持久化
- `src/shared`：类型、常量、工具函数

### Rust 分层

- `src-tauri/src/main.rs`：Tauri 启动入口
- `src-tauri/src/lib.rs`：应用装配
- `src-tauri/src/commands`：提供给前端调用的命令
- `src-tauri/src/core`：提醒调度、倒计时和业务状态机
- `src-tauri/src/window`：主窗口、全屏遮罩窗口控制
- `src-tauri/src/audio`：提示音播放封装
- `src-tauri/src/storage`：本地配置读写

## 第一阶段功能拆分

1. 提醒计划配置
2. 提示音选择与试听
3. 倒计时遮罩预览
4. 调度引擎与状态同步
5. 系统托盘与后台运行
6. 本地持久化与启动恢复

## 目录速览

```text
src/
  app/
  features/
    overlay/
    schedule/
    settings/
    timer/
  services/
    audio/
    tauri/
  shared/
    constants/
    types/
    utils/
src-tauri/
  src/
    commands/
    core/
    window/
    audio/
    storage/
```

## 开发命令

依赖安装完成后可以使用：

```bash
pnpm install
pnpm tauri dev
pnpm tauri build
```

## 当前状态

- 已初始化 Vite React 项目
- 已建立业务目录骨架
- 正在补充 Tauri 运行时骨架与依赖
