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

    /* ─── Active Ref Card & Ref Assets Styles ─────────────────── */
    .active-ref-card {
      background: var(--surface-muted);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
      animation: fadeIn var(--motion-fast) ease;
    }
    .active-ref-img {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      flex-shrink: 0;
      cursor: pointer;
    }
    .active-ref-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-lg);
      margin-top: var(--space-md);
    }
    .project-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      box-shadow: var(--card-shadow);
      transition: all var(--motion-fast) ease;
    }
    .project-card:hover {
      border-color: var(--border-strong);
      transform: translateY(-2px);
    }

    .ref-assets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .ref-asset-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all var(--motion-fast) ease;
    }
    .ref-asset-card:hover {
      border-color: var(--border-strong);
      box-shadow: var(--card-shadow);
      transform: translateY(-2px);
    }
    .ref-asset-thumb-wrap {
      height: 140px;
      background: var(--surface-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .ref-asset-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
    }
    .ref-asset-body {
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    /* ─── Hierarchy Structure (Accounts > Projects > Images) ─── */
    .hierarchy-level-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      margin-bottom: var(--space-lg);
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .hierarchy-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .hierarchy-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid transparent;
      margin-bottom: 4px;
    }
    .hierarchy-tag.level-1 { background: rgba(59, 130, 246, 0.12); color: #2563eb; border-color: rgba(59, 130, 246, 0.25); }
    .hierarchy-tag.level-2 { background: rgba(16, 185, 129, 0.12); color: #059669; border-color: rgba(16, 185, 129, 0.25); }
    .hierarchy-tag.level-3 { background: rgba(245, 158, 11, 0.12); color: #d97706; border-color: rgba(245, 158, 11, 0.25); }

    .accounts-filter-pills {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .account-pill {
      background: var(--surface-muted);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 8px 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      transition: all var(--motion-fast) ease;
    }
    .account-pill:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
    }
    .account-pill.active {
      background: var(--surface);
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
      font-weight: 600;
      color: var(--primary);
    }

    .project-card.active-selected {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25), var(--card-shadow);
      background: var(--surface);
    }

    /* Images Workspace Sub-tabs */
    .images-workspace-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-md);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--border);
    }
    .project-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
      flex-wrap: wrap;
    }
    .project-breadcrumb .crumb-active {
      font-weight: 600;
      color: var(--text);
    }
    .images-type-tabs {
      display: flex;
      gap: 6px;
      background: var(--surface-muted);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .images-tab-btn {
      background: transparent;
      border: none;
      padding: 7px 14px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all var(--motion-fast) ease;
    }
    .images-tab-btn:hover {
      color: var(--text);
    }
    .images-tab-btn.active {
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .images-subview {
      display: none;
    }
    .images-subview.active {
      display: block;
    }
    .images-subview-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: var(--space-md);
      padding: 10px 14px;
      background: var(--surface-muted);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
    }

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
        <button type="button" class="nav-tab-btn" id="tabBtnProjects" onclick="switchMainTab('projects')">
          <span>📁</span>
          <span>Projects & Ref Assets</span>
          <span class="nav-tab-badge" id="navProjectsCount">0</span>
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label class="form-label" for="studioProjectSelect" style="margin-bottom: 0;">
                    <span>Dự án mục tiêu (Project)</span>
                  </label>
                  <a href="javascript:void(0)" onclick="switchMainTab('projects')" style="font-size: 11px; color: var(--text-muted); text-decoration: none;">📁 Quản lý dự án &rarr;</a>
                </div>
                <select id="studioProjectSelect" class="studio-input" style="cursor: pointer;">
                  <option value="">(Tự động điều phối theo Account pool)</option>
                </select>
              </div>

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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label class="form-label" style="margin-bottom: 0;">
                    <span>Ảnh tham chiếu (Tùy chọn - Chế độ Image-to-Image)</span>
                  </label>
                  <button type="button" class="btn-quiet" id="btnOpenRefLibrary" onclick="openSelectRefAssetModal()" style="font-size: 11px; padding: 2px 8px; color: var(--primary);">
                    📚 Chọn từ Kho Ref (<span id="refLibraryCountBadge">0</span>)
                  </button>
                </div>

                <!-- Selected Ref Asset Card (Active) -->
                <div id="activeRefCard" class="active-ref-card" style="display: none;">
                  <img id="activeRefThumb" class="active-ref-img preview-clickable" src="" alt="Active Reference" />
                  <div class="active-ref-info" style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span class="badge badge-success" style="font-size: 10px;">Ref Asset đang chọn</span>
                      <span id="activeRefDupeTag" class="badge badge-info" style="font-size: 10px; display: none;">Tái sử dụng</span>
                    </div>
                    <strong id="activeRefName" style="font-size: 12.5px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px;"></strong>
                    <span id="activeRefMeta" style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);"></span>
                  </div>
                  <button type="button" class="btn-quiet" onclick="clearSelectedRefAsset()" style="font-size: 12px; padding: 4px 8px;" title="Gỡ bỏ ảnh tham chiếu này">✕ Bỏ chọn</button>
                </div>

                <div class="dropzone-container" id="dropzoneBox">
                  <div class="dropzone-icon">📷</div>
                  <div class="dropzone-text" id="dropzoneText">
                    <span class="dropzone-title">Chọn hoặc kéo thả ảnh mẫu mới vào đây</span>
                    <span class="dropzone-hint">Tự động tính SHA-256 chống upload trùng & lưu vào Kho Ref Assets</span>
                  </div>
                  <div class="dropzone-preview" id="dropzonePreview">
                    <img id="refImageThumb" class="dropzone-thumb" src="" alt="Thumbnail" />
                    <button type="button" id="clearRefBtn" class="btn-quiet" style="padding: 3px 8px; font-size: 11px;">✕ Gỡ bỏ</button>
                  </div>
                  <input type="file" id="refImage" class="file-input-hidden" accept="image/*" />
                </div>
                <input type="hidden" id="selectedRefAssetId" value="" />
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
    <!-- TAB VIEW 2: QUẢN LÝ PROJECTS & THƯ VIỆN ẢNH (PHÂN CẤP 3 TẦNG)-->
    <!-- ============================================================ -->
    <div id="viewProjectsAssets" class="tab-view">
      <!-- Header Banner Card -->
      <div class="profiles-hero-card">
        <div>
          <span class="card-eyebrow">Quản Trị Không Gian Phân Cấp</span>
          <h2 class="card-title" style="font-size: 24px;">Phân Cấp: Accounts › Projects › Images</h2>
          <p class="card-desc">Cấu trúc 3 cấp độ rõ ràng: Chọn tài khoản Google (Account) › Quản lý dự án (Project) › Thư viện ảnh tham chiếu đã tải lên & Ảnh AI đã tạo trên Google Flow.</p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="btn-quiet" onclick="refreshProjectsAndAssets()">
            <span>🔄 Làm mới</span>
          </button>
          <button type="button" class="btn-quiet" onclick="openUploadRefAssetModal()">
            <span>📤 Tải Ref Asset Lên Kho</span>
          </button>
          <button type="button" class="btn-primary" onclick="openCreateProjectModal()">
            <span>➕ Tạo Project Mới</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Bar -->
      <div class="profiles-kpi-bar">
        <div class="metric-tile">
          <span class="metric-val" id="kpiTotalProjects">0</span>
          <span class="metric-lbl">Tổng số Projects</span>
        </div>
        <div class="metric-tile">
          <span class="metric-val" style="color: var(--primary);" id="kpiTotalRefAssets">0</span>
          <span class="metric-lbl">Ảnh Ref Đã Tải Lên</span>
        </div>
        <div class="metric-tile">
          <span class="metric-val" style="color: var(--success);" id="kpiTotalFlowOutputs">0</span>
          <span class="metric-lbl">Ảnh Tạo Trên Flow</span>
        </div>
        <div class="metric-tile">
          <span class="metric-val" style="color: var(--info);" id="kpiProjectsActive">0</span>
          <span class="metric-lbl">Accounts Đã Kết Nối</span>
        </div>
      </div>

      <!-- ─── LEVEL 1: ACCOUNTS SELECTOR ────────────────────────── -->
      <section class="hierarchy-level-card">
        <div class="hierarchy-head">
          <div>
            <span class="hierarchy-tag level-1">Cấp Độ 1 • Accounts</span>
            <h3 class="card-title" style="font-size: 16px;">Tài Khoản Google (Chrome Profiles)</h3>
            <p class="card-desc" style="font-size: 12px; margin: 0;">Chọn tài khoản để xem các Dự Án (Projects) thuộc tài khoản đó</p>
          </div>
          <button type="button" class="btn-quiet" onclick="switchMainTab('profiles')" style="font-size: 12px;">
            <span>👤 Quản lý Profiles</span>
          </button>
        </div>
        <div class="accounts-filter-pills" id="accountsFilterBar">
          <div style="color: var(--text-muted); font-size: 12px;">Đang tải danh sách tài khoản...</div>
        </div>
      </section>

      <!-- ─── LEVEL 2: PROJECTS GRID ────────────────────────────── -->
      <section class="hierarchy-level-card">
        <div class="hierarchy-head">
          <div>
            <span class="hierarchy-tag level-2">Cấp Độ 2 • Projects</span>
            <h3 class="card-title" style="font-size: 16px;" id="projectsHeaderTitle">Dự Án Thuộc Tài Khoản (Projects)</h3>
            <p class="card-desc" style="font-size: 12px; margin: 0;" id="projectsHeaderDesc">Bấm "📂 Mở Không Gian Ảnh" trên card dự án để quản lý ảnh tham chiếu và ảnh đã tạo bên dưới</p>
          </div>
          <button type="button" class="btn-primary" onclick="openCreateProjectModal()" style="font-size: 12px;">
            <span>➕ Tạo Project Mới</span>
          </button>
        </div>
        <div class="projects-grid" id="projectsCardsContainer">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
            Đang tải danh sách Projects...
          </div>
        </div>
      </section>

      <!-- ─── LEVEL 3: IMAGES WORKSPACE ─────────────────────────── -->
      <section class="hierarchy-level-card" id="projectImagesWorkspaceCard">
        <div class="images-workspace-header">
          <div>
            <span class="hierarchy-tag level-3">Cấp Độ 3 • Images</span>
            <h3 class="card-title" style="font-size: 16px;" id="imagesWorkspaceTitle">Kho Ảnh Dự Án</h3>
            <div class="project-breadcrumb">
              <span id="imageBreadcrumbAccount">👤 Tất cả tài khoản</span>
              <span style="color: var(--text-muted);">›</span>
              <span id="imageBreadcrumbProject" class="crumb-active">📁 Dự án đang chọn</span>
            </div>
          </div>
          
          <!-- Sub-tabs: Uploaded Refs vs Flow Generated Outputs -->
          <div class="images-type-tabs">
            <button type="button" class="images-tab-btn active" id="tabBtnUploadedRefs" onclick="switchImagesSubTab('uploaded')">
              <span>📤 Ảnh Tham Chiếu Đã Tải Lên</span>
              <span class="badge badge-neutral" style="font-size: 10.5px;" id="countUploadedRefs">0</span>
            </button>
            <button type="button" class="images-tab-btn" id="tabBtnGeneratedFlow" onclick="switchImagesSubTab('generated')">
              <span>🎨 Ảnh Đã Tạo Trên Google Flow</span>
              <span class="badge badge-neutral" style="font-size: 10.5px;" id="countGeneratedFlow">0</span>
            </button>
          </div>
        </div>

        <!-- Subview A: Uploaded Ref Assets -->
        <div id="subviewUploadedRefs" class="images-subview active">
          <div class="images-subview-toolbar">
            <span>Toàn bộ ảnh ref do bạn tải lên từ máy tính cho dự án này. Bấm <strong>⚡ Dùng tạo ảnh</strong> để đưa vào Studio làm ảnh mẫu I2I.</span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="text" id="searchUploadedRefInput" class="search-input" placeholder="🔍 Tìm kiếm ảnh ref..." oninput="filterCurrentUploadedRefs(this.value)" />
              <button type="button" class="btn-primary" onclick="openUploadRefAssetModal()" style="font-size: 12px;">📤 Upload Ảnh Mới</button>
            </div>
          </div>
          <div class="ref-assets-grid" id="uploadedRefsCardsContainer">
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
              Đang tải ảnh tham chiếu...
            </div>
          </div>
        </div>

        <!-- Subview B: Google Flow Generated Images -->
        <div id="subviewGeneratedFlow" class="images-subview">
          <div class="images-subview-toolbar">
            <span>Toàn bộ ảnh AI do Google Flow (Imagen 3) tạo ra từ các job của dự án này. Bấm <strong>🔄 Dùng làm ảnh Ref</strong> để lưu vào kho tham chiếu!</span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="text" id="searchGeneratedImagesInput" class="search-input" placeholder="🔍 Tìm theo prompt..." oninput="filterCurrentGeneratedImages(this.value)" />
            </div>
          </div>
          <div class="gallery-grid" id="generatedFlowCardsContainer">
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
              Đang tải ảnh đã tạo...
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ============================================================ -->
    <!-- TAB VIEW 3: QUẢN LÝ CHROME PROFILES (ACCOUNT POOL)           -->
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

  <!-- ─── Modal 6: Create Project ─────────────────────────────── -->
  <div id="createProjectModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3>➕ Tạo Project Mới</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('createProjectModal')">✕</button>
      </div>
      <form id="createProjectForm">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="newProjectName">
              <span>Tên Dự Án (Project Name)</span>
            </label>
            <input type="text" id="newProjectName" class="studio-input" required placeholder="ví dụ: Dự án Thiết Kế Nhân Vật, Chiến dịch Hè" />
          </div>

          <div class="form-group">
            <label class="form-label" for="newProjectAccountId">
              <span>Liên kết Chrome Profile</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(Tùy chọn)</span>
            </label>
            <select id="newProjectAccountId" class="studio-input">
              <option value="">-- Để trống (Tự động dùng Account khả dụng) --</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="newProjectRemoteId">
              <span>Google Flow Remote Project ID / Link</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(Tùy chọn)</span>
            </label>
            <input type="text" id="newProjectRemoteId" class="studio-input" placeholder="ví dụ: 79272edb-389a-4aa8-b735-7c47017a2cd3 hoặc link URL" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-quiet" onclick="closeModal('createProjectModal')">Hủy</button>
          <button type="submit" id="btnCreateProjectSubmit" class="btn-primary">Tạo Project</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ─── Modal 7: Edit Project ───────────────────────────────── -->
  <div id="editProjectModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3>✏️ Chỉnh Sửa Project</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('editProjectModal')">✕</button>
      </div>
      <form id="editProjectForm">
        <input type="hidden" id="editProjectId" />
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Mã Project ID</label>
            <input type="text" id="editProjectIdDisplay" class="studio-input" disabled style="opacity: 0.7; font-family: var(--font-mono);" />
          </div>

          <div class="form-group">
            <label class="form-label" for="editProjectName">Tên Dự Án (Project Name)</label>
            <input type="text" id="editProjectName" class="studio-input" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="editProjectAccountId">Liên kết Chrome Profile</label>
            <select id="editProjectAccountId" class="studio-input">
              <option value="">-- Không chỉ định (Dùng Account tự do) --</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="editProjectRemoteId">Google Flow Remote Project ID / Link</label>
            <input type="text" id="editProjectRemoteId" class="studio-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-quiet" onclick="closeModal('editProjectModal')">Hủy</button>
          <button type="submit" class="btn-primary">Lưu Thay Đổi</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ─── Modal 8: Delete Project Confirmation ────────────────── -->
  <div id="deleteProjectModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3 style="color: var(--danger);">🗑️ Xác Nhận Xóa Project</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('deleteProjectModal')">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 13.5px; color: var(--text);">
          Bạn có chắc chắn muốn xóa project <strong id="deleteProjectName" style="color: var(--danger);"></strong> (ID: <span id="deleteProjectIdSpan" style="font-family: var(--font-mono);"></span>) không?
        </p>
        <p style="font-size: 12px; color: var(--text-muted);">
          Các bản ghi jobs và ảnh đã tạo trong project này sẽ không bị xóa khỏi cơ sở dữ liệu.
        </p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-quiet" onclick="closeModal('deleteProjectModal')">Hủy</button>
        <button type="button" id="btnConfirmDeleteProject" class="btn-danger-quiet" style="background: var(--danger); color: #fff; border: none; font-weight: 600;">Xác Nhận Xóa</button>
      </div>
    </div>
  </div>

  <!-- ─── Modal 9: Select Ref Asset from Library (In Studio) ──── -->
  <div id="selectRefAssetModal" class="modal">
    <div class="modal-box modal-box-lg">
      <div class="modal-header">
        <div>
          <h3>📚 Chọn Ảnh Tham Chiếu Từ Thư Viện</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Tái sử dụng ảnh mẫu đã upload trước đó mà không cần tải lại file</span>
        </div>
        <button type="button" class="modal-close-btn" onclick="closeModal('selectRefAssetModal')">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between;">
          <input type="text" id="modalRefAssetSearchInput" class="search-input" style="flex: 1; width: auto;" placeholder="🔍 Tìm kiếm ảnh ref theo tên..." oninput="filterModalRefAssets(this.value)" />
          <button type="button" class="btn-quiet" onclick="openUploadRefAssetModal(); closeModal('selectRefAssetModal');" style="font-size: 12px;">+ Tải ảnh mới lên</button>
        </div>
        <div class="ref-assets-grid" id="modalRefAssetsGrid" style="margin-top: 10px; max-height: 52vh; overflow-y: auto;">
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">
            Đang tải kho ảnh ref...
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-quiet" onclick="closeModal('selectRefAssetModal')">Đóng</button>
      </div>
    </div>
  </div>

  <!-- ─── Modal 10: Upload Ref Asset Directly to Library ─────── -->
  <div id="uploadRefAssetModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3>📤 Tải Ảnh Tham Chiếu Vào Kho (Library)</h3>
        <button type="button" class="modal-close-btn" onclick="closeModal('uploadRefAssetModal')">✕</button>
      </div>
      <form id="uploadRefAssetForm">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="uploadRefAssetFile">Chọn file ảnh (PNG, JPG, WebP)</label>
            <input type="file" id="uploadRefAssetFile" class="studio-input" accept="image/*" required style="padding: 6px;" />
          </div>

          <div class="form-group">
            <label class="form-label" for="uploadRefAssetDisplayName">
              <span>Tên hiển thị gợi nhớ</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(Tùy chọn)</span>
            </label>
            <input type="text" id="uploadRefAssetDisplayName" class="studio-input" placeholder="ví dụ: Anime Character Pose 01" />
          </div>

          <div class="form-group">
            <label class="form-label" for="uploadRefAssetProjectId">
              <span>Gán vào Project</span>
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">(Tùy chọn)</span>
            </label>
            <select id="uploadRefAssetProjectId" class="studio-input">
              <option value="">-- Không chỉ định (Toàn cục) --</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-quiet" onclick="closeModal('uploadRefAssetModal')">Hủy</button>
          <button type="submit" id="btnUploadRefAssetSubmit" class="btn-primary">Tải Lên Kho</button>
        </div>
      </form>
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
    let projectsDataCache = [];
    let refAssetsDataCache = [];
    let selectedRefAsset = null;
    let activeLoginPollingInterval = null;
    let selectedHierarchyAccountId = '';
    let selectedHierarchyProjectId = '';
    let currentImagesSubTab = 'uploaded';
    let currentProjectImagesCache = { uploadedAssets: [], generatedImages: [] };

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
      const btnProjects = document.getElementById('tabBtnProjects');
      const btnProfiles = document.getElementById('tabBtnProfiles');
      const viewStudio = document.getElementById('viewStudio');
      const viewProjects = document.getElementById('viewProjectsAssets');
      const viewProfiles = document.getElementById('viewProfiles');

      btnStudio.classList.toggle('active', tabId === 'studio');
      if (btnProjects) btnProjects.classList.toggle('active', tabId === 'projects');
      btnProfiles.classList.toggle('active', tabId === 'profiles');

      viewStudio.classList.toggle('active', tabId === 'studio');
      if (viewProjects) viewProjects.classList.toggle('active', tabId === 'projects');
      viewProfiles.classList.toggle('active', tabId === 'profiles');

      localStorage.setItem('flow_studio_tab', tabId);
      if (tabId === 'profiles') {
        renderProfilesManager();
      } else if (tabId === 'projects') {
        refreshProjectsAndAssets();
      }
    }

    const savedTab = localStorage.getItem('flow_studio_tab');
    if (savedTab === 'profiles' || savedTab === 'projects') {
      switchMainTab(savedTab);
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
        renderAccountsFilterBar();
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
                '<input type="checkbox" ' + toggleChecked + ' data-account-id="' + a.id + '" onchange="toggleAccountEnabled(this.dataset.accountId, this.checked)" />' +
                '<span>' + (a.enabled ? 'Đang bật' : 'Đang tắt') + '</span>' +
              '</label>' +
            '</div>' +
          '</div>' +

          '<div class="profile-actions-bar">' +
            '<button type="button" class="profile-action-btn btn-login" data-id="' + a.id + '" data-label="' + escapeHtml(a.label) + '" onclick="triggerAccountLogin(this.dataset.id, this.dataset.label)">' +
              '<span>🔑 Mở Chrome Đăng Nhập</span>' +
            '</button>' +
            '<button type="button" class="profile-action-btn" data-id="' + a.id + '" onclick="openEditProfileModal(this.dataset.id)">' +
              '<span>✏️ Sửa</span>' +
            '</button>' +
            '<button type="button" class="profile-action-btn" data-id="' + a.id + '" onclick="checkAccountSession(this.dataset.id)">' +
              '<span>🔄 Kiểm tra</span>' +
            '</button>' +
            '<button type="button" class="profile-action-btn" style="color: var(--danger);" data-id="' + a.id + '" data-label="' + escapeHtml(a.label) + '" data-path="' + escapeHtml(a.profilePath) + '" onclick="openDeleteProfileModal(this.dataset.id, this.dataset.label, this.dataset.path)">' +
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

    // ─── PROJECTS & REF ASSETS MANAGEMENT ───────────────────────
    async function refreshProjectsAndAssets() {
      await Promise.all([fetchProjects(), fetchAssets()]);
    }

    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // ─── Hierarchy Structure: Accounts > Projects > Images ────────
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        projectsDataCache = data.projects || [];

        // Auto select first project if none currently selected
        if (!selectedHierarchyProjectId || !projectsDataCache.some(p => p.id === selectedHierarchyProjectId)) {
          selectedHierarchyProjectId = projectsDataCache[0]?.id || '';
        }

        renderAccountsFilterBar();
        renderProjectsList();
        updateStudioProjectSelect();
        updateProjectKPI();

        if (selectedHierarchyProjectId) {
          await loadProjectImages(selectedHierarchyProjectId);
        }
      } catch (e) {
        console.error('Error fetching projects:', e);
      }
    }

    function updateProjectKPI() {
      const kpiTotal = document.getElementById('kpiTotalProjects');
      const kpiActive = document.getElementById('kpiProjectsActive');
      const kpiFlowOutputs = document.getElementById('kpiTotalFlowOutputs');
      const navBadge = document.getElementById('navProjectsCount');
      if (kpiTotal) kpiTotal.innerText = projectsDataCache.length;
      if (navBadge) navBadge.innerText = projectsDataCache.length;
      if (kpiActive) {
        const activeCount = new Set(projectsDataCache.map(p => p.account_id).filter(Boolean)).size;
        kpiActive.innerText = activeCount;
      }
      if (kpiFlowOutputs) {
        const totalGen = projectsDataCache.reduce((sum, p) => sum + (p.generated_images_count || 0), 0);
        kpiFlowOutputs.innerText = totalGen;
      }
    }

    // ─── Level 1: Accounts Filter Chips ──────────────────────────
    function renderAccountsFilterBar() {
      const container = document.getElementById('accountsFilterBar');
      if (!container) return;

      const totalAccs = accountsDataCache.length;
      let html = '';

      const isAllActive = !selectedHierarchyAccountId;
      html += '<button type="button" class="account-pill ' + (isAllActive ? 'active' : '') + '" data-account-id="" onclick="filterProjectsByAccount(this.dataset.accountId)">' +
        '<span>🌐</span>' +
        '<span>Tất Cả Accounts</span>' +
        '<span class="badge badge-neutral" style="font-size: 10px;">' + totalAccs + '</span>' +
      '</button>';

      for (const acc of accountsDataCache) {
        const isActive = selectedHierarchyAccountId === acc.id;
        const isAuthed = acc.sessionStatus === 'authenticated';
        const dotColor = isAuthed ? 'var(--success)' : 'var(--warning)';
        const projCount = projectsDataCache.filter(p => p.account_id === acc.id).length;

        html += '<button type="button" class="account-pill ' + (isActive ? 'active' : '') + '" data-account-id="' + escapeHtml(acc.id) + '" onclick="filterProjectsByAccount(this.dataset.accountId)">' +
          '<span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ' + dotColor + ';"></span>' +
          '<span>👤 ' + escapeHtml(acc.label) + ' <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">(' + escapeHtml(acc.id) + ')</span></span>' +
          '<span class="badge badge-neutral" style="font-size: 10px;">' + projCount + ' proj</span>' +
        '</button>';
      }

      container.innerHTML = html;
    }

    function filterProjectsByAccount(accId) {
      selectedHierarchyAccountId = accId;
      renderAccountsFilterBar();
      renderProjectsList();

      const titleEl = document.getElementById('projectsHeaderTitle');
      const descEl = document.getElementById('projectsHeaderDesc');
      if (accId) {
        const acc = accountsDataCache.find(a => a.id === accId);
        const accLabel = acc ? acc.label : accId;
        if (titleEl) titleEl.innerText = 'Dự Án Thuộc Account: ' + accLabel;
        if (descEl) descEl.innerText = 'Hiển thị các dự án được liên kết với Chrome Profile "' + accLabel + '"';

        const matching = projectsDataCache.filter(p => p.account_id === accId);
        if (matching.length > 0 && (!selectedHierarchyProjectId || !matching.some(p => p.id === selectedHierarchyProjectId))) {
          selectedHierarchyProjectId = matching[0].id;
        }
      } else {
        if (titleEl) titleEl.innerText = 'Tất Cả Dự Án (Projects)';
        if (descEl) descEl.innerText = 'Bấm "📂 Mở Không Gian Ảnh" trên card dự án để quản lý ảnh tham chiếu và ảnh đã tạo bên dưới';
      }

      if (selectedHierarchyProjectId) {
        loadProjectImages(selectedHierarchyProjectId);
      }
    }

    function updateStudioProjectSelect() {
      const select = document.getElementById('studioProjectSelect');
      if (!select) return;
      const currentVal = select.value;
      let opts = '<option value="">(Tự động điều phối theo Account pool)</option>';
      for (const p of projectsDataCache) {
        const boundInfo = p.account_label ? (' [' + p.account_label + ']') : '';
        opts += '<option value="' + escapeHtml(p.id) + '">' + escapeHtml(p.name) + boundInfo + '</option>';
      }
      select.innerHTML = opts;
      if (currentVal && projectsDataCache.some(p => p.id === currentVal)) {
        select.value = currentVal;
      }
    }

    // ─── Level 2: Projects Cards ─────────────────────────────────
    function renderProjectsList() {
      const container = document.getElementById('projectsCardsContainer');
      if (!container) return;

      const filtered = selectedHierarchyAccountId
        ? projectsDataCache.filter(p => p.account_id === selectedHierarchyAccountId)
        : projectsDataCache;

      if (filtered.length === 0) {
        const msg = selectedHierarchyAccountId 
          ? 'Tài khoản này chưa có project nào được liên kết.'
          : 'Chưa có project nào trong hệ thống.';
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">' +
          '<div style="font-size: 28px; margin-bottom: 8px;">📁</div>' +
          '<h4 style="font-size: 15px; margin-bottom: 4px;">' + msg + '</h4>' +
          '<p style="font-size: 12px; margin-bottom: 12px;">Hãy tạo project mới để liên kết với tài khoản này.</p>' +
          '<button type="button" class="btn-primary" onclick="openCreateProjectModal()">➕ Tạo Project Mới</button>' +
        '</div>';
        return;
      }

      let html = '';
      for (const p of filtered) {
        const isSelected = p.id === selectedHierarchyProjectId;
        const boundAccount = p.account_label 
          ? '<span class="badge badge-success"><span class="badge-dot"></span> ' + escapeHtml(p.account_label) + ' (' + escapeHtml(p.account_id || '') + ')</span>'
          : '<span class="badge badge-neutral" style="font-size: 11px;">Tự do (Bất kỳ account nào)</span>';
        
        const remoteLink = p.remote_project_id
          ? '<a href="https://flow.google.com/project/' + escapeHtml(p.remote_project_id) + '" target="_blank" style="color: var(--primary); text-decoration: none; font-family: var(--font-mono); font-size: 11px;">' + escapeHtml(p.remote_project_id.slice(0, 18)) + '... ↗</a>'
          : '<span style="color: var(--text-subtle); font-style: italic;">Chưa cấu hình</span>';

        const cardSelectedClass = isSelected ? ' active-selected' : '';

        html += '<div class="project-card' + cardSelectedClass + '" id="project-' + escapeHtml(p.id) + '">' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">' +
            '<div>' +
              '<div style="display: flex; align-items: center; gap: 6px;">' +
                '<h4 style="font-size: 15px; font-weight: 600; color: var(--text);">' + escapeHtml(p.name) + '</h4>' +
                (isSelected ? '<span class="badge badge-primary" style="font-size: 10px;">Đang chọn</span>' : '') +
              '</div>' +
              '<div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-top: 2px;">ID: ' + escapeHtml(p.id) + '</div>' +
            '</div>' +
            '<span class="badge badge-info" style="font-size: 11px;">' + (p.job_count || 0) + ' jobs</span>' +
          '</div>' +

          '<div style="display: flex; flex-direction: column; gap: 6px; background: var(--surface-muted); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 12px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
              '<span style="color: var(--text-muted); font-size: 11.5px;">Account liên kết:</span>' +
              '<div>' + boundAccount + '</div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
              '<span style="color: var(--text-muted); font-size: 11.5px;">Flow Remote:</span>' +
              '<div>' + remoteLink + '</div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px; padding-top: 4px; border-top: 1px dashed var(--border); font-size: 11px;">' +
              '<span>📤 <strong>' + (p.uploaded_assets_count || 0) + '</strong> ảnh ref</span>' +
              '<span>🎨 <strong>' + (p.generated_images_count || 0) + '</strong> ảnh tạo Flow</span>' +
            '</div>' +
          '</div>' +

          '<div style="display: flex; gap: 6px; align-items: center; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--border); flex-wrap: wrap;">' +
            '<button type="button" class="btn-primary" style="flex: 1; font-size: 11.5px; padding: 6px 8px; font-weight: 600;" data-id="' + escapeHtml(p.id) + '" onclick="selectProjectForImages(this.dataset.id)">' +
              '📂 Mở Kho Ảnh' +
            '</button>' +
            '<button type="button" class="btn-quiet" style="font-size: 11.5px; padding: 6px 8px;" data-id="' + escapeHtml(p.id) + '" onclick="useProjectInStudio(this.dataset.id)" title="Dùng tạo ảnh trong Studio">' +
              '🎨 Studio' +
            '</button>' +
            '<button type="button" class="btn-quiet" style="font-size: 11.5px; padding: 6px 8px;" data-id="' + escapeHtml(p.id) + '" onclick="openEditProjectModal(this.dataset.id)" title="Sửa project">' +
              '✏️' +
            '</button>' +
            '<button type="button" class="btn-danger-quiet" style="font-size: 11.5px; padding: 6px 8px;" data-id="' + escapeHtml(p.id) + '" data-name="' + escapeHtml(p.name) + '" onclick="openDeleteProjectModal(this.dataset.id, this.dataset.name)" title="Xóa project">' +
              '🗑️' +
            '</button>' +
          '</div>' +
        '</div>';
      }
      container.innerHTML = html;
    }

    function selectProjectForImages(projectId) {
      selectedHierarchyProjectId = projectId;
      renderProjectsList();
      loadProjectImages(projectId);
      const card = document.getElementById('projectImagesWorkspaceCard');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // ─── Level 3: Images Workspace ───────────────────────────────
    function switchImagesSubTab(tab) {
      currentImagesSubTab = tab;
      const btnUploaded = document.getElementById('tabBtnUploadedRefs');
      const btnGenerated = document.getElementById('tabBtnGeneratedFlow');
      const subviewUploaded = document.getElementById('subviewUploadedRefs');
      const subviewGenerated = document.getElementById('subviewGeneratedFlow');

      if (tab === 'uploaded') {
        if (btnUploaded) btnUploaded.classList.add('active');
        if (btnGenerated) btnGenerated.classList.remove('active');
        if (subviewUploaded) subviewUploaded.classList.add('active');
        if (subviewGenerated) subviewGenerated.classList.remove('active');
      } else {
        if (btnUploaded) btnUploaded.classList.remove('active');
        if (btnGenerated) btnGenerated.classList.add('active');
        if (subviewUploaded) subviewUploaded.classList.remove('active');
        if (subviewGenerated) subviewGenerated.classList.add('active');
      }
    }

    async function loadProjectImages(projectId) {
      if (!projectId) {
        renderProjectImagesUI();
        return;
      }

      const p = projectsDataCache.find(x => x.id === projectId) || projectsDataCache[0];
      if (p) {
        const titleEl = document.getElementById('imagesWorkspaceTitle');
        const projCrumb = document.getElementById('imageBreadcrumbProject');
        const accCrumb = document.getElementById('imageBreadcrumbAccount');

        if (titleEl) titleEl.innerText = 'Kho Ảnh Dự Án: ' + p.name;
        if (projCrumb) projCrumb.innerText = '📁 ' + p.name + ' (' + p.id + ')';
        if (accCrumb) {
          const acc = accountsDataCache.find(a => a.id === p.account_id);
          accCrumb.innerText = acc ? ('👤 ' + acc.label + ' (' + acc.id + ')') : '👤 Chưa chỉ định account';
        }
      }

      try {
        const res = await fetch('/api/projects/' + encodeURIComponent(projectId) + '/images');
        const data = await res.json();
        currentProjectImagesCache = {
          uploadedAssets: data.uploadedAssets || [],
          generatedImages: data.generatedImages || [],
        };
        renderProjectImagesUI();
      } catch (err) {
        console.error('Error loading project images:', err);
      }
    }

    function renderProjectImagesUI() {
      const uploaded = currentProjectImagesCache.uploadedAssets || [];
      const generated = currentProjectImagesCache.generatedImages || [];

      const countUpEl = document.getElementById('countUploadedRefs');
      const countGenEl = document.getElementById('countGeneratedFlow');
      if (countUpEl) countUpEl.innerText = uploaded.length;
      if (countGenEl) countGenEl.innerText = generated.length;

      renderUploadedRefsCards(uploaded);
      renderGeneratedFlowCards(generated);
    }

    function renderUploadedRefsCards(assets) {
      const container = document.getElementById('uploadedRefsCardsContainer');
      if (!container) return;

      if (assets.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">' +
          '<div style="font-size: 28px; margin-bottom: 8px;">📷</div>' +
          '<h4 style="font-size: 15px; margin-bottom: 4px;">Chưa có ảnh tham chiếu nào được tải lên cho dự án này</h4>' +
          '<p style="font-size: 12px; margin-bottom: 12px;">Tải ảnh ref từ máy tính lên để dùng làm ảnh mẫu cho chế độ I2I.</p>' +
          '<button type="button" class="btn-primary" onclick="openUploadRefAssetModal()">📤 Upload Ảnh Tham Chiếu</button>' +
        '</div>';
        return;
      }

      let html = '';
      for (const a of assets) {
        const name = a.displayName || a.display_name || a.id;
        const sizeStr = formatBytes(a.size_bytes || a.sizeBytes);
        const shaPrefix = a.content_hash ? a.content_hash.slice(0, 10) : '';
        const usedCount = a.usedInJobsCount || a.used_in_jobs_count || 0;

        html += '<div class="ref-asset-card" id="asset-card-' + escapeHtml(a.id) + '">' +
          '<div class="ref-asset-thumb-wrap">' +
            '<img src="' + escapeHtml(a.blobUrl) + '" class="ref-asset-thumb preview-clickable" data-url="' + escapeHtml(a.blobUrl) + '" data-prompt="Reference: ' + escapeHtml(name) + '" alt="Ref" />' +
            '<span class="badge badge-neutral" style="position: absolute; bottom: 6px; right: 6px; font-size: 10px; background: rgba(0,0,0,0.6); color: #fff; border: none;">' + sizeStr + '</span>' +
          '</div>' +
          '<div class="ref-asset-body">' +
            '<strong style="font-size: 12.5px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</strong>' +
            '<div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">' +
              '<span style="font-family: var(--font-mono);">#' + escapeHtml(shaPrefix) + '</span>' +
              '<span class="badge ' + (usedCount > 0 ? 'badge-success' : 'badge-neutral') + '" style="font-size: 10px;">' + usedCount + ' jobs</span>' +
            '</div>' +
            '<div style="display: flex; gap: 6px; margin-top: auto; padding-top: 6px; border-top: 1px solid var(--border);">' +
              '<button type="button" class="btn-primary" style="flex: 1; font-size: 11.5px; padding: 5px 8px;" data-id="' + escapeHtml(a.id) + '" onclick="selectAssetForStudio(this.dataset.id)">' +
                '⚡ Dùng tạo ảnh' +
              '</button>' +
              '<button type="button" class="btn-danger-quiet" style="font-size: 11.5px; padding: 5px 8px;" data-id="' + escapeHtml(a.id) + '" onclick="deleteRefAsset(this.dataset.id)">' +
                '🗑️' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
      container.innerHTML = html;
    }

    function renderGeneratedFlowCards(generated) {
      const container = document.getElementById('generatedFlowCardsContainer');
      if (!container) return;

      if (generated.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">' +
          '<div style="font-size: 28px; margin-bottom: 8px;">🎨</div>' +
          '<h4 style="font-size: 15px; margin-bottom: 4px;">Chưa có ảnh nào được tạo trên Google Flow trong dự án này</h4>' +
          '<p style="font-size: 12px; margin-bottom: 12px;">Chuyển sang Studio Sáng Tạo để gửi yêu cầu tạo ảnh T2I hoặc I2I.</p>' +
          '<button type="button" class="btn-primary" data-id="' + escapeHtml(selectedHierarchyProjectId) + '" onclick="useProjectInStudio(this.dataset.id)">🎨 Mở Studio Tạo Ảnh</button>' +
        '</div>';
        return;
      }

      let html = '';
      for (const g of generated) {
        const cleanPrompt = escapeHtml(g.prompt || '');
        const dateStr = g.created_at ? new Date(g.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        const assetId = g.asset_id || '';

        html += '<div class="gallery-card" style="aspect-ratio: 16/11;">' +
          '<img src="' + escapeHtml(g.imageUrl) + '" class="preview-clickable" data-url="' + escapeHtml(g.imageUrl) + '" data-prompt="' + cleanPrompt + '" alt="Output" />' +
          '<div class="gallery-card-overlay">' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
              '<span class="badge badge-success" style="font-size: 10px;">Imagen 3</span>' +
              '<span style="font-size: 10px; color: rgba(255,255,255,0.8);">' + dateStr + '</span>' +
            '</div>' +
            '<div style="margin-top: auto;">' +
              '<p class="prompt-preview" style="color: #fff; font-size: 11px; margin-bottom: 6px;">' + cleanPrompt + '</p>' +
              '<div style="display: flex; gap: 4px; flex-wrap: wrap;">' +
                '<button type="button" class="btn-quiet btn-reuse-prompt" data-prompt="' + cleanPrompt + '" style="padding: 3px 6px; font-size: 10px; color: #fff; border-color: rgba(255,255,255,0.4);">⚡ Prompt</button>' +
                '<a href="' + escapeHtml(g.imageUrl) + '" download="flow-image.png" class="btn-quiet" style="padding: 3px 6px; font-size: 10px; color: #fff; border-color: rgba(255,255,255,0.4); text-decoration: none;">⬇ PNG</a>' +
                '<button type="button" class="btn-primary" style="padding: 3px 8px; font-size: 10px;" data-project="' + escapeHtml(selectedHierarchyProjectId) + '" data-asset="' + escapeHtml(assetId) + '" onclick="importGeneratedAsRef(this.dataset.project, this.dataset.asset)">🔄 Dùng làm ảnh Ref</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
      container.innerHTML = html;
    }

    function filterCurrentUploadedRefs(q) {
      const query = (q || '').toLowerCase().trim();
      const allRefs = currentProjectImagesCache.uploadedAssets || [];
      const filtered = allRefs.filter(a => {
        const name = (a.displayName || a.display_name || a.id || '').toLowerCase();
        const hash = (a.content_hash || a.sha256 || '').toLowerCase();
        return name.includes(query) || hash.includes(query);
      });
      renderUploadedRefsCards(filtered);
    }

    function filterCurrentGeneratedImages(q) {
      const query = (q || '').toLowerCase().trim();
      const allGen = currentProjectImagesCache.generatedImages || [];
      const filtered = allGen.filter(g => {
        const prompt = (g.prompt || '').toLowerCase();
        const jobId = (g.job_id || '').toLowerCase();
        return prompt.includes(query) || jobId.includes(query);
      });
      renderGeneratedFlowCards(filtered);
    }

    async function importGeneratedAsRef(projectId, assetId) {
      if (!projectId || !assetId) return;
      try {
        const item = (currentProjectImagesCache.generatedImages || []).find(g => g.asset_id === assetId);
        const prompt = item ? item.prompt : '';
        const displayName = prompt ? ('Ref: ' + prompt.slice(0, 30)) : ('Ref từ ảnh ' + assetId.slice(-6));
        const res = await fetch('/api/projects/' + encodeURIComponent(projectId) + '/import-output', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId, displayName }),
        });
        const data = await res.json();
        if (data.success) {
          alert('✅ Đã lưu ảnh vào Thư viện Ảnh Tham Chiếu (Reference) của dự án! Bạn có thể chọn ảnh này làm input I2I ngay.');
          await loadProjectImages(projectId);
          await fetchAssets();
          await fetchProjects();
        } else {
          alert('Không thể lưu ảnh ref: ' + (data.error || 'Lỗi'));
        }
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }

    function useProjectInStudio(projectId) {
      const select = document.getElementById('studioProjectSelect');
      if (select) select.value = projectId;
      switchMainTab('studio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openCreateProjectModal() {
      const select = document.getElementById('newProjectAccountId');
      if (select) {
        let opts = '<option value="">-- Để trống (Tự động dùng Account khả dụng) --</option>';
        for (const a of accountsDataCache) {
          opts += '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.label) + ' (' + escapeHtml(a.id) + ')</option>';
        }
        select.innerHTML = opts;
      }
      document.getElementById('newProjectName').value = '';
      document.getElementById('newProjectRemoteId').value = '';
      openModal('createProjectModal');
    }

    document.getElementById('createProjectForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newProjectName').value.trim();
      const accountId = document.getElementById('newProjectAccountId').value || undefined;
      const remoteProjectId = document.getElementById('newProjectRemoteId').value.trim() || undefined;

      const btn = document.getElementById('btnCreateProjectSubmit');
      btn.disabled = true;
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, accountId, remoteProjectId }),
        });
        const data = await res.json();
        if (data.project) {
          closeModal('createProjectModal');
          await fetchProjects();
        } else {
          alert('Không thể tạo project: ' + (data.error || 'Lỗi'));
        }
      } catch (err) {
        alert('Lỗi tạo project: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });

    function openEditProjectModal(projectId) {
      const p = projectsDataCache.find(x => x.id === projectId);
      if (!p) return;

      document.getElementById('editProjectId').value = p.id;
      document.getElementById('editProjectIdDisplay').value = p.id;
      document.getElementById('editProjectName').value = p.name;
      document.getElementById('editProjectRemoteId').value = p.remote_project_id || '';

      const select = document.getElementById('editProjectAccountId');
      if (select) {
        let opts = '<option value="">-- Không chỉ định (Dùng Account tự do) --</option>';
        for (const a of accountsDataCache) {
          opts += '<option value="' + escapeHtml(a.id) + '">' + escapeHtml(a.label) + ' (' + escapeHtml(a.id) + ')</option>';
        }
        select.innerHTML = opts;
        select.value = p.account_id || '';
      }

      openModal('editProjectModal');
    }

    document.getElementById('editProjectForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editProjectId').value;
      const name = document.getElementById('editProjectName').value.trim();
      const accountId = document.getElementById('editProjectAccountId').value || null;
      const remoteProjectId = document.getElementById('editProjectRemoteId').value.trim() || null;

      try {
        const res = await fetch('/api/projects/' + encodeURIComponent(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, accountId, remoteProjectId }),
        });
        const data = await res.json();
        if (data.project) {
          closeModal('editProjectModal');
          await fetchProjects();
        } else {
          alert('Lỗi cập nhật project: ' + (data.error || 'Lỗi'));
        }
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    });

    let pendingDeleteProjectId = null;
    function openDeleteProjectModal(projectId, projectName) {
      pendingDeleteProjectId = projectId;
      document.getElementById('deleteProjectIdSpan').innerText = projectId;
      document.getElementById('deleteProjectName').innerText = projectName;
      openModal('deleteProjectModal');
    }

    document.getElementById('btnConfirmDeleteProject').addEventListener('click', async () => {
      if (!pendingDeleteProjectId) return;
      try {
        const res = await fetch('/api/projects/' + encodeURIComponent(pendingDeleteProjectId), {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.deleted) {
          closeModal('deleteProjectModal');
          pendingDeleteProjectId = null;
          await fetchProjects();
        } else {
          alert('Lỗi xóa project: ' + (data.error || 'Lỗi'));
        }
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    });

    // Ref Assets API & Library
    async function fetchAssets() {
      try {
        const res = await fetch('/api/assets?type=uploaded');
        const data = await res.json();
        refAssetsDataCache = data.assets || [];
        updateRefAssetsKPI();
        renderModalRefAssets(refAssetsDataCache);
      } catch (e) {
        console.error('Error fetching assets:', e);
      }
    }

    function updateRefAssetsKPI() {
      const kpiTotal = document.getElementById('kpiTotalRefAssets');
      const badge = document.getElementById('refLibraryCountBadge');
      if (kpiTotal) kpiTotal.innerText = refAssetsDataCache.length;
      if (badge) badge.innerText = refAssetsDataCache.length;
    }

    function renderModalRefAssets(assets) {
      const container = document.getElementById('modalRefAssetsGrid');
      if (!container) return;
      if (assets.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">Chưa có ảnh ref nào trong kho.</div>';
        return;
      }

      let html = '';
      for (const a of assets) {
        const name = a.displayName || a.id;
        const sizeStr = formatBytes(a.sizeBytes);
        html += '<div class="ref-asset-card" style="cursor: pointer;" data-id="' + escapeHtml(a.id) + '" onclick="selectAssetForStudio(this.dataset.id); closeModal(&apos;selectRefAssetModal&apos;);">' +
          '<div class="ref-asset-thumb-wrap" style="height: 110px;">' +
            '<img src="' + escapeHtml(a.blobUrl) + '" class="ref-asset-thumb" alt="Ref" />' +
          '</div>' +
          '<div class="ref-asset-body" style="padding: 8px 10px;">' +
            '<strong style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</strong>' +
            '<span style="font-size: 10.5px; color: var(--text-muted);">' + sizeStr + '</span>' +
            '<button type="button" class="btn-primary" style="margin-top: 4px; font-size: 11px; padding: 4px; width: 100%;">' +
              '✓ Chọn ảnh này' +
            '</button>' +
          '</div>' +
        '</div>';
      }
      container.innerHTML = html;
    }

    function filterModalRefAssets(q) {
      const query = (q || '').toLowerCase().trim();
      const filtered = refAssetsDataCache.filter(a => 
        (a.displayName && a.displayName.toLowerCase().includes(query)) ||
        (a.id && a.id.toLowerCase().includes(query))
      );
      renderModalRefAssets(filtered);
    }

    function selectAssetForStudio(assetId) {
      const asset = refAssetsDataCache.find(a => a.id === assetId);
      if (!asset) return;

      selectedRefAsset = asset;
      const selectedIdInput = document.getElementById('selectedRefAssetId');
      if (selectedIdInput) selectedIdInput.value = asset.id;

      // Clear any pending file in dropzone
      const fileInput = document.getElementById('refImage');
      if (fileInput) fileInput.value = '';
      const preview = document.getElementById('dropzonePreview');
      if (preview) preview.classList.remove('active');
      const dropText = document.getElementById('dropzoneText');
      if (dropText) dropText.style.display = 'none';

      // Show active ref card
      const activeCard = document.getElementById('activeRefCard');
      const activeThumb = document.getElementById('activeRefThumb');
      const activeName = document.getElementById('activeRefName');
      const activeMeta = document.getElementById('activeRefMeta');

      if (activeCard && activeThumb && activeName && activeMeta) {
        activeCard.style.display = 'flex';
        activeThumb.src = asset.blobUrl;
        activeThumb.setAttribute('data-url', asset.blobUrl);
        activeName.innerText = asset.displayName || asset.id;
        activeMeta.innerText = formatBytes(asset.sizeBytes) + ' • SHA: ' + (asset.sha256 ? asset.sha256.slice(0, 10) : '') + '...';
      }

      const modeBadge = document.getElementById('studioModeBadge');
      if (modeBadge) {
        modeBadge.className = 'badge badge-info';
        modeBadge.innerText = 'Chế độ I2I (Ref Tái Sử Dụng)';
      }

      switchMainTab('studio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function clearSelectedRefAsset() {
      selectedRefAsset = null;
      const selectedIdInput = document.getElementById('selectedRefAssetId');
      if (selectedIdInput) selectedIdInput.value = '';

      const activeCard = document.getElementById('activeRefCard');
      if (activeCard) activeCard.style.display = 'none';

      const fileInput = document.getElementById('refImage');
      const dropText = document.getElementById('dropzoneText');

      if (fileInput && fileInput.files.length === 0) {
        if (dropText) dropText.style.display = 'block';
        const modeBadge = document.getElementById('studioModeBadge');
        if (modeBadge) {
          modeBadge.className = 'badge badge-neutral';
          modeBadge.innerText = 'Chế độ T2I';
        }
      }
    }

    function openSelectRefAssetModal() {
      renderModalRefAssets(refAssetsDataCache);
      openModal('selectRefAssetModal');
    }

    function openUploadRefAssetModal() {
      const projSelect = document.getElementById('uploadRefAssetProjectId');
      if (projSelect) {
        let opts = '<option value="">-- Không chỉ định (Toàn cục) --</option>';
        for (const p of projectsDataCache) {
          opts += '<option value="' + escapeHtml(p.id) + '">' + escapeHtml(p.name) + '</option>';
        }
        projSelect.innerHTML = opts;
        if (selectedHierarchyProjectId && projectsDataCache.some(p => p.id === selectedHierarchyProjectId)) {
          projSelect.value = selectedHierarchyProjectId;
        }
      }
      document.getElementById('uploadRefAssetFile').value = '';
      document.getElementById('uploadRefAssetDisplayName').value = '';
      openModal('uploadRefAssetModal');
    }

    document.getElementById('uploadRefAssetForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('uploadRefAssetFile');
      if (!fileInput.files || fileInput.files.length === 0) return;

      const file = fileInput.files[0];
      const displayName = document.getElementById('uploadRefAssetDisplayName').value.trim() || file.name;
      const projectId = document.getElementById('uploadRefAssetProjectId').value || undefined;

      const btn = document.getElementById('btnUploadRefAssetSubmit');
      btn.disabled = true;
      btn.innerText = 'Đang tải lên...';

      try {
        const headers = { 'x-display-name': encodeURIComponent(displayName) };
        if (projectId) headers['x-project-id'] = projectId;

        const uploadUrl = projectId
          ? '/api/assets/upload?projectId=' + encodeURIComponent(projectId) + '&displayName=' + encodeURIComponent(displayName)
          : '/api/assets/upload?displayName=' + encodeURIComponent(displayName);

        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: file,
        });
        const data = await res.json();
        if (data.assetId) {
          closeModal('uploadRefAssetModal');
          if (data.isDuplicate) {
            alert('ℹ️ Ảnh này đã tồn tại trong kho (SHA-256 trùng khớp)! Hệ thống đã tự động liên kết và cập nhật tên hiển thị để tránh trùng lặp.');
          }
          await fetchAssets();
          await fetchProjects();
          if (selectedHierarchyProjectId) {
            await loadProjectImages(selectedHierarchyProjectId);
          }
        } else {
          alert('Không thể upload ảnh: ' + (data.error || 'Lỗi'));
        }
      } catch (err) {
        alert('Lỗi: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Tải Lên Kho';
      }
    });

    async function deleteRefAsset(assetId) {
      if (!confirm('Bạn có chắc muốn xóa ảnh tham chiếu này khỏi kho không?')) return;
      try {
        const res = await fetch('/api/assets/' + encodeURIComponent(assetId), { method: 'DELETE' });
        const data = await res.json();
        if (data.deleted) {
          if (selectedRefAsset && selectedRefAsset.id === assetId) {
            clearSelectedRefAsset();
          }
          await fetchAssets();
          await fetchProjects();
          if (selectedHierarchyProjectId) {
            await loadProjectImages(selectedHierarchyProjectId);
          }
        } else {
          alert('Không thể xóa asset: ' + (data.error || 'Lỗi'));
        }
      } catch (e) {
        alert('Lỗi: ' + e.message);
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
      const selectedRefId = document.getElementById('selectedRefAssetId') ? document.getElementById('selectedRefAssetId').value : '';
      const selectedProjectId = document.getElementById('studioProjectSelect') ? (document.getElementById('studioProjectSelect').value || 'proj-default') : 'proj-default';

      if (!prompt) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> <span>Đang đưa vào hàng đợi...</span>';

      try {
        const inputAssetIds = [];
        if (selectedRefId) {
          // Reusing existing reference asset directly without uploading again!
          inputAssetIds.push(selectedRefId);
        } else if (fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const uploadRes = await fetch('/api/assets/upload', {
            method: 'POST',
            headers: {
              'x-display-name': encodeURIComponent(file.name),
              'x-project-id': selectedProjectId,
            },
            body: file,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.assetId) {
            inputAssetIds.push(uploadData.assetId);
            fetchAssets(); // Refresh reference library in background
          }
        }

        const jobRes = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: selectedProjectId,
            prompt,
            inputAssetIds,
          }),
        });

        const jobData = await jobRes.json();
        if (jobData.jobId) {
          promptInputEl.value = '';
          updateCharCount();
          clearRefImage();
          clearSelectedRefAsset();
          startJobTracking(jobData.jobId, prompt);
          fetchAccounts();
          fetchJobsAndGallery();
          fetchProjects();
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
            await fetchProjects();
            await fetchAssets();
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
    fetchProjects();
    fetchAssets();
    setInterval(fetchAccounts, 4000);
    setInterval(fetchJobsAndGallery, 5000);
  </script>
</body>
</html>`;
}
