// =======================================================================
// Flow Studio - Dashboard UI Renderer (Bento & Editorial Serif)
// Strictly follows DESIGN.md Design System
// Includes Full Chrome Profiles Management (Create, Edit, Delete, Login)
// =======================================================================

export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flow Studio - AI Generation & Chrome Profiles Management</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ─── Design Tokens (DESIGN.md) ───────────────────────── */
    :root {
      --font-serif: "Newsreader", Georgia, "Times New Roman", serif;
      --font-sans: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

      --space-xs: 4px;
      --space-sm: 8px;
      --space-md: 12px;
      --space-lg: 16px;
      --space-xl: 24px;
      --space-xxl: 32px;

      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --radius-xl: 18px;

      --motion-fast: 120ms;
      --motion-normal: 180ms;
      --motion-slow: 260ms;

      --success: #16A34A;
      --warning: #D97706;
      --danger: #DC2626;
      --info: #2563EB;
    }

    /* Light Theme (DESIGN.md tokens) */
    html[data-theme="light"] {
      --bg: #fafafa;
      --surface: #ffffff;
      --surface-muted: #f4f4f5;
      --surface-hover: #ebebee;
      --border: #e4e4e7;
      --border-strong: #d4d4d8;
      --text: #09090b;
      --text-muted: #71717a;
      --text-subtle: #a1a1aa;
      --primary: #18181b;
      --primary-hover: #27272a;
      --primary-fg: #fafafa;
      --accent: #52525b;
      --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
      --card-shadow-hover: 0 6px 20px rgba(0, 0, 0, 0.06);
      --input-bg: #ffffff;
      --tag-bg: #f4f4f5;
      --tag-border: #e4e4e7;
    }

    /* Dark Theme (Quiet Neutral Grayscale - DESIGN.md) */
    html[data-theme="dark"] {
      --bg: #09090b;
      --surface: #121215;
      --surface-muted: #18181d;
      --surface-hover: #22222a;
      --border: #27272a;
      --border-strong: #3f3f46;
      --text: #fafafa;
      --text-muted: #a1a1aa;
      --text-subtle: #71717a;
      --primary: #fafafa;
      --primary-hover: #e4e4e7;
      --primary-fg: #09090b;
      --accent: #d4d4d8;
      --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      --card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.6);
      --input-bg: #0c0c0f;
      --tag-bg: #18181d;
      --tag-border: #27272a;
    }

    ::selection {
      background-color: #18181b;
      color: #fafafa;
      text-shadow: none;
    }
    html[data-theme="dark"] ::selection {
      background-color: #fafafa;
      color: #09090b;
      text-shadow: none;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      min-height: 100vh;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      transition: background-color var(--motion-normal) ease, color var(--motion-normal) ease;
    }

    /* ─── App Shell & Sidebar Layout ─────────────────────────── */
    .app-shell {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg);
    }

    .app-sidebar {
      width: 250px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: var(--space-lg);
      gap: var(--space-md);
      overflow-y: auto;
      z-index: 50;
      box-shadow: 1px 0 3px rgba(0,0,0,0.02);
    }

    .sidebar-brand {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--border);
    }
    .brand-title {
      font-family: var(--font-serif);
      font-size: 21px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .brand-subtitle {
      font-size: 11.5px;
      color: var(--text-muted);
      line-height: 1.3;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .nav-tab-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      width: 100%;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all var(--motion-fast) ease;
    }
    .nav-tab-btn:hover {
      color: var(--text);
      background: var(--surface-muted);
    }
    .nav-tab-btn.active {
      background: var(--surface-muted);
      color: var(--text);
      font-weight: 600;
      border-color: var(--border);
    }
    .nav-tab-badge {
      margin-left: auto;
      font-size: 11px;
      font-weight: 600;
      padding: 1px 7px;
      border-radius: 10px;
      background: var(--surface);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .nav-tab-btn.active .nav-tab-badge {
      background: var(--primary);
      color: var(--primary-fg);
      border-color: var(--primary);
    }

    /* System Quick Metrics in Sidebar */
    .sidebar-widget {
      margin-top: auto;
      background: var(--surface-muted);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      color: var(--text-subtle);
    }
    .widget-link {
      font-size: 10.5px;
      color: var(--text-muted);
      text-decoration: none;
    }
    .widget-link:hover {
      color: var(--text);
      text-decoration: underline;
    }
    .widget-metrics {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .widget-metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    .widget-metric-lbl {
      color: var(--text-muted);
    }
    .widget-metric-val {
      font-weight: 600;
      font-family: var(--font-mono);
      color: var(--text);
    }

    .sidebar-footer {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding-top: var(--space-sm);
      border-top: 1px solid var(--border);
    }
    .sidebar-btn-theme {
      width: 100%;
      justify-content: center;
    }

    /* Main Workspace */
    .app-main {
      flex: 1;
      min-width: 0;
      padding: var(--space-xl) var(--space-xxl);
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .tab-view {
      display: none;
    }
    .tab-view.active {
      display: block;
      animation: fadeIn var(--motion-normal) ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── Bento Cards ────────────────────────────────────────── */
    .bento-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .bento-full {
      width: 100%;
    }

    /* ─── Studio 2-Column Grid ─────────────────────────────── */
    .studio-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
      align-items: start;
    }
    @media (max-width: 1100px) {
      .studio-grid {
        grid-template-columns: 1fr;
      }
    }
    .studio-console-card {
      padding: var(--space-xl);
    }
    .studio-preview-card {
      padding: var(--space-xl);
      min-height: 440px;
      display: flex;
      flex-direction: column;
    }
    .studio-showcase-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 1px dashed var(--border);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      background: var(--surface-muted);
      margin-top: var(--space-sm);
      min-height: 280px;
    }
    .showcase-empty {
      text-align: center;
      max-width: 280px;
    }
    .showcase-empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .showcase-empty-title {
      font-family: var(--font-serif);
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }
    .showcase-empty-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .showcase-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .showcase-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .showcase-img-wrap {
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--surface);
      text-align: center;
      max-height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .showcase-img {
      max-width: 100%;
      max-height: 260px;
      object-fit: contain;
      cursor: pointer;
    }
    .showcase-prompt {
      font-size: 11.5px;
      color: var(--text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media (max-width: 900px) {
      .app-shell {
        flex-direction: column;
      }
      .app-sidebar {
        width: 100%;
        height: auto;
        position: relative;
        border-right: none;
        border-bottom: 1px solid var(--border);
        padding: var(--space-md);
      }
      .sidebar-nav {
        flex-direction: row;
      }
      .sidebar-widget {
        display: none;
      }
      .app-main {
        padding: var(--space-lg) var(--space-md);
      }
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-lg);
      gap: var(--space-md);
    }
    .card-title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .card-eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
      color: var(--text-subtle);
    }
    .card-title {
      font-family: var(--font-serif);
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: -0.01em;
    }
    .card-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ─── Badges ─────────────────────────────────────────────── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 11.5px;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .badge-success { background: rgba(22, 163, 74, 0.12); color: var(--success); }
    .badge-warning { background: rgba(217, 119, 6, 0.12); color: var(--warning); }
    .badge-danger  { background: rgba(220, 38, 38, 0.12); color: var(--danger); }
    .badge-info    { background: rgba(37, 99, 235, 0.12); color: var(--info); }
    .badge-neutral { background: var(--surface-muted); color: var(--text-muted); border: 1px solid var(--border); }

    /* ─── Buttons ────────────────────────────────────────────── */
    .btn-primary {
      background: var(--primary);
      color: var(--primary-fg);
      border: 1px solid var(--primary);
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all var(--motion-fast) ease;
    }
    .btn-primary:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .btn-secondary {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 7px 14px;
      border-radius: var(--radius-sm);
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all var(--motion-fast) ease;
    }
    .btn-secondary:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
    }
    .btn-quiet {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      transition: all var(--motion-fast) ease;
    }
    .btn-quiet:hover {
      color: var(--text);
      border-color: var(--border-strong);
      background: var(--surface-muted);
    }
    .btn-danger-quiet {
      background: transparent;
      color: var(--danger);
      border: 1px solid rgba(220, 38, 38, 0.3);
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all var(--motion-fast) ease;
    }
    .btn-danger-quiet:hover {
      background: rgba(220, 38, 38, 0.1);
      border-color: var(--danger);
    }

    /* ─── Studio Form ────────────────────────────────────────── */
    .studio-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .studio-input, .studio-textarea {
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 13px;
      width: 100%;
      transition: border-color var(--motion-fast) ease;
    }
    .studio-input:focus, .studio-textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    /* Quick prompt chips */
    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-top: 4px;
    }
    .chips-label {
      font-size: 11px;
      color: var(--text-subtle);
      font-weight: 500;
    }
    .prompt-chip {
      background: var(--surface-muted);
      border: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 11px;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--motion-fast) ease;
    }
    .prompt-chip:hover {
      color: var(--text);
      border-color: var(--border-strong);
      background: var(--surface-hover);
    }

    /* Dropzone */
    .dropzone-container {
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-sm);
      padding: var(--space-md);
      text-align: center;
      cursor: pointer;
      background: var(--surface-muted);
      transition: all var(--motion-fast) ease;
      position: relative;
    }
    .dropzone-container:hover {
      border-color: var(--primary);
    }
    .dropzone-icon { font-size: 20px; margin-bottom: 2px; }
    .dropzone-title { font-size: 12px; font-weight: 600; color: var(--text); display: block; }
    .dropzone-hint { font-size: 11px; color: var(--text-muted); display: block; }
    .dropzone-preview {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .dropzone-preview.active { display: flex; }
    .dropzone-thumb {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .file-input-hidden { display: none; }

    /* Live Tracker */
    .tracker {
      display: none;
      margin-top: var(--space-lg);
      padding: var(--space-md);
      border-radius: var(--radius-md);
      background: var(--surface-muted);
      border: 1px solid var(--border);
    }
    .tracker.active { display: block; }
    .tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .tracker-title { font-size: 13px; font-weight: 600; }
    .tracker-desc { font-size: 12px; color: var(--text-muted); }

    /* Metric Grid */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-sm);
    }
    .metric-tile {
      background: var(--surface-muted);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px;
      text-align: center;
    }
    .metric-val {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
      display: block;
      line-height: 1.1;
    }
    .metric-lbl {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      display: block;
    }

    /* ─── Profile Manager Specific Styles ─────────────────────── */
    .profiles-hero-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      margin-bottom: var(--space-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-md);
      box-shadow: var(--card-shadow);
    }
    .profiles-kpi-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    @media (max-width: 800px) {
      .profiles-kpi-bar { grid-template-columns: repeat(2, 1fr); }
    }
    .profiles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }

    .profile-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      transition: transform var(--motion-fast) ease, box-shadow var(--motion-fast) ease, border-color var(--motion-fast) ease;
      position: relative;
    }
    .profile-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-shadow-hover);
      border-color: var(--border-strong);
    }
    .profile-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-sm);
    }
    .profile-identity {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .profile-chrome-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--surface-muted);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .profile-label-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      line-height: 1.2;
    }
    .profile-id-sub {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .profile-details-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: var(--surface-muted);
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      font-size: 12px;
    }
    .profile-detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .detail-k { color: var(--text-muted); font-size: 11.5px; }
    .detail-v {
      font-weight: 500;
      color: var(--text);
      text-align: right;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-actions-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .profile-action-btn {
      flex: 1;
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all var(--motion-fast) ease;
    }
    .profile-action-btn:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
    }
    .profile-action-btn.btn-login {
      background: var(--primary);
      color: var(--primary-fg);
      border-color: var(--primary);
    }
    .profile-action-btn.btn-login:hover {
      background: var(--primary-hover);
    }

    /* ─── Tables ─────────────────────────────────────────────── */
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-md);
      flex-wrap: wrap;
    }
    .filter-tabs {
      display: flex;
      gap: 4px;
      background: var(--surface-muted);
      padding: 3px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .filter-btn {
      background: transparent;
      border: none;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--motion-fast) ease;
    }
    .filter-btn.active {
      background: var(--surface);
      color: var(--text);
      font-weight: 600;
    }
    .search-input {
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      font-size: 12px;
      width: 220px;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .table-responsive {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      text-align: left;
    }
    table.data-table th {
      padding: 10px 14px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--surface-muted);
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    table.data-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
      background: var(--surface);
    }
    table.data-table tr:last-child td { border-bottom: none; }
    table.data-table tr:hover td { background: var(--surface-hover); }

    .prompt-preview {
      max-width: 320px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--text);
    }
    .job-thumb-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding: 2px 0;
    }
    .job-thumb-cell {
      position: relative;
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border);
      background: #000;
      line-height: 0;
    }
    .job-thumb-cell img {
      width: 52px;
      height: 36px;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }

    /* Gallery */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .gallery-card {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--surface-muted);
      aspect-ratio: 16/10;
      transition: transform var(--motion-normal) ease, box-shadow var(--motion-normal) ease;
    }
    .gallery-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-shadow-hover);
    }
    .gallery-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }
    .gallery-card-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%);
      opacity: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--space-md);
      transition: opacity var(--motion-fast) ease;
    }
    .gallery-card:hover .gallery-card-overlay { opacity: 1; }

    /* ─── Modals ─────────────────────────────────────────────── */
    .modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
    }
    .modal.active { display: flex; animation: fadeIn var(--motion-fast) ease; }
    .modal-box {
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      max-width: 520px;
      width: 100%;
      overflow: hidden;
      box-shadow: var(--card-shadow-hover);
      display: flex;
      flex-direction: column;
    }
    .modal-box-lg { max-width: 800px; }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-lg);
      border-bottom: 1px solid var(--border);
    }
    .modal-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }
    .modal-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }
    .modal-close-btn:hover { color: var(--text); }
    .modal-body {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      max-height: 75vh;
      overflow-y: auto;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: var(--space-md) var(--space-lg);
      border-top: 1px solid var(--border);
      background: var(--surface-muted);
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: currentColor;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="app-shell">
    <!-- Left Sidebar Navigation -->
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <h1 class="brand-title">
          <span>Flow Studio Core</span>
        </h1>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-success"><span class="badge-dot"></span> Online</span>
          <span class="brand-subtitle">Google Flow Engine</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="sidebar-nav">
        <button type="button" class="nav-tab-btn active" id="tabBtnStudio" onclick="switchMainTab('studio')">
          <span>🎨</span>
          <span>Studio Sáng Tạo</span>
        </button>
        <button type="button" class="nav-tab-btn" id="tabBtnProfiles" onclick="switchMainTab('profiles')">
          <span>👤</span>
          <span>Chrome Profiles</span>
          <span class="nav-tab-badge" id="navProfilesCount">0</span>
        </button>
      </nav>

      <!-- System Quick Metrics in Sidebar -->
      <div class="sidebar-widget">
        <div class="widget-header">
          <span>Hệ thống</span>
          <a href="/api/health" target="_blank" class="widget-link" title="Kiểm tra trạng thái REST API">/api/health ↗</a>
        </div>
        <div class="widget-metrics">
          <div class="widget-metric-row">
            <span class="widget-metric-lbl">Hàng đợi</span>
            <span class="widget-metric-val" id="metricQueueCount">0</span>
          </div>
          <div class="widget-metric-row">
            <span class="widget-metric-lbl">Tài khoản</span>
            <span class="widget-metric-val" id="metricAccountsCount">0/0</span>
          </div>
          <div class="widget-metric-row">
            <span class="widget-metric-lbl">Ảnh đã tạo</span>
            <span class="widget-metric-val" id="metricGalleryCount">0</span>
          </div>
        </div>
      </div>

      <!-- Sidebar Footer: Theme Toggle -->
      <div class="sidebar-footer">
        <button id="themeToggleBtn" class="btn-quiet sidebar-btn-theme" title="Chuyển chế độ Sáng / Tối" onclick="toggleTheme()">
          <span id="themeIcon">☀</span> <span id="themeLabel">Chế độ Sáng</span>
        </button>
      </div>
    </aside>

    <!-- Main Workspace -->
    <main class="app-main">
      <!-- ============================================================ -->
      <!-- TAB VIEW 1: STUDIO SÁNG TẠO (T2I / I2I)                      -->
      <!-- ============================================================ -->
      <div id="viewStudio" class="tab-view active">
        <!-- 2-Column Studio Grid: Creation Console (Left) + Live Preview & Showcase (Right) -->
        <div class="studio-grid">
          <!-- LEFT: Form Console -->
          <section class="bento-card studio-console-card">
            <div class="card-head">
              <div class="card-title-group">
                <span class="card-eyebrow">Studio Sáng Tạo</span>
                <h2 class="card-title">Tạo ảnh mới (T2I / I2I)</h2>
                <p class="card-desc">Sinh ảnh sắc nét với Imagen 3 qua câu lệnh ngôn ngữ tự nhiên hoặc ảnh mẫu</p>
              </div>
              <span id="studioModeBadge" class="badge badge-neutral">Chế độ T2I</span>
            </div>

            <form id="jobForm" class="studio-form">
              <div class="form-group">
                <label class="form-label" for="prompt">
                  <span>Câu lệnh mô tả (Prompt)</span>
                  <span id="promptCharCount" style="font-size: 11px; font-weight: normal; color: var(--text-subtle);"></span>
                </label>
                <textarea id="prompt" class="studio-textarea" rows="3" required placeholder="Nhập câu lệnh tạo ảnh chi tiết (ví dụ: a stickman with many pose, detailed sketches, 8k resolution)..."></textarea>
                
                <!-- Quick Chips -->
                <div class="chips-row">
                  <span class="chips-label">Gợi ý nhanh:</span>
                  <button type="button" class="prompt-chip" data-prompt="a stickman with many pose and detailed item">✦ Stickman poses</button>
                  <button type="button" class="prompt-chip" data-prompt="cyberpunk city at midnight with volumetric neon fog">✦ Cyberpunk city</button>
                  <button type="button" class="prompt-chip" data-prompt="a cute golden retriever puppy sitting on grass, sunlight">✦ Golden retriever</button>
                  <button type="button" class="prompt-chip" data-prompt="3d boy is in island japan, studio ghibli anime style">✦ 3D boy in Japan</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span>Ảnh tham chiếu (Tùy chọn - Chế độ Image-to-Image)</span>
                </label>
                <div class="dropzone-container" id="dropzoneBox">
                  <div class="dropzone-icon">📷</div>
                  <div class="dropzone-text" id="dropzoneText">
                    <span class="dropzone-title">Chọn hoặc kéo thả ảnh mẫu vào đây</span>
                    <span class="dropzone-hint">Hỗ trợ PNG, JPG, WebP. Tự động upload & liên kết asset cho Google Flow.</span>
                  </div>
                  <div class="dropzone-preview" id="dropzonePreview">
                    <img id="refImageThumb" class="dropzone-thumb" src="" alt="Thumbnail" />
                    <button type="button" id="clearRefBtn" class="btn-quiet" style="padding: 3px 8px; font-size: 11px;">✕ Gỡ bỏ</button>
                  </div>
                  <input type="file" id="refImage" class="file-input-hidden" accept="image/*" />
                </div>
              </div>

              <button type="submit" id="submitBtn" class="btn-primary" style="width: 100%; margin-top: 4px;">
                <span>✨ Gửi yêu cầu tạo ảnh vào Hàng đợi</span>
              </button>
            </form>
          </section>

          <!-- RIGHT: Live Output & Result Showcase Panel -->
          <section class="bento-card studio-preview-card">
            <div class="card-head">
              <div class="card-title-group">
                <span class="card-eyebrow">Khung Xem Trước & Kết Quả</span>
                <h2 class="card-title">Tác phẩm & Tiến trình Live</h2>
                <p class="card-desc">Hiển thị tiến độ sinh ảnh và xem trước tác phẩm trực quan</p>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-info" style="font-size: 11px;">⚡ Imagen 3</span>
              </div>
            </div>

            <!-- Live Tracker (active when job in progress or recently completed) -->
            <div id="liveTracker" class="tracker" style="margin-top: 0;">
              <div class="tracker-header">
                <strong class="tracker-title" id="trackerTitle">⚙️ Tiến trình xử lý Job</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span id="trackerBadge" class="badge badge-info"><span class="spinner"></span> Đang xử lý</span>
                  <button type="button" id="closeTrackerBtn" class="btn-quiet" style="padding: 2px 7px; font-size: 11px;">✕ Đóng</button>
                </div>
              </div>
              <div class="tracker-desc" id="trackerDesc">Đang chuẩn bị phiên làm việc...</div>
              <div id="trackerOutputs"></div>
            </div>

            <!-- Idle Showcase Box (shown when liveTracker is not active) -->
            <div id="studioShowcaseBox" class="studio-showcase-box">
              <div class="showcase-empty" id="showcaseEmpty">
                <div class="showcase-empty-icon">🎨</div>
                <h4 class="showcase-empty-title">Không gian sáng tạo sẵn sàng</h4>
                <p class="showcase-empty-desc">Nhập câu lệnh prompt bên trái và bấm <strong>Gửi yêu cầu</strong>. Tiến trình sinh ảnh và kết quả độ phân giải cao sẽ xuất hiện trực tiếp tại đây.</p>
              </div>
              <div class="showcase-content" id="showcaseContent" style="display: none;">
                <div class="showcase-head">
                  <span class="badge badge-success" style="font-size: 10.5px;">✓ Tác phẩm mới nhất</span>
                  <button type="button" class="btn-quiet" id="showcaseUsePromptBtn" style="font-size: 11px; padding: 2px 8px;">⚡ Dùng prompt này</button>
                </div>
                <div class="showcase-img-wrap">
                  <img id="showcaseImg" src="" alt="Latest generated" class="showcase-img preview-clickable" />
                </div>
                <p class="showcase-prompt" id="showcasePrompt"></p>
              </div>
            </div>
          </section>
        </div>

      <!-- FULL SECTION: Lịch sử Jobs gần đây -->
      <section class="bento-card bento-full" style="margin-bottom: var(--space-xl);">
        <div class="card-head">
          <div class="card-title-group">
            <span class="card-eyebrow">Nhật ký & Tiến trình</span>
            <h2 class="card-title">Lịch sử Jobs gần đây</h2>
            <p class="card-desc">Kiểm tra kết quả sinh ảnh, tải ảnh chất lượng gốc (PNG) và sao chép prompt</p>
          </div>
        </div>

        <div class="table-toolbar">
          <div class="filter-tabs">
            <button type="button" class="filter-btn active" data-filter="all">Tất cả</button>
            <button type="button" class="filter-btn" data-filter="succeeded">✅ Đã xong</button>
            <button type="button" class="filter-btn" data-filter="running">⚙️ Đang chạy</button>
            <button type="button" class="filter-btn" data-filter="failed">❌ Lỗi</button>
          </div>
          <input type="text" id="jobSearchInput" class="search-input" placeholder="🔍 Tìm kiếm Prompt hoặc Job ID..." />
        </div>

        <div class="table-responsive">
          <table id="jobsTable" class="data-table">
            <thead>
              <tr>
                <th style="width: 140px;">Mã Job</th>
                <th style="min-width: 260px;">Câu lệnh (Prompt)</th>
                <th style="width: 120px;">Trạng thái</th>
                <th style="min-width: 250px;">Ảnh kết quả & Tải về</th>
                <th style="width: 110px;">Thời gian</th>
              </tr>
            </thead>
            <tbody id="jobsTbody">
              <tr><td colspan="5" style="color: var(--text-muted); text-align: center;">Đang tải danh sách jobs...</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- FULL SECTION: Thư viện Ảnh đã tạo -->
      <section class="bento-card bento-full">
        <div class="card-head">
          <div class="card-title-group">
            <span class="card-eyebrow">Thư viện Kết quả</span>
            <h2 class="card-title">Thư viện Ảnh đã tạo</h2>
            <p class="card-desc">Tập hợp toàn bộ các sản phẩm đồ họa được trích xuất trực tiếp từ Google Flow</p>
          </div>
          <span class="badge badge-neutral" id="galleryCount">0 ảnh</span>
        </div>

        <div class="gallery-grid" id="gallery"></div>
      </section>
    </div>

    <!-- ============================================================ -->
    <!-- TAB VIEW 2: QUẢN LÝ CHROME PROFILES (ACCOUNT POOL)           -->
    <!-- ============================================================ -->
    <div id="viewProfiles" class="tab-view">
      <!-- Header Banner Card -->
      <div class="profiles-hero-card">
        <div>
          <span class="card-eyebrow">Hồ sơ trình duyệt</span>
          <h2 class="card-title" style="font-size: 24px;">Quản Lý Chrome Profiles</h2>
          <p class="card-desc">Tạo, chỉnh sửa, xóa và mở trình duyệt Chrome để đăng nhập Google Flow trực tiếp trên giao diện web.</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <button type="button" class="btn-quiet" onclick="fetchAccounts()">
            <span>🔄 Làm mới</span>
          </button>
          <button type="button" class="btn-primary" onclick="openCreateProfileModal()">
            <span>➕ Thêm Profile Mới</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Bar -->
      <div class="profiles-kpi-bar">
        <div class="metric-tile">
          <span class="metric-val" id="kpiTotalProfiles">0</span>
          <span class="metric-lbl">Tổng số Profiles</span>
        </div>
        <div class="metric-tile">
          <span class="metric-val" style="color: var(--success);" id="kpiAuthProfiles">0</span>
          <span class="metric-lbl">Đã xác thực Google</span>
        </div>
        <div class="metric-tile">
          <span class="metric-val" style="color: var(--warning);" id="kpiUnauthProfiles">0</span>
          <span class="metric-lbl">Chưa đăng nhập / Cần kiểm tra</span>
        </div>
        <div class="metric-tile">
          <span class="metric-val" style="color: var(--info);" id="kpiBusyProfiles">0</span>
          <span class="metric-lbl">Đang chạy job tạo ảnh</span>
        </div>
      </div>

      <!-- Profiles Grid Cards -->
      <div class="profiles-grid" id="profilesCardsContainer">
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">
          Đang tải danh sách Chrome profiles...
        </div>
      </div>
    </div>
  </main>
</div>

  <!-- ─── Modal 1: Image Lightbox ─────────────────────────────── -->
  <div id="imageModal" class="modal">
    <div class="modal-box modal-box-lg">
      <div class="modal-header">
        <strong id="modalTitle">Xem ảnh chi tiết</strong>
        <button type="button" class="modal-close-btn" id="modalCloseBtn">✕</button>
      </div>
      <div class="modal-body" style="padding: 0; background: #000; align-items: center; justify-content: center;">
        <img id="modalImg" src="" style="max-height: 70vh; max-width: 100%; object-fit: contain;" alt="Preview" />
      </div>
      <div class="modal-footer">
        <div id="modalPrompt" class="prompt-preview" style="flex: 1; font-size: 12px;"></div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-quiet" id="modalReuseBtn">⚡ Dùng prompt này</button>
          <a id="modalDownloadBtn" href="" download="flow-image.png" class="btn-primary" style="text-decoration: none;">⬇ Tải file gốc (PNG)</a>
        </div>
      </div>
    </div>
  </div>

  <!-- ─── Modal 2: Create Chrome Profile ───────────────────────── -->
  <div id="createProfileModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3>➕ Thêm Chrome Profile Mới</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('createProfileModal')">✕</button>
      </div>
      <form id="createProfileForm">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="newAccountId">
              <span>Mã Profile ID (Account ID)</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">Dùng đặt tên thư mục profile</span>
            </label>
            <input type="text" id="newAccountId" class="studio-input" required placeholder="ví dụ: account-2, acc-marketing" pattern="[a-zA-Z0-9_-]+" title="Chỉ chứa chữ cái, số, gạch nối và gạch dưới" />
          </div>

          <div class="form-group">
            <label class="form-label" for="newAccountLabel">
              <span>Tên hiển thị (Label)</span>
            </label>
            <input type="text" id="newAccountLabel" class="studio-input" required placeholder="ví dụ: Tài khoản Marketing, Acc Phụ 1" />
          </div>

          <div class="form-group">
            <label class="form-label" for="newRemoteProjectId">
              <span>Flow Remote Project ID (Tùy chọn)</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">Tự động phát hiện khi đăng nhập</span>
            </label>
            <input type="text" id="newRemoteProjectId" class="studio-input" placeholder="ví dụ: 79272edb-389a-4aa8-b735-7c47017a2cd3 hoặc link URL" />
          </div>

          <div style="margin-top: 6px; display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="autoLaunchLogin" style="cursor: pointer;" checked />
            <label for="autoLaunchLogin" style="font-size: 12.5px; cursor: pointer; color: var(--text);">
              Mở trình duyệt Chrome để đăng nhập Google ngay sau khi tạo
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-quiet" onclick="closeModal('createProfileModal')">Hủy</button>
          <button type="submit" id="btnCreateProfileSubmit" class="btn-primary">Tạo Profile</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ─── Modal 3: Edit Chrome Profile ─────────────────────────── -->
  <div id="editProfileModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3>✏️ Chỉnh Sửa Chrome Profile</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('editProfileModal')">✕</button>
      </div>
      <form id="editProfileForm">
        <input type="hidden" id="editAccountId" />
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Profile ID</label>
            <input type="text" id="editAccountIdDisplay" class="studio-input" disabled style="opacity: 0.7; font-family: var(--font-mono);" />
          </div>

          <div class="form-group">
            <label class="form-label" for="editAccountLabel">Tên hiển thị (Label)</label>
            <input type="text" id="editAccountLabel" class="studio-input" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="editRemoteProjectId">Flow Remote Project ID</label>
            <input type="text" id="editRemoteProjectId" class="studio-input" placeholder="Nhập remote project UUID hoặc dán link Flow" />
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
            <input type="checkbox" id="editAccountEnabled" style="cursor: pointer;" />
            <label for="editAccountEnabled" style="font-size: 12.5px; cursor: pointer; color: var(--text);">
              Kích hoạt tài khoản này trong hàng đợi tạo ảnh (Enabled)
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-quiet" onclick="closeModal('editProfileModal')">Hủy</button>
          <button type="submit" class="btn-primary">Lưu Thay Đổi</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ─── Modal 4: Delete Chrome Profile ───────────────────────── -->
  <div id="deleteProfileModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="color: var(--danger);">🗑️ Xác Nhận Xóa Chrome Profile</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('deleteProfileModal')">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 13.5px; color: var(--text);">
          Bạn có chắc chắn muốn xóa profile <strong id="deleteAccountName" style="color: var(--danger);"></strong> (ID: <span id="deleteAccountId" style="font-family: var(--font-mono);"></span>) không?
        </p>
        <p style="font-size: 12px; color: var(--text-muted);">
          Thao tác này sẽ gỡ bỏ tài khoản và các liên kết dự án khỏi cơ sở dữ liệu.
        </p>

        <div style="background: var(--surface-muted); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-top: 6px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px;">
            <input type="checkbox" id="deleteDiskCheckbox" style="cursor: pointer;" />
            <span>Đồng thời xóa toàn bộ dữ liệu & cookies trên ổ đĩa (<code id="deleteDiskPath"></code>)</span>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-quiet" onclick="closeModal('deleteProfileModal')">Hủy</button>
        <button type="button" id="btnConfirmDelete" class="btn-danger-quiet" style="background: var(--danger); color: #fff; border: none; font-weight: 600;">Xác Nhận Xóa</button>
      </div>
    </div>
  </div>

  <!-- ─── Modal 5: Live Login Tracker Modal ────────────────────── -->
  <div id="loginTrackerModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3 id="loginModalTitle">🔑 Đăng Nhập Google Flow</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('loginTrackerModal')">✕</button>
      </div>
      <div class="modal-body" style="text-align: center; padding: var(--space-xl) var(--space-lg);">
        <div id="loginModalSpinner" style="font-size: 36px; margin-bottom: 12px;">🌐</div>
        <h4 id="loginModalStatus" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Đang khởi chạy Google Chrome...</h4>
        <p id="loginModalHint" style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5; max-width: 400px; margin: 0 auto;">
          Cửa sổ Chrome thật vừa được mở trên màn hình của bạn. Hãy đăng nhập tài khoản Google và mở 1 Project trên Google Flow để hệ thống tự động xác minh.
        </p>
      </div>
      <div class="modal-footer" style="justify-content: center;">
        <button type="button" class="btn-quiet" onclick="closeModal('loginTrackerModal')">Thu nhỏ & Tiếp tục</button>
      </div>
    </div>
  </div>

  <!-- ─── Core Script ──────────────────────────────────────────── -->
  <script>
    const renderedAssetKeys = new Set();
    let currentPollingJobId = null;
    let allFetchedJobs = [];
    let currentFilterStatus = 'all';
    let searchQuery = '';
    let accountsDataCache = [];
    let activeLoginPollingInterval = null;

    // Theme Management
    function initTheme() {
      const savedTheme = localStorage.getItem('flow_studio_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      updateThemeUI(savedTheme);
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('flow_studio_theme', next);
      updateThemeUI(next);
    }

    function updateThemeUI(theme) {
      const icon = document.getElementById('themeIcon');
      const label = document.getElementById('themeLabel');
      if (theme === 'dark') {
        if (icon) icon.innerText = '☀';
        if (label) label.innerText = 'Chế độ Sáng';
      } else {
        if (icon) icon.innerText = '🌙';
        if (label) label.innerText = 'Chế độ Tối';
      }
    }
    initTheme();

    // Main Tab Switching
    function switchMainTab(tabId) {
      const btnStudio = document.getElementById('tabBtnStudio');
      const btnProfiles = document.getElementById('tabBtnProfiles');
      const viewStudio = document.getElementById('viewStudio');
      const viewProfiles = document.getElementById('viewProfiles');

      if (tabId === 'profiles') {
        btnStudio.classList.remove('active');
        btnProfiles.classList.add('active');
        viewStudio.classList.remove('active');
        viewProfiles.classList.add('active');
        localStorage.setItem('flow_studio_tab', 'profiles');
        renderProfilesManager();
      } else {
        btnProfiles.classList.remove('active');
        btnStudio.classList.add('active');
        viewProfiles.classList.remove('active');
        viewStudio.classList.add('active');
        localStorage.setItem('flow_studio_tab', 'studio');
      }
    }

    const savedTab = localStorage.getItem('flow_studio_tab');
    if (savedTab === 'profiles') {
      switchMainTab('profiles');
    }

    // Modal Helpers
    function openModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.add('active');
    }

    function closeModal(modalId) {
      const el = document.getElementById(modalId);
      if (el) el.classList.remove('active');
      if (modalId === 'loginTrackerModal' && activeLoginPollingInterval) {
        clearInterval(activeLoginPollingInterval);
        activeLoginPollingInterval = null;
      }
    }

    document.querySelectorAll('.modal').forEach(m => {
      m.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
          closeModal(e.target.id);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => closeModal(m.id));
      }
    });

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ─── ACCOUNTS FETCHING & RENDERING ───────────────────────────
    async function fetchAccounts() {
      try {
        const res = await fetch('/api/accounts');
        const data = await res.json();
        const accounts = data.accounts || [];
        accountsDataCache = accounts;

        // Update nav badge & pool summary
        const navCount = document.getElementById('navProfilesCount');
        if (navCount) navCount.innerText = accounts.length;

        const poolSummary = document.getElementById('poolSummary');
        if (poolSummary) poolSummary.innerText = accounts.length + ' tài khoản';

        // Update mini-table on Studio Sidebar
        const tbody = document.getElementById('accountsTbody');
        const metricAccounts = document.getElementById('metricAccountsCount');

        let availableCount = 0;
        let miniHtml = '';
        for (const a of accounts) {
          const isAuthed = a.sessionStatus === 'authenticated';
          const sessionBadge = isAuthed ? 'badge-success' : 'badge-warning';
          const isBusy = a.isBusy;
          if (!isBusy && isAuthed) availableCount++;

          const busyBadge = isBusy ? 'badge-warning' : 'badge-success';
          const busyText = isBusy ? ('Bận (' + (a.activeOperation || 'Đang tạo') + ')') : 'Sẵn sàng';

          miniHtml += '<tr>' +
            '<td style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 600;">' + escapeHtml(a.id) + '</td>' +
            '<td><span style="font-weight: 500;">' + escapeHtml(a.label) + '</span></td>' +
            '<td><span class="badge ' + sessionBadge + '"><span class="badge-dot"></span> ' + escapeHtml(a.sessionStatus) + '</span></td>' +
            '<td><span class="badge ' + busyBadge + '"><span class="badge-dot"></span> ' + busyText + '</span></td>' +
          '</tr>';
        }

        if (metricAccounts) {
          metricAccounts.innerText = availableCount + '/' + accounts.length;
        }

        if (tbody) {
          tbody.innerHTML = miniHtml || '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Chưa có tài khoản nào được kết nối.</td></tr>';
        }

        // Update Profiles Manager view if visible
        renderProfilesManager();
      } catch (e) {
        console.error('Error fetching accounts:', e);
      }
    }

    // Render Profiles Manager View
    function renderProfilesManager() {
      const container = document.getElementById('profilesCardsContainer');
      if (!container) return;

      const accounts = accountsDataCache;

      // Update KPI
      let authed = 0, unauthed = 0, busy = 0;
      accounts.forEach(a => {
        if (a.sessionStatus === 'authenticated') authed++;
        else unauthed++;
        if (a.isBusy) busy++;
      });

      const kpiTotal = document.getElementById('kpiTotalProfiles');
      const kpiAuth = document.getElementById('kpiAuthProfiles');
      const kpiUnauth = document.getElementById('kpiUnauthProfiles');
      const kpiBusy = document.getElementById('kpiBusyProfiles');

      if (kpiTotal) kpiTotal.innerText = accounts.length;
      if (kpiAuth) kpiAuth.innerText = authed;
      if (kpiUnauth) kpiUnauth.innerText = unauthed;
      if (kpiBusy) kpiBusy.innerText = busy;

      if (accounts.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 48px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-lg);">' +
          '<div style="font-size: 32px; margin-bottom: 12px;">👤</div>' +
          '<h3 style="font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 6px;">Chưa có Chrome Profile nào</h3>' +
          '<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Tạo profile mới để mở Chrome đăng nhập tài khoản Google Flow của bạn.</p>' +
          '<button type="button" class="btn-primary" onclick="openCreateProfileModal()">➕ Thêm Profile Mới</button>' +
        '</div>';
        return;
      }

      let cardsHtml = '';
      for (const a of accounts) {
        const isAuthed = a.sessionStatus === 'authenticated';
        const sessionBadge = isAuthed ? 'badge-success' : (a.sessionStatus === 'checking' ? 'badge-info' : 'badge-warning');
        const sessionLabel = isAuthed ? 'Đã xác thực Google' : (a.sessionStatus === 'checking' ? 'Đang kiểm tra...' : 'Chưa đăng nhập');

        const isBusy = a.isBusy;
        const busyBadge = isBusy ? 'badge-warning' : 'badge-neutral';
        const busyLabel = isBusy ? ('Đang bận (' + (a.activeOperation || 'Đang tạo') + ')') : 'Sẵn sàng';

        const emailDisplay = a.observedPrincipal ? escapeHtml(a.observedPrincipal) : '<span style="color: var(--text-subtle); font-style: italic;">Chưa ghi nhận</span>';
        const remoteProjId = a.remoteProjectId ? escapeHtml(a.remoteProjectId) : '';
        const projectLink = remoteProjId 
          ? '<a href="https://flow.google.com/project/' + remoteProjId + '" target="_blank" style="color: var(--primary); text-decoration: none; font-family: var(--font-mono); font-size: 11px;">' + remoteProjId.slice(0, 16) + '... ↗</a>' 
          : '<span style="color: var(--text-subtle); font-style: italic;">Chưa liên kết</span>';

        const diskStatus = a.profileExistsOnDisk 
          ? '<span class="badge badge-neutral" style="font-size: 10.5px;">📁 Đã tạo trên đĩa</span>' 
          : '<span class="badge badge-warning" style="font-size: 10.5px;">⚠️ Chưa có thư mục</span>';

        const toggleChecked = a.enabled ? 'checked' : '';

        cardsHtml += '<div class="profile-card" id="card-' + a.id + '">' +
          '<div class="profile-card-top">' +
            '<div class="profile-identity">' +
              '<div class="profile-chrome-icon">🌐</div>' +
              '<div>' +
                '<h4 class="profile-label-title">' + escapeHtml(a.label) + '</h4>' +
                '<div class="profile-id-sub">ID: ' + escapeHtml(a.id) + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">' +
              '<span class="badge ' + sessionBadge + '"><span class="badge-dot"></span> ' + sessionLabel + '</span>' +
              '<span class="badge ' + busyBadge + '" style="font-size: 10.5px;"><span class="badge-dot"></span> ' + busyLabel + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="profile-details-list">' +
            '<div class="profile-detail-row">' +
              '<span class="detail-k">Google Email:</span>' +
              '<span class="detail-v">' + emailDisplay + '</span>' +
            '</div>' +
            '<div class="profile-detail-row">' +
              '<span class="detail-k">Flow Project:</span>' +
              '<span class="detail-v">' + projectLink + '</span>' +
            '</div>' +
            '<div class="profile-detail-row">' +
              '<span class="detail-k">Thư mục Profile:</span>' +
              '<span class="detail-v" style="font-family: var(--font-mono); font-size: 11px;">' + escapeHtml(a.profilePath) + '</span>' +
            '</div>' +
            '<div class="profile-detail-row">' +
              '<span class="detail-k">Trạng thái đĩa:</span>' +
              '<span>' + diskStatus + '</span>' +
            '</div>' +
            '<div class="profile-detail-row" style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--border);">' +
              '<span class="detail-k">Kích hoạt (Nhận Job):</span>' +
              '<label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 11.5px; font-weight: 600;">' +
                '<input type="checkbox" ' + toggleChecked + ' onchange="toggleAccountEnabled(\\'' + a.id + '\\', this.checked)" />' +
                '<span>' + (a.enabled ? 'Đang bật' : 'Đang tắt') + '</span>' +
              '</label>' +
            '</div>' +
          '</div>' +

          '<div class="profile-actions-bar">' +
            '<button type="button" class="profile-action-btn btn-login" onclick="triggerAccountLogin(\\'' + a.id + '\\', \\'' + escapeHtml(a.label) + '\\')">' +
              '<span>🔑 Mở Chrome Đăng Nhập</span>' +
            '</button>' +
            '<button type="button" class="profile-action-btn" onclick="openEditProfileModal(\\'' + a.id + '\\')">' +
              '<span>✏️ Sửa</span>' +
            '</button>' +
            '<button type="button" class="profile-action-btn" onclick="checkAccountSession(\\'' + a.id + '\\')">' +
              '<span>🔄 Kiểm tra</span>' +
            '</button>' +
            '<button type="button" class="profile-action-btn" style="color: var(--danger);" onclick="openDeleteProfileModal(\\'' + a.id + '\\', \\'' + escapeHtml(a.label) + '\\', \\'' + escapeHtml(a.profilePath) + '\\')">' +
              '<span>🗑️ Xóa</span>' +
            '</button>' +
          '</div>' +
        '</div>';
      }

      container.innerHTML = cardsHtml;
    }

    // ─── PROFILE CRUD ACTIONS ─────────────────────────────────────
    function openCreateProfileModal() {
      // Suggest account ID
      const count = accountsDataCache.length + 1;
      let candidateId = 'account-' + count;
      while (accountsDataCache.some(a => a.id === candidateId)) {
        candidateId = 'account-' + (++count);
      }
      document.getElementById('newAccountId').value = candidateId;
      document.getElementById('newAccountLabel').value = 'Tài khoản ' + count;
      document.getElementById('newRemoteProjectId').value = '';
      document.getElementById('autoLaunchLogin').checked = true;
      openModal('createProfileModal');
    }

    document.getElementById('createProfileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('newAccountId').value.trim();
      const label = document.getElementById('newAccountLabel').value.trim();
      const remoteProjectId = document.getElementById('newRemoteProjectId').value.trim() || undefined;
      const autoLaunch = document.getElementById('autoLaunchLogin').checked;
      const btn = document.getElementById('btnCreateProfileSubmit');

      if (!id || !label) return;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang tạo...';

      try {
        const res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, label, remoteProjectId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo account');

        closeModal('createProfileModal');
        await fetchAccounts();

        if (autoLaunch) {
          triggerAccountLogin(id, label);
        }
      } catch (err) {
        alert('Lỗi tạo profile: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Tạo Profile';
      }
    });

    function openEditProfileModal(id) {
      const acc = accountsDataCache.find(a => a.id === id);
      if (!acc) return;

      document.getElementById('editAccountId').value = acc.id;
      document.getElementById('editAccountIdDisplay').value = acc.id;
      document.getElementById('editAccountLabel').value = acc.label;
      document.getElementById('editRemoteProjectId').value = acc.remoteProjectId || '';
      document.getElementById('editAccountEnabled').checked = Boolean(acc.enabled);

      openModal('editProfileModal');
    }

    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editAccountId').value;
      const label = document.getElementById('editAccountLabel').value.trim();
      const remoteProjectId = document.getElementById('editRemoteProjectId').value.trim() || '';
      const enabled = document.getElementById('editAccountEnabled').checked;

      try {
        const res = await fetch('/api/accounts/' + encodeURIComponent(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label, remoteProjectId, enabled }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi lưu thay đổi');

        closeModal('editProfileModal');
        await fetchAccounts();
      } catch (err) {
        alert('Lỗi cập nhật: ' + err.message);
      }
    });

    function openDeleteProfileModal(id, label, profilePath) {
      document.getElementById('deleteAccountId').innerText = id;
      document.getElementById('deleteAccountName').innerText = label;
      document.getElementById('deleteDiskPath').innerText = profilePath || ('data/profiles/' + id);
      document.getElementById('deleteDiskCheckbox').checked = true;

      const confirmBtn = document.getElementById('btnConfirmDelete');
      confirmBtn.onclick = async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner"></span> Đang xóa...';
        const deleteDisk = document.getElementById('deleteDiskCheckbox').checked;

        try {
          const res = await fetch('/api/accounts/' + encodeURIComponent(id) + '?deleteDisk=' + deleteDisk, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa profile');

          closeModal('deleteProfileModal');
          await fetchAccounts();
        } catch (err) {
          alert('Lỗi xóa profile: ' + err.message);
        } finally {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = 'Xác Nhận Xóa';
        }
      };

      openModal('deleteProfileModal');
    }

    async function toggleAccountEnabled(id, enabled) {
      try {
        const action = enabled ? 'enable' : 'disable';
        await fetch('/api/accounts/' + encodeURIComponent(id) + '/' + action, { method: 'POST' });
        await fetchAccounts();
      } catch (err) {
        alert('Lỗi cập nhật trạng thái: ' + err.message);
      }
    }

    async function checkAccountSession(id) {
      const card = document.getElementById('card-' + id);
      if (card) {
        const btn = card.querySelector('.btn-login');
        if (btn) btn.innerHTML = '<span class="spinner"></span> Đang kiểm tra...';
      }

      try {
        const res = await fetch('/api/accounts/' + encodeURIComponent(id) + '/check', { method: 'POST' });
        const data = await res.json();
        await fetchAccounts();
        alert('Trạng thái phiên tài khoản ' + id + ': ' + (data.sessionStatus || 'Unknown'));
      } catch (err) {
        alert('Lỗi kiểm tra phiên: ' + err.message);
      }
    }

    // Interactive Chrome Login Tracker
    async function triggerAccountLogin(id, label) {
      document.getElementById('loginModalTitle').innerText = '🔑 Đăng nhập: ' + (label || id);
      document.getElementById('loginModalStatus').innerText = 'Đang khởi chạy trình duyệt Google Chrome...';
      document.getElementById('loginModalHint').innerText = 'Cửa sổ Chrome thật vừa được mở trên màn hình. Hãy đăng nhập Google và mở 1 Project trên Google Flow để hoàn tất.';
      document.getElementById('loginModalSpinner').innerHTML = '<span class="spinner" style="width: 32px; height: 32px;"></span>';
      openModal('loginTrackerModal');

      try {
        const res = await fetch('/api/accounts/' + encodeURIComponent(id) + '/login', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Không thể mở Chrome');

        // Poll login status
        if (activeLoginPollingInterval) clearInterval(activeLoginPollingInterval);
        activeLoginPollingInterval = setInterval(async () => {
          try {
            const statusRes = await fetch('/api/accounts/' + encodeURIComponent(id) + '/login-status');
            const statusData = await statusRes.json();
            const session = statusData.session;

            if (session) {
              if (session.message) {
                document.getElementById('loginModalStatus').innerText = session.message;
              }

              if (session.status === 'succeeded') {
                clearInterval(activeLoginPollingInterval);
                activeLoginPollingInterval = null;
                document.getElementById('loginModalSpinner').innerText = '🎉';
                document.getElementById('loginModalStatus').innerText = 'Đăng nhập Google Flow thành công!';
                document.getElementById('loginModalHint').innerText = 'Tài khoản đã sẵn sàng tạo ảnh trong hệ thống Flow Studio.';
                await fetchAccounts();
                setTimeout(() => closeModal('loginTrackerModal'), 3000);
              } else if (session.status === 'failed' || session.status === 'error') {
                clearInterval(activeLoginPollingInterval);
                activeLoginPollingInterval = null;
                document.getElementById('loginModalSpinner').innerText = '⚠️';
                document.getElementById('loginModalStatus').innerText = 'Phiên đăng nhập dừng lại';
                document.getElementById('loginModalHint').innerText = session.message || session.error || 'Cửa sổ trình duyệt đã bị đóng.';
                await fetchAccounts();
              }
            }
          } catch (e) {
            console.error('Login status poll error:', e);
          }
        }, 2000);
      } catch (err) {
        alert('Lỗi kích hoạt Chrome login: ' + err.message);
        closeModal('loginTrackerModal');
      }
    }

    // ─── STUDIO T2I / I2I GENERATION HANDLER ──────────────────────
    const promptInputEl = document.getElementById('prompt');
    const promptCharCount = document.getElementById('promptCharCount');

    function updateCharCount() {
      const len = promptInputEl.value.length;
      promptCharCount.innerText = len > 0 ? (len + ' ký tự') : '';
    }
    promptInputEl.addEventListener('input', updateCharCount);

    function applyPrompt(text) {
      promptInputEl.value = text;
      updateCharCount();
      promptInputEl.focus();
    }

    // Dropzone logic
    const dropzoneBox = document.getElementById('dropzoneBox');
    const fileInputEl = document.getElementById('refImage');
    const preview = document.getElementById('dropzonePreview');
    const thumb = document.getElementById('refImageThumb');
    const dropText = document.getElementById('dropzoneText');
    const modeBadge = document.getElementById('studioModeBadge');

    dropzoneBox.addEventListener('click', () => fileInputEl.click());
    dropzoneBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneBox.style.borderColor = 'var(--primary)';
    });
    dropzoneBox.addEventListener('dragleave', () => {
      dropzoneBox.style.borderColor = 'var(--border-strong)';
    });
    dropzoneBox.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneBox.style.borderColor = 'var(--border-strong)';
      if (e.dataTransfer.files.length > 0) {
        fileInputEl.files = e.dataTransfer.files;
        handleFileChosen(fileInputEl.files[0]);
      }
    });

    fileInputEl.addEventListener('change', () => {
      if (fileInputEl.files.length > 0) {
        handleFileChosen(fileInputEl.files[0]);
      }
    });

    function handleFileChosen(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        thumb.src = e.target.result;
        preview.classList.add('active');
        dropText.style.display = 'none';
        if (modeBadge) {
          modeBadge.className = 'badge badge-info';
          modeBadge.innerText = 'Chế độ I2I (Reference)';
        }
      };
      reader.readAsDataURL(file);
    }

    function clearRefImage() {
      fileInputEl.value = '';
      thumb.src = '';
      preview.classList.remove('active');
      dropText.style.display = 'block';
      if (modeBadge) {
        modeBadge.className = 'badge badge-neutral';
        modeBadge.innerText = 'Chế độ T2I';
      }
    }

    document.getElementById('clearRefBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      clearRefImage();
    });

    // Modal Lightbox
    function openLightbox(imgUrl, prompt) {
      document.getElementById('modalImg').src = imgUrl;
      const promptEl = document.getElementById('modalPrompt');
      promptEl.innerText = prompt || '';
      promptEl.title = prompt || '';
      document.getElementById('modalDownloadBtn').href = imgUrl;
      openModal('imageModal');
    }

    document.getElementById('modalCloseBtn').addEventListener('click', () => closeModal('imageModal'));
    document.getElementById('modalReuseBtn').addEventListener('click', () => {
      const p = document.getElementById('modalPrompt').innerText;
      if (p) {
        applyPrompt(p);
        closeModal('imageModal');
        switchMainTab('studio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    document.getElementById('closeTrackerBtn').addEventListener('click', () => {
      document.getElementById('liveTracker').classList.remove('active');
      const showcaseBox = document.getElementById('studioShowcaseBox');
      if (showcaseBox) showcaseBox.style.display = 'flex';
    });

    // Delegation
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.prompt-chip');
      if (chip && chip.dataset.prompt) {
        applyPrompt(chip.dataset.prompt);
        return;
      }
      const reusePromptBtn = e.target.closest('.btn-reuse-prompt');
      if (reusePromptBtn && reusePromptBtn.dataset.prompt) {
        applyPrompt(reusePromptBtn.dataset.prompt);
        switchMainTab('studio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const thumbImg = e.target.closest('.preview-clickable');
      if (thumbImg && thumbImg.dataset.url) {
        openLightbox(thumbImg.dataset.url, thumbImg.dataset.prompt || '');
        return;
      }
    });

    // Filter & Search Handlers for Jobs
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilterStatus = btn.dataset.filter || 'all';
        renderFilteredJobs();
      });
    });

    const searchInputEl = document.getElementById('jobSearchInput');
    searchInputEl.addEventListener('input', () => {
      searchQuery = searchInputEl.value.trim().toLowerCase();
      renderFilteredJobs();
    });

    function renderFilteredJobs() {
      const jobsTbody = document.getElementById('jobsTbody');
      let filtered = allFetchedJobs;

      if (currentFilterStatus !== 'all') {
        filtered = filtered.filter(j => j.status === currentFilterStatus);
      }

      if (searchQuery) {
        filtered = filtered.filter(j => 
          (j.prompt && j.prompt.toLowerCase().includes(searchQuery)) ||
          (j.id && j.id.toLowerCase().includes(searchQuery))
        );
      }

      let html = '';
      for (const job of filtered) {
        const isSuccess = job.status === 'succeeded';
        const isRunning = job.status === 'running' || job.status === 'queued';
        const statusBadge = isSuccess ? 'badge-success' : (isRunning ? 'badge-info' : 'badge-danger');
        const statusIcon = isSuccess ? '✓' : (isRunning ? '<span class="spinner"></span>' : '✕');

        let thumbsHtml = '';
        if (job.outputs && job.outputs.length > 0) {
          thumbsHtml = '<div class="job-thumb-strip">';
          for (let i = 0; i < job.outputs.length; i++) {
            const out = job.outputs[i];
            const cleanPrompt = escapeHtml(job.prompt || '');
            thumbsHtml += '<div class="job-thumb-cell">' +
              '<img src="' + out.imageUrl + '" class="preview-clickable" data-url="' + out.imageUrl + '" data-prompt="' + cleanPrompt + '" alt="Output ' + (i + 1) + '" />' +
            '</div>';
          }
          thumbsHtml += '</div>';
        } else {
          thumbsHtml = '<span style="color: var(--text-subtle); font-size: 11.5px;">Chưa có ảnh</span>';
        }

        const dateStr = new Date(job.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        html += '<tr>' +
          '<td style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 600;">' + escapeHtml(job.id) + '</td>' +
          '<td>' +
            '<div class="prompt-preview" title="' + escapeHtml(job.prompt) + '">' + escapeHtml(job.prompt) + '</div>' +
            '<button type="button" class="btn-quiet btn-reuse-prompt" data-prompt="' + escapeHtml(job.prompt) + '" style="padding: 2px 6px; font-size: 10px; margin-top: 4px;">⚡ Dùng lại</button>' +
          '</td>' +
          '<td><span class="badge ' + statusBadge + '">' + statusIcon + ' ' + escapeHtml(job.status) + '</span></td>' +
          '<td>' + thumbsHtml + '</td>' +
          '<td style="font-size: 11.5px; color: var(--text-muted);">' + dateStr + '</td>' +
        '</tr>';
      }

      jobsTbody.innerHTML = html || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Không tìm thấy yêu cầu nào.</td></tr>';
    }

    // Fetch Jobs & Gallery
    async function fetchJobsAndGallery() {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        const jobs = data.jobs || [];
        allFetchedJobs = jobs;

        const metricQueue = document.getElementById('metricQueueCount');
        if (metricQueue) {
          const queued = jobs.filter(j => j.status === 'queued' || j.status === 'running').length;
          metricQueue.innerText = queued;
        }

        renderFilteredJobs();

        // Render Gallery
        const gallery = document.getElementById('gallery');
        const galleryCountEl = document.getElementById('galleryCount');
        const metricGalleryCount = document.getElementById('metricGalleryCount');

        let totalOutputs = 0;
        for (const job of jobs) {
          if (job.status === 'succeeded' && job.outputs) {
            for (const out of job.outputs) {
              totalOutputs++;
              const key = out.imageUrl;
              if (!renderedAssetKeys.has(key)) {
                renderedAssetKeys.add(key);
                const card = document.createElement('div');
                card.className = 'gallery-card';
                const cleanPrompt = escapeHtml(job.prompt || '');
                card.innerHTML = 
                  '<img src="' + out.imageUrl + '" class="preview-clickable" data-url="' + out.imageUrl + '" data-prompt="' + cleanPrompt + '" alt="Generated Image" />' +
                  '<div class="gallery-card-overlay">' +
                    '<span class="badge badge-success" style="font-size: 10px;">Imagen 3</span>' +
                    '<div style="margin-top: auto;">' +
                      '<p class="prompt-preview" style="color: #fff; font-size: 11.5px; margin-bottom: 6px;">' + cleanPrompt + '</p>' +
                      '<div style="display: flex; gap: 6px;">' +
                        '<button type="button" class="btn-quiet btn-reuse-prompt" data-prompt="' + cleanPrompt + '" style="padding: 2px 6px; font-size: 10px; color: #fff; border-color: rgba(255,255,255,0.4);">⚡ Dùng prompt</button>' +
                        '<a href="' + out.imageUrl + '" download="flow-image.png" class="btn-quiet" style="padding: 2px 6px; font-size: 10px; color: #fff; border-color: rgba(255,255,255,0.4); text-decoration: none;">⬇ Tải về</a>' +
                      '</div>' +
                    '</div>' +
                  '</div>';
                gallery.prepend(card);
              }
            }
          }
        }

        if (galleryCountEl) galleryCountEl.innerText = totalOutputs + ' ảnh';
        if (metricGalleryCount) metricGalleryCount.innerText = totalOutputs;

        // Update Showcase Box with latest output
        const showcaseContent = document.getElementById('showcaseContent');
        const showcaseEmpty = document.getElementById('showcaseEmpty');
        const showcaseImg = document.getElementById('showcaseImg');
        const showcasePrompt = document.getElementById('showcasePrompt');
        const showcaseUsePromptBtn = document.getElementById('showcaseUsePromptBtn');

        let latestOutput = null;
        let latestJobPrompt = '';
        for (const job of jobs) {
          if (job.status === 'succeeded' && job.outputs && job.outputs.length > 0) {
            latestOutput = job.outputs[0];
            latestJobPrompt = job.prompt || '';
            break;
          }
        }

        if (latestOutput && showcaseContent && showcaseEmpty && showcaseImg && showcasePrompt) {
          showcaseEmpty.style.display = 'none';
          showcaseContent.style.display = 'flex';
          showcaseImg.src = latestOutput.imageUrl;
          showcaseImg.setAttribute('data-url', latestOutput.imageUrl);
          showcaseImg.setAttribute('data-prompt', latestJobPrompt);
          showcasePrompt.innerText = latestJobPrompt;
          if (showcaseUsePromptBtn) {
            showcaseUsePromptBtn.onclick = () => {
              applyPrompt(latestJobPrompt);
            };
          }
        }
      } catch (e) {
        console.error('Error fetching jobs:', e);
      }
    }

    // Job Form Submission
    document.getElementById('jobForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = promptInputEl.value.trim();
      const fileInput = document.getElementById('refImage');
      const submitBtn = document.getElementById('submitBtn');

      if (!prompt) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> <span>Đang đưa vào hàng đợi...</span>';

      try {
        const inputAssetIds = [];
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const uploadRes = await fetch('/api/assets/upload', {
            method: 'POST',
            body: file,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.assetId) {
            inputAssetIds.push(uploadData.assetId);
          }
        }

        const jobRes = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: 'proj-default',
            prompt,
            inputAssetIds,
          }),
        });

        const jobData = await jobRes.json();
        if (jobData.jobId) {
          promptInputEl.value = '';
          updateCharCount();
          clearRefImage();
          startJobTracking(jobData.jobId, prompt);
          fetchAccounts();
          fetchJobsAndGallery();
        } else {
          alert('Không thể tạo job: ' + (jobData.error || 'Lỗi'));
        }
      } catch (err) {
        alert('Lỗi khi gửi yêu cầu: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>✨ Gửi yêu cầu tạo ảnh vào Hàng đợi</span>';
      }
    });

    // Tracking
    function startJobTracking(jobId, prompt) {
      currentPollingJobId = jobId;
      const tracker = document.getElementById('liveTracker');
      const trackerDesc = document.getElementById('trackerDesc');
      const trackerOutputs = document.getElementById('trackerOutputs');
      const trackerBadge = document.getElementById('trackerBadge');
      const showcaseBox = document.getElementById('studioShowcaseBox');

      if (showcaseBox) showcaseBox.style.display = 'none';
      tracker.classList.add('active');
      trackerDesc.innerText = 'Job ' + jobId + ' đã vào hàng đợi, chờ Account điều phối...';
      trackerOutputs.innerHTML = '';
      trackerBadge.className = 'badge badge-info';
      trackerBadge.innerHTML = '<span class="spinner"></span> Đang xử lý';

      const startTime = Date.now();
      const pollInterval = setInterval(async () => {
        if (currentPollingJobId !== jobId) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const res = await fetch('/api/jobs/' + jobId);
          const data = await res.json();
          const job = data.job;

          if (!job) return;

          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          trackerDesc.innerText = 'Trạng thái: ' + job.status + ' (' + elapsed + 's)';

          if (job.status === 'succeeded') {
            clearInterval(pollInterval);
            trackerBadge.className = 'badge badge-success';
            trackerBadge.innerHTML = '✅ Hoàn tất (' + elapsed + 's)';
            
            let outsHtml = '<div style="margin-top: 12px; border-top: 1px solid var(--border); padding-top: 12px;">' +
              '<strong style="font-size: 13px; color: var(--text); display: block; margin-bottom: 8px;">🎉 Ảnh vừa tạo thành công:</strong>' +
              '<div style="display: flex; gap: 12px; flex-wrap: wrap;">';
            if (data.outputs && data.outputs.length > 0) {
              for (let i = 0; i < data.outputs.length; i++) {
                const out = data.outputs[i];
                if (out.imageUrl) {
                  const cleanPrompt = escapeHtml(job.prompt || '');
                  outsHtml += '<div style="background: var(--surface); padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 8px;">' +
                    '<img src="' + out.imageUrl + '" style="max-height: 150px; max-width: 220px; border-radius: var(--radius-sm); cursor: pointer; object-fit: cover;" class="preview-clickable" data-url="' + out.imageUrl + '" data-prompt="' + cleanPrompt + '" alt="Result" />' +
                    '<a href="' + out.imageUrl + '" download="flow-image.png" class="btn-quiet" style="font-weight: 600; width: 100%; justify-content: center;">⬇ Tải file PNG</a>' +
                  '</div>';
                }
              }
            }
            outsHtml += '</div></div>';
            trackerOutputs.innerHTML = outsHtml;
            
            await fetchJobsAndGallery();
            await fetchAccounts();
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            trackerBadge.className = 'badge badge-danger';
            trackerBadge.innerHTML = '❌ Thất bại';
            const errMsg = data.attempts && data.attempts[0] ? data.attempts[0].error_message : 'Lỗi không xác định';
            trackerDesc.innerText = 'Chi tiết lỗi: ' + errMsg;
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }

    // Initial Load & Polling
    fetchAccounts();
    fetchJobsAndGallery();
    setInterval(fetchAccounts, 4000);
    setInterval(fetchJobsAndGallery, 5000);
  </script>
</body>
</html>`;
}
