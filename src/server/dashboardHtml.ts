// =======================================================================
// Flow Studio - Dashboard UI Renderer (Bento & Editorial Serif)
// Strictly follows DESIGN.md Design System
// =======================================================================

export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flow Studio Core API - Studio & Hàng đợi</title>
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

    /* Selection Treatment from DESIGN.md */
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
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--text);
      padding: var(--space-xl) var(--space-md);
      min-height: 100vh;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      transition: background-color var(--motion-normal) ease, color var(--motion-normal) ease;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
    }

    /* ─── Header ─────────────────────────────────────────────── */
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--space-lg);
      margin-bottom: var(--space-xl);
      border-bottom: 1px solid var(--border);
    }
    .brand-wrap {
      display: flex;
      align-items: baseline;
      gap: var(--space-md);
      flex-wrap: wrap;
    }
    .brand-title {
      font-family: var(--font-serif);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .btn-quiet {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      background: var(--surface-muted);
      border: 1px solid var(--border);
      text-decoration: none;
      cursor: pointer;
      transition: all var(--motion-fast) ease;
    }
    .btn-quiet:hover {
      color: var(--text);
      border-color: var(--border-strong);
      background: var(--surface-hover);
    }

    /* ─── Badges ─────────────────────────────────────────────── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .badge-success { background: rgba(22, 163, 74, 0.12); color: var(--success); border: 1px solid rgba(22, 163, 74, 0.25); }
    .badge-warning { background: rgba(217, 119, 6, 0.12); color: var(--warning); border: 1px solid rgba(217, 119, 6, 0.25); }
    .badge-danger  { background: rgba(220, 38, 38, 0.12); color: var(--danger);  border: 1px solid rgba(220, 38, 38, 0.25); }
    .badge-info    { background: rgba(37, 99, 235, 0.12); color: var(--info);    border: 1px solid rgba(37, 99, 235, 0.25); }
    .badge-neutral { background: var(--surface-muted); color: var(--text-muted); border: 1px solid var(--border); }

    /* ─── Bento Grid Architecture ────────────────────────────── */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-xl);
    }
    .bento-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      box-shadow: var(--card-shadow);
      transition: border-color var(--motion-normal) ease, box-shadow var(--motion-normal) ease;
      position: relative;
    }
    .bento-card:hover {
      box-shadow: var(--card-shadow-hover);
    }
    .bento-hero {
      grid-column: span 8;
    }
    .bento-side {
      grid-column: span 4;
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }
    .bento-full {
      grid-column: span 12;
    }

    @media (max-width: 980px) {
      .bento-hero { grid-column: span 12; }
      .bento-side { grid-column: span 12; }
    }

    /* Card Header anatomy */
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
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .card-title {
      font-family: var(--font-serif);
      font-size: 19px;
      font-weight: 700;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-desc {
      font-size: 12.5px;
      color: var(--text-muted);
    }

    /* ─── Form Controls & Prompt Studio ───────────────────────── */
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
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .textarea-wrap {
      position: relative;
    }
    textarea.studio-input {
      width: 100%;
      min-height: 84px;
      padding: var(--space-md);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.5;
      resize: vertical;
      transition: border-color var(--motion-fast) ease, box-shadow var(--motion-fast) ease;
    }
    textarea.studio-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 1px var(--primary);
    }

    /* Inspiration Chips */
    .chips-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .chips-label {
      font-size: 11px;
      color: var(--text-subtle);
      margin-right: 2px;
    }
    .prompt-chip {
      background: var(--tag-bg);
      border: 1px solid var(--tag-border);
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--motion-fast) ease;
    }
    .prompt-chip:hover {
      background: var(--surface-hover);
      color: var(--text);
      border-color: var(--border-strong);
      transform: translateY(-1px);
    }

    /* Reference Image Dropzone */
    .dropzone-container {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--surface-muted);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-md);
      transition: all var(--motion-fast) ease;
      cursor: pointer;
      position: relative;
    }
    .dropzone-container:hover {
      background: var(--surface-hover);
      border-color: var(--accent);
    }
    .dropzone-icon {
      font-size: 20px;
      color: var(--text-muted);
    }
    .dropzone-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dropzone-title {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text);
    }
    .dropzone-hint {
      font-size: 11px;
      color: var(--text-muted);
    }
    .dropzone-preview {
      display: none;
      align-items: center;
      gap: var(--space-sm);
    }
    .dropzone-preview.active {
      display: flex;
    }
    .dropzone-thumb {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .file-input-hidden {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    /* Buttons */
    .btn-primary {
      width: 100%;
      padding: 12px 18px;
      border-radius: var(--radius-md);
      border: none;
      background: var(--primary);
      color: var(--primary-fg);
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      transition: all var(--motion-fast) ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .btn-primary:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    /* ─── Live Tracker Module (Hero integration) ─────────────── */
    .tracker {
      display: none;
      margin-top: var(--space-md);
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      background: var(--surface-muted);
      border: 1px solid var(--border-strong);
      animation: fadeIn var(--motion-normal) ease;
    }
    .tracker.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-sm);
    }
    .tracker-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text);
    }
    .tracker-meta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: var(--space-sm);
    }
    .tracker-desc {
      font-size: 12.5px;
      color: var(--text);
      margin-bottom: var(--space-sm);
    }
    .spinner {
      display: inline-block;
      width: 13px;
      height: 13px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ─── Bento Supporting Metrics & Accounts ────────────────── */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .metric-tile {
      background: var(--surface-muted);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .metric-val {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
      line-height: 1.1;
    }
    .metric-lbl {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
    }

    /* ─── Jobs History Bento Card ─────────────────────────────── */
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
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .search-input {
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      font-size: 12px;
      width: 220px;
      transition: border-color var(--motion-fast) ease;
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
    table.data-table tr:last-child td {
      border-bottom: none;
    }
    table.data-table tr:hover td {
      background: var(--surface-hover);
    }

    #accountsTable th, #accountsTable td {
      padding: 8px 6px;
      font-size: 11.5px;
    }
    #accountsTable th {
      font-size: 11px;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* Fixed Clean Horizontal Strip for Output Images in Table */
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
      transition: transform var(--motion-fast) ease;
    }
    .job-thumb-cell:hover img {
      transform: scale(1.08);
    }
    .job-thumb-dl {
      position: absolute;
      bottom: 2px;
      right: 2px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 9px;
      text-decoration: none;
      opacity: 0;
      transition: opacity var(--motion-fast) ease;
    }
    .job-thumb-cell:hover .job-thumb-dl {
      opacity: 1;
    }

    .prompt-preview {
      max-width: 320px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--text);
    }
    .btn-copy-prompt {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      font-size: 10.5px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface-muted);
      color: var(--text-muted);
      cursor: pointer;
      margin-top: 4px;
    }
    .btn-copy-prompt:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }

    /* ─── Gallery Showcase ────────────────────────────────────── */
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
      transition: transform var(--motion-normal) ease;
    }
    .gallery-card:hover img {
      transform: scale(1.03);
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
    .gallery-card:hover .gallery-card-overlay {
      opacity: 1;
    }
    .gallery-top-badge {
      align-self: flex-end;
    }
    .gallery-card-caption {
      font-size: 11.5px;
      color: #fafafa;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .gallery-card-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-end;
    }
    .gallery-action-btn {
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--radius-sm);
      text-decoration: none;
      cursor: pointer;
      transition: background var(--motion-fast) ease;
    }
    .gallery-action-btn:hover {
      background: rgba(255, 255, 255, 0.4);
    }

    /* ─── Lightbox Modal ──────────────────────────────────────── */
    .modal {
      display: none;
      position: fixed;
      z-index: 9999;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
    }
    .modal.active { display: flex; }
    .modal-box {
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      max-width: 960px;
      width: 100%;
      max-height: 92vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      animation: modalPop var(--motion-normal) ease;
    }
    @keyframes modalPop {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .modal-header {
      padding: var(--space-md) var(--space-lg);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header strong {
      font-family: var(--font-serif);
      font-size: 16px;
      color: var(--text);
    }
    .modal-close-btn {
      background: transparent;
      border: none;
      font-size: 18px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }
    .modal-close-btn:hover { color: var(--text); }
    .modal-body {
      padding: var(--space-md);
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
      overflow: auto;
      max-height: 68vh;
    }
    .modal-body img {
      max-width: 100%;
      max-height: 65vh;
      object-fit: contain;
      border-radius: var(--radius-sm);
    }
    .modal-footer {
      padding: var(--space-md) var(--space-lg);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-md);
      background: var(--surface);
      flex-wrap: wrap;
    }
    .modal-prompt-text {
      font-size: 12.5px;
      color: var(--text-muted);
      max-width: 60%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .modal-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="app-header">
      <div class="brand-wrap">
        <h1 class="brand-title">
          <span>Flow Studio Core API</span>
          <span class="badge badge-success"><span class="badge-dot"></span> Online</span>
        </h1>
        <span class="brand-subtitle">Hệ thống sinh ảnh tự động & điều phối tài khoản Google Flow</span>
      </div>
      <div class="header-actions">
        <button id="themeToggleBtn" class="btn-quiet" title="Chuyển chế độ Sáng / Tối" onclick="toggleTheme()">
          <span id="themeIcon">☀</span> <span id="themeLabel">Chế độ Sáng</span>
        </button>
        <a href="/api/health" target="_blank" class="btn-quiet" title="Kiểm tra trạng thái REST API">
          <span>/api/health</span> ↗
        </a>
      </div>
    </header>

    <!-- Top Bento Grid: Hero Studio (8 cols) + Metrics & Account Pool (4 cols) -->
    <div class="bento-grid">
      <!-- HERO: Studio Tạo Ảnh (T2I / I2I) -->
      <section class="bento-card bento-hero">
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
            <div class="textarea-wrap">
              <textarea id="prompt" class="studio-input" rows="3" required placeholder="Nhập câu lệnh tạo ảnh chi tiết (ví dụ: a stickman with many pose, detailed sketches, 8k resolution)..."></textarea>
            </div>
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
                <span class="dropzone-hint">Hỗ trợ PNG, JPG, WebP. Hệ thống tự động upload & liên kết asset cho Google Flow.</span>
              </div>
              <div class="dropzone-preview" id="dropzonePreview">
                <img id="refImageThumb" class="dropzone-thumb" src="" alt="Thumbnail" />
                <button type="button" id="clearRefBtn" class="btn-quiet" style="padding: 3px 8px; font-size: 11px;">✕ Gỡ bỏ</button>
              </div>
              <input type="file" id="refImage" class="file-input-hidden" accept="image/*" aria-label="Chọn tệp ảnh tham chiếu (Image-to-Image)" />
            </div>
          </div>

          <button type="submit" id="submitBtn" class="btn-primary">
            <span>✨ Gửi yêu cầu tạo ảnh vào Hàng đợi</span>
          </button>
        </form>

        <!-- Live Tracker -->
        <div id="liveTracker" class="tracker">
          <div class="tracker-header">
            <strong class="tracker-title" id="trackerTitle">⚙️ Tiến trình xử lý Job</strong>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="trackerBadge" class="badge badge-info"><span class="spinner"></span> Đang xử lý</span>
              <button type="button" id="closeTrackerBtn" class="btn-quiet" style="padding: 2px 7px; font-size: 11px;">✕ Đóng</button>
            </div>
          </div>
          <div class="tracker-meta" id="trackerJobId"></div>
          <div class="tracker-desc" id="trackerDesc">Đang chuẩn bị phiên làm việc...</div>
          <div id="trackerOutputs"></div>
        </div>
      </section>

      <!-- SIDEBAR: Metrics Overview & Account Pool (4 cols) -->
      <aside class="bento-side">
        <!-- Metric Overview Card -->
        <div class="bento-card" style="padding: var(--space-lg);">
          <div class="card-head" style="margin-bottom: var(--space-md);">
            <div class="card-title-group">
              <span class="card-eyebrow">Trạng thái</span>
              <h3 class="card-title" style="font-size: 16px;">Tổng quan Hệ thống</h3>
            </div>
          </div>
          <div class="metric-grid">
            <div class="metric-tile">
              <span class="metric-val" id="metricQueueCount">0</span>
              <span class="metric-lbl">Hàng đợi</span>
            </div>
            <div class="metric-tile">
              <span class="metric-val" id="metricAccountsCount">1/1</span>
              <span class="metric-lbl">Tài khoản</span>
            </div>
            <div class="metric-tile">
              <span class="metric-val" id="metricGalleryCount">0</span>
              <span class="metric-lbl">Ảnh đã tạo</span>
            </div>
          </div>
        </div>

        <!-- Account Pool Card -->
        <div class="bento-card" style="flex: 1; padding: var(--space-lg);">
          <div class="card-head" style="margin-bottom: var(--space-md);">
            <div class="card-title-group">
              <span class="card-eyebrow">Điều phối</span>
              <h3 class="card-title" style="font-size: 16px;">
                <span>Quản lý Đa tài khoản (Account Pool)</span>
              </h3>
            </div>
            <span class="badge badge-neutral" id="poolSummary">1 tài khoản</span>
          </div>

          <!-- Account list (Rendered cleanly with full semantic table preserved for compatibility) -->
          <div class="table-responsive" style="border: none;">
            <table id="accountsTable" class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên hiển thị</th>
                  <th>Phiên</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody id="accountsTbody">
                <tr><td colspan="4" style="color: var(--text-muted); text-align: center;">Đang tải dữ liệu tài khoản...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>

    <!-- FULL SECTION: Lịch sử Jobs gần đây -->
    <section class="bento-card bento-full" style="margin-bottom: var(--space-xl);">
      <div class="card-head">
        <div class="card-title-group">
          <span class="card-eyebrow">Nhật ký & Tiến trình</span>
          <h2 class="card-title">Lịch sử Jobs gần đây (Xem trước & Tải về máy)</h2>
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
          <p class="card-desc">Tập hợp toàn bộ các sản phẩm đồ họa được trích xuất trực tiếp từ Google Flow Studio</p>
        </div>
        <span class="badge badge-neutral" id="galleryCount">0 ảnh</span>
      </div>

      <div class="gallery-grid" id="gallery"></div>
    </section>
  </div>

  <!-- Lightbox Modal -->
  <div id="imageModal" class="modal">
    <div class="modal-box">
      <div class="modal-header">
        <strong id="modalTitle">Xem ảnh chi tiết</strong>
        <button type="button" class="modal-close-btn" id="modalCloseBtn">✕</button>
      </div>
      <div class="modal-body">
        <img id="modalImg" src="" alt="Preview" />
      </div>
      <div class="modal-footer">
        <div id="modalPrompt" class="modal-prompt-text"></div>
        <div class="modal-actions">
          <button type="button" class="btn-quiet" id="modalReuseBtn">⚡ Dùng prompt này</button>
          <a id="modalDownloadBtn" href="" download="flow-image.png" class="btn-quiet" style="background: var(--primary); color: var(--primary-fg); border-color: var(--primary);">⬇ Tải ảnh gốc (PNG)</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    const renderedAssetKeys = new Set();
    let currentPollingJobId = null;
    let allFetchedJobs = [];
    let currentFilterStatus = 'all';
    let searchQuery = '';

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

    // Quick Prompt Helper
    function applyPrompt(text) {
      const promptInput = document.getElementById('prompt');
      promptInput.value = text;
      promptInput.focus();
      updateCharCount();
    }

    function updateCharCount() {
      const promptInput = document.getElementById('prompt');
      const counter = document.getElementById('promptCharCount');
      if (counter) counter.innerText = promptInput.value.length > 0 ? (promptInput.value.length + ' ký tự') : '';
    }
    document.getElementById('prompt').addEventListener('input', updateCharCount);

    // File Input Helper
    const fileInputEl = document.getElementById('refImage');
    fileInputEl.addEventListener('change', () => {
      const preview = document.getElementById('dropzonePreview');
      const thumb = document.getElementById('refImageThumb');
      const dropText = document.getElementById('dropzoneText');
      const modeBadge = document.getElementById('studioModeBadge');

      if (fileInputEl.files && fileInputEl.files[0]) {
        const file = fileInputEl.files[0];
        const reader = new FileReader();
        reader.onload = function(evt) {
          thumb.src = evt.target.result;
          preview.classList.add('active');
          dropText.style.display = 'none';
          if (modeBadge) {
            modeBadge.className = 'badge badge-info';
            modeBadge.innerText = 'Chế độ I2I (Image-to-Image)';
          }
        };
        reader.readAsDataURL(file);
      } else {
        clearRefImage();
      }
    });

    function clearRefImage() {
      const preview = document.getElementById('dropzonePreview');
      const thumb = document.getElementById('refImageThumb');
      const dropText = document.getElementById('dropzoneText');
      const modeBadge = document.getElementById('studioModeBadge');

      fileInputEl.value = '';
      thumb.src = '';
      preview.classList.remove('active');
      dropText.style.display = 'flex';
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
    function openModal(imgUrl, prompt) {
      document.getElementById('modalImg').src = imgUrl;
      const promptEl = document.getElementById('modalPrompt');
      promptEl.innerText = prompt || '';
      promptEl.title = prompt || '';
      document.getElementById('modalDownloadBtn').href = imgUrl;
      document.getElementById('imageModal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('imageModal').classList.remove('active');
    }

    document.getElementById('imageModal').addEventListener('click', (e) => {
      if (e.target.id === 'imageModal') closeModal();
    });
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('modalReuseBtn').addEventListener('click', () => {
      const p = document.getElementById('modalPrompt').innerText;
      if (p) {
        applyPrompt(p);
        closeModal();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    document.getElementById('closeTrackerBtn').addEventListener('click', () => {
      document.getElementById('liveTracker').classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn && !submitBtn.disabled) {
          document.getElementById('jobForm').requestSubmit();
        }
      }
    });

    // Event delegation for chips, copy, and reuse buttons
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.prompt-chip');
      if (chip && chip.dataset.prompt) {
        applyPrompt(chip.dataset.prompt);
        return;
      }
      const copyIdBtn = e.target.closest('.btn-copy-id');
      if (copyIdBtn && copyIdBtn.dataset.id) {
        copyToClipboard(copyIdBtn.dataset.id, copyIdBtn);
        return;
      }
      const copyPromptBtn = e.target.closest('.btn-copy-prompt');
      if (copyPromptBtn && copyPromptBtn.dataset.prompt) {
        copyToClipboard(copyPromptBtn.dataset.prompt, copyPromptBtn);
        return;
      }
      const reusePromptBtn = e.target.closest('.btn-reuse-prompt');
      if (reusePromptBtn && reusePromptBtn.dataset.prompt) {
        applyPrompt(reusePromptBtn.dataset.prompt);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const thumbImg = e.target.closest('.preview-clickable');
      if (thumbImg && thumbImg.dataset.url) {
        openModal(thumbImg.dataset.url, thumbImg.dataset.prompt || '');
        return;
      }
    });

    function copyToClipboard(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerText;
        btn.innerText = '✓ Đã chép';
        setTimeout(() => { btn.innerText = orig; }, 1500);
      });
    }

    // Accounts Fetcher
    async function fetchAccounts() {
      try {
        const res = await fetch('/api/accounts');
        const data = await res.json();
        const tbody = document.getElementById('accountsTbody');
        const poolSummary = document.getElementById('poolSummary');
        const metricAccounts = document.getElementById('metricAccountsCount');

        const accounts = data.accounts || [];
        poolSummary.innerText = accounts.length + ' tài khoản';

        let availableCount = 0;
        let html = '';
        for (const a of accounts) {
          const isAuthed = a.sessionStatus === 'authenticated';
          const sessionBadge = isAuthed ? 'badge-success' : 'badge-warning';
          const isBusy = a.isBusy;
          if (!isBusy && isAuthed) availableCount++;

          const busyBadge = isBusy ? 'badge-warning' : 'badge-success';
          const busyText = isBusy ? ('Bận (' + (a.activeOperation || 'Đang tạo') + ')') : 'Sẵn sàng';

          html += '<tr>' +
            '<td style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 600;">' + a.id + '</td>' +
            '<td><span style="font-weight: 500;">' + a.label + '</span></td>' +
            '<td><span class="badge ' + sessionBadge + '"><span class="badge-dot"></span> ' + a.sessionStatus + '</span></td>' +
            '<td><span class="badge ' + busyBadge + '"><span class="badge-dot"></span> ' + busyText + '</span></td>' +
          '</tr>';
        }

        if (metricAccounts) {
          metricAccounts.innerText = availableCount + '/' + accounts.length;
        }

        if (tbody.innerHTML !== html) {
          tbody.innerHTML = html || '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Chưa có tài khoản nào được kết nối.</td></tr>';
        }
      } catch (e) {
        console.error('Error fetching accounts:', e);
      }
    }

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

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Render Jobs Table from in-memory state
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

      let jobsHtml = '';
      for (const j of filtered) {
        let badgeClass = 'badge-info';
        let statusLabel = j.status;
        if (j.status === 'succeeded') { badgeClass = 'badge-success'; statusLabel = '✅ Xong'; }
        else if (j.status === 'running') { badgeClass = 'badge-warning'; statusLabel = '⚙️ Đang chạy'; }
        else if (j.status === 'failed') { badgeClass = 'badge-danger'; statusLabel = '❌ Lỗi'; }
        else if (j.status === 'queued') { badgeClass = 'badge-info'; statusLabel = '⏳ Chờ duyệt'; }

        const timeStr = j.created_at ? new Date(j.created_at).toLocaleTimeString() : '';
        const shortId = j.id ? (j.id.length > 18 ? ('...' + j.id.slice(-8)) : j.id) : '';

        // Clean horizontal filmstrip of output thumbnails with direct preview
        let previewHtml = '<span style="color: var(--text-muted); font-size: 11.5px;">Chưa có</span>';
        if (j.outputs && j.outputs.length > 0) {
          previewHtml = '<div class="job-thumb-strip">';
          for (let idx = 0; idx < j.outputs.length; idx++) {
            const out = j.outputs[idx];
            if (out.imageUrl) {
              const cleanPrompt = escapeHtml(j.prompt || '');
              const downloadName = (j.prompt ? j.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_') : 'image') + '-' + (idx + 1) + '.png';
              previewHtml += '<div class="job-thumb-cell" title="Bấm để phóng to ảnh">' +
                '<img src="' + out.imageUrl + '" class="preview-clickable" data-url="' + out.imageUrl + '" data-prompt="' + cleanPrompt + '" alt="Thumbnail" />' +
                '<a href="' + out.imageUrl + '" download="' + downloadName + '" class="job-thumb-dl" title="Tải ảnh này">⬇</a>' +
              '</div>';
            }
          }
          previewHtml += '</div>';
        }

        const safePrompt = escapeHtml(j.prompt || '');
        jobsHtml += '<tr>' +
          '<td>' +
            '<span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--text); display: block;" title="' + escapeHtml(j.id) + '">' + shortId + '</span>' +
            '<button type="button" class="btn-copy-id btn-copy-prompt" data-id="' + escapeHtml(j.id) + '" title="Chép ID đầy đủ">📋 Chép ID</button>' +
          '</td>' +
          '<td>' +
            '<div class="prompt-preview" title="' + safePrompt + '">' + (safePrompt || 'Không có prompt') + '</div>' +
            '<div style="display: flex; gap: 6px; margin-top: 4px;">' +
              '<button type="button" class="btn-copy-prompt" data-prompt="' + safePrompt + '">📋 Chép Prompt</button>' +
              '<button type="button" class="btn-reuse-prompt btn-copy-prompt" data-prompt="' + safePrompt + '">⚡ Dùng lại</button>' +
            '</div>' +
          '</td>' +
          '<td><span class="badge ' + badgeClass + '"><span class="badge-dot"></span> ' + statusLabel + '</span></td>' +
          '<td>' + previewHtml + '</td>' +
          '<td style="color: var(--text-muted); font-size: 11.5px; white-space: nowrap;">' + timeStr + '</td>' +
        '</tr>';
      }

      jobsTbody.innerHTML = jobsHtml || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">Không tìm thấy công việc nào phù hợp.</td></tr>';
    }

    // Fetch Jobs & Gallery differential append
    async function fetchJobsAndGallery() {
      try {
        const res = await fetch('/api/jobs?limit=50');
        const data = await res.json();
        const jobs = data.jobs || [];
        allFetchedJobs = jobs;

        // Update Queue metric
        const queuedOrRunning = jobs.filter(j => j.status === 'queued' || j.status === 'running').length;
        const metricQueue = document.getElementById('metricQueueCount');
        if (metricQueue) metricQueue.innerText = queuedOrRunning;

        // Render Jobs Table
        renderFilteredJobs();

        // Differential append to Gallery
        const gallery = document.getElementById('gallery');
        for (const j of jobs) {
          if (j.outputs && j.outputs.length > 0) {
            for (const out of j.outputs) {
              if (out.imageUrl && !renderedAssetKeys.has(out.imageUrl)) {
                renderedAssetKeys.add(out.imageUrl);

                const card = document.createElement('div');
                card.className = 'gallery-card';
                
                const img = document.createElement('img');
                img.src = out.imageUrl;
                img.alt = j.prompt || 'Flow Studio Output';
                img.title = j.prompt || '';
                img.onclick = () => openModal(out.imageUrl, j.prompt);

                const overlay = document.createElement('div');
                overlay.className = 'gallery-card-overlay';

                const topBadge = document.createElement('span');
                topBadge.className = 'badge badge-neutral gallery-top-badge';
                topBadge.innerText = 'Imagen 3';

                const bottomWrap = document.createElement('div');

                const cap = document.createElement('div');
                cap.className = 'gallery-card-caption';
                cap.innerText = j.prompt || 'Ảnh mới tạo';

                const actions = document.createElement('div');
                actions.className = 'gallery-card-actions';

                const reuseBtn = document.createElement('button');
                reuseBtn.type = 'button';
                reuseBtn.className = 'gallery-action-btn';
                reuseBtn.innerText = '⚡ Dùng prompt';
                reuseBtn.onclick = (e) => {
                  e.stopPropagation();
                  applyPrompt(j.prompt || '');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                };

                const dl = document.createElement('a');
                dl.href = out.imageUrl;
                dl.download = 'flow-image-' + Date.now() + '.png';
                dl.className = 'gallery-action-btn';
                dl.innerText = '⬇ Tải về';
                dl.onclick = (e) => e.stopPropagation();

                actions.appendChild(reuseBtn);
                actions.appendChild(dl);

                bottomWrap.appendChild(cap);
                bottomWrap.appendChild(actions);

                overlay.appendChild(topBadge);
                overlay.appendChild(bottomWrap);

                card.appendChild(img);
                card.appendChild(overlay);
                gallery.insertBefore(card, gallery.firstChild);
              }
            }
          }
        }

        const countText = renderedAssetKeys.size + ' ảnh';
        document.getElementById('galleryCount').innerText = countText;
        const metricGallery = document.getElementById('metricGalleryCount');
        if (metricGallery) metricGallery.innerText = renderedAssetKeys.size;
      } catch (e) {
        console.error('Error fetching jobs:', e);
      }
    }

    // Live poller for an active job
    async function startJobTracking(jobId, promptText) {
      currentPollingJobId = jobId;
      const tracker = document.getElementById('liveTracker');
      const trackerTitle = document.getElementById('trackerTitle');
      const trackerBadge = document.getElementById('trackerBadge');
      const trackerDesc = document.getElementById('trackerDesc');
      const trackerJobId = document.getElementById('trackerJobId');
      const trackerOutputs = document.getElementById('trackerOutputs');

      tracker.classList.add('active');
      trackerTitle.innerText = '⚙️ Đang xử lý: "' + (promptText.length > 36 ? promptText.slice(0, 36) + '...' : promptText) + '"';
      trackerJobId.innerText = 'Job ID: ' + jobId;
      trackerBadge.className = 'badge badge-info';
      trackerBadge.innerHTML = '<span class="spinner"></span> Đang xếp hàng';
      trackerDesc.innerText = 'Đang chuyển giao yêu cầu cho tài khoản rảnh rỗi trong Account Pool...';
      trackerOutputs.innerHTML = '';

      let elapsed = 0;
      const pollInterval = setInterval(async () => {
        elapsed += 2;
        try {
          const res = await fetch('/api/jobs/' + jobId);
          if (!res.ok) return;
          const data = await res.json();
          const job = data.job;

          if (job.status === 'running') {
            trackerBadge.className = 'badge badge-warning';
            trackerBadge.innerHTML = '<span class="spinner"></span> Đang vẽ ảnh (' + elapsed + 's)';
            trackerDesc.innerText = 'Google Flow đang dựng ảnh trên canvas... Thường mất 20 - 45 giây.';
          } else if (job.status === 'succeeded') {
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
                  const downloadName = (job.prompt ? job.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_') : 'image') + '-' + (i + 1) + '.png';
                  outsHtml += '<div style="background: var(--surface); padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 8px;">' +
                    '<img src="' + out.imageUrl + '" style="max-height: 150px; max-width: 220px; border-radius: var(--radius-sm); cursor: pointer; object-fit: cover;" class="preview-clickable" data-url="' + out.imageUrl + '" data-prompt="' + cleanPrompt + '" alt="Result" />' +
                    '<a href="' + out.imageUrl + '" download="' + downloadName + '" class="btn-quiet" style="font-weight: 600; width: 100%; justify-content: center;">⬇ Tải file PNG</a>' +
                  '</div>';
                }
              }
            }
            outsHtml += '</div></div>';
            trackerOutputs.innerHTML = outsHtml;
            trackerDesc.innerText = 'Đã trích xuất xong ' + (data.outputs ? data.outputs.length : 0) + ' ảnh mới nét căng!';
            
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

    // Submit form handler
    document.getElementById('jobForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const promptInput = document.getElementById('prompt');
      const prompt = promptInput.value.trim();
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
          promptInput.value = '';
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

    // Initial load & Polling
    fetchAccounts();
    fetchJobsAndGallery();
    setInterval(fetchAccounts, 4000);
    setInterval(fetchJobsAndGallery, 5000);
  </script>
</body>
</html>`;
}
