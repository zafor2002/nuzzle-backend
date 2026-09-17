import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>🐾 Nuzzle REST API Documentation (OpenAPI 3.0)</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://fav.farm/🐾" />
  <style>
    body { margin: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui { color: #f8fafc; }
    .swagger-ui .info .title { color: #818cf8; font-family: 'Times New Roman', serif; }
    .custom-header {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      padding: 24px 32px;
      border-bottom: 1px solid #334155;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .custom-header h1 { margin: 0; font-size: 22px; color: #ffffff; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .badge { background: #4f46e5; color: #fff; font-size: 11px; padding: 4px 10px; border-radius: 9999px; font-weight: 600; text-transform: uppercase; }
    .sub-bar { color: #94a3b8; font-size: 13px; margin-top: 6px; }
    .nav-links { display: flex; gap: 12px; }
    .nav-btn {
      background: #1e293b; color: #cbd5e1; text-decoration: none; padding: 8px 14px;
      border-radius: 8px; font-size: 13px; font-weight: 500; border: 1px solid #334155;
      transition: all 0.2s;
    }
    .nav-btn:hover { background: #334155; color: #fff; }
  </style>
</head>
<body>
  <div class="custom-header">
    <div>
      <h1>🐾 Nuzzle REST API Documentation <span class="badge">OpenAPI 3.0</span></h1>
      <div class="sub-bar">Decoupled 6-Layer Architecture • Next.js 16 REST Gateway • Supabase PostgreSQL • Prisma 7</div>
    </div>
    <div class="nav-links">
      <a href="/api/health" class="nav-btn" target="_blank">🩺 System Health</a>
      <a href="/api/docs/spec" class="nav-btn" target="_blank">📄 Raw OpenAPI JSON</a>
      <a href="http://localhost:5173" class="nav-btn" target="_blank">🚀 Open Vue Frontend</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/spec',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

  return new NextResponse(swaggerHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
