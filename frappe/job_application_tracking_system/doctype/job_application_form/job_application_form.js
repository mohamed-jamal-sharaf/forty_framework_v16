// Client Script for Doctype: Job Application Form
// Injects banner at top and footer at bottom without HTML fields
// Full width, no border-radius, no shadow

frappe.ui.form.on('Job Application Form', {
    refresh(frm) {
        inject_global_styles();

        // Banner HTML
        const banner_html = `
      <div id="cp-app-banner" class="company-banner">
        <div class="company-banner-content">
          <div class="company-logo">
            <img src="/assets/frappe/images/final saud logo.png" alt="Company Logo">
          </div>
          <div class="company-name">SAUDCONSULT</div>
        </div>
      </div>
    `;

        // Footer HTML
        const footer_html = `
      <div id="cp-app-footer" class="company-footer">
        <div class="footer-content">
          <div class="footer-logo">
            <img src="/assets/frappe/images/Forty-1.png" alt="FORTY Logo" class="logo-image">
          </div>
          <div class="footer-info">
            <a href="https://capital-project.io" class="company-link" target="_blank" rel="noopener">
              CAPITAL-PROJECT.IO
            </a>
            <p class="company-tagline">Enterprise Management System</p>
            <p>✉️ hello@capital-project.io</p>
            <p class="copyright">© 2025 All rights reserved</p>
          </div>
        </div>
      </div>
    `;

        // Main section
        const $main = frm.$wrapper.find('.layout-main-section').first();
        if (!$main.length) return;

        // Remove old copies
        $main.find('#cp-app-banner').remove();
        $main.find('#cp-app-footer').remove();

        // Inject
        $main.prepend(banner_html);
        $main.append(footer_html);
    }
});

function inject_global_styles() {
    const STYLE_ID = 'cp-app-banner-footer-styles';
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
    /* ===== Banner ===== */
    .company-banner {
      width: 100%;
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      margin: 0 0 12px 0;
      border-radius: 0; /* no rounded corners */
      box-shadow: none; /* no shadow */
    }
    .company-banner-content {
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 1200px;
      margin: 0; /* start from extreme left */
    }
    .company-logo img {
      width: 42px;
      height: 42px;
      object-fit: cover;
    }
    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #00980d;
      letter-spacing: .4px;
    }

    /* ===== Footer ===== */
    .company-footer {
      width: 100%;
      background: #f6f6f6;
      border-top: 2px solid #002e5d;
      padding: 24px 20px;
      margin-top: 20px;
      border-radius: 0;
      box-shadow: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .company-footer .footer-content {
      display: flex;
      align-items: center;
      gap: 40px;
      margin: 0; /* start from extreme left */
    }
    .company-footer .footer-logo {
      display: flex;
      align-items: center;
    }
    .company-footer .logo-image {
      width: 48px;
      height: 48px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .company-footer .footer-info { flex: 1; }
    .company-footer .company-link {
      font-size: 18px;
      font-weight: 600;
      color: #002e5d;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .company-footer .company-link:hover { opacity: .85; }
    .company-footer .company-tagline {
      margin: 8px 0;
      font-size: 14px;
      color: #666;
    }
    .company-footer .copyright {
      margin: 0;
      font-size: 13px;
      color: #999;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .company-footer .footer-content {
        flex-direction: column;
        text-align: center;
        gap: 20px;
      }
      .company-footer .footer-logo { justify-content: center; }
      .company-footer .footer-info { flex: unset; }
      .company-footer .logo-image { width: 40px; height: 40px; }
    }
  `;
    document.head.appendChild(style);
}
