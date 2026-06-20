import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for JsonWiz.dev — free JSON tools that run entirely in your browser.",
};

export default function PrivacyPage() {
  const section: React.CSSProperties = {
    marginBottom: "32px",
  };
  const h2: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: "0 0 10px",
  };
  const p: React.CSSProperties = {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    margin: "0 0 10px",
  };
  const ul: React.CSSProperties = {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    paddingLeft: "20px",
    margin: "0 0 10px",
  };

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        Privacy Policy
      </h1>
      <p style={{ ...p, marginBottom: "40px" }}>
        Last updated: June 20, 2026
      </p>

      <div style={section}>
        <h2 style={h2}>Overview</h2>
        <p style={p}>
          JsonWiz (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the website jsonwiz.dev. We are committed to protecting your privacy. This policy explains what data we collect, why, and how we use it.
        </p>
        <p style={p}>
          <strong>The short version:</strong> All JSON processing happens entirely inside your browser. No JSON data you enter into any tool is ever transmitted to our servers or any third party.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>Data we do not collect</h2>
        <ul style={ul}>
          <li>Any JSON, text, or data you paste into our tools</li>
          <li>Account information (we have no accounts or sign-ups)</li>
          <li>Passwords or payment information</li>
          <li>Precise location data</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>Data we do collect</h2>
        <p style={p}>We collect anonymous, aggregated usage data to understand how the site is used:</p>
        <ul style={ul}>
          <li><strong>Cloudflare Web Analytics</strong> — page views, referrer, country, browser type. This is privacy-first analytics with no cookies and no cross-site tracking. Data is aggregated and never linked to an individual.</li>
          <li><strong>Server logs</strong> — Cloudflare Pages may log standard HTTP request data (IP address, timestamp, URL requested) for security and abuse prevention. These are not used for advertising and are retained per Cloudflare&apos;s standard policy.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>Cookies</h2>
        <p style={p}>
          We store one item in your browser&apos;s <code>localStorage</code>: your light/dark theme preference. This never leaves your device and is not a cookie.
        </p>
        <p style={p}>
          We do not use tracking cookies. If advertising is enabled in future, ad providers (such as Google AdSense) may set their own cookies subject to their own privacy policies.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>Advertising</h2>
        <p style={p}>
          JsonWiz displays advertisements to fund free access to our tools. We use or may use:
        </p>
        <ul style={ul}>
          <li><strong>Google AdSense</strong> — Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out at <a href="https://www.google.com/settings/ads" style={{ color: "var(--accent)" }}>google.com/settings/ads</a>.</li>
        </ul>
        <p style={p}>
          Ad slots on the site are clearly marked. We do not serve intrusive pop-ups or auto-play video ads.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>Third-party services</h2>
        <ul style={ul}>
          <li><strong>Cloudflare</strong> — hosts this website and provides DDoS protection, CDN, and analytics. <a href="https://www.cloudflare.com/privacypolicy/" style={{ color: "var(--accent)" }}>Cloudflare Privacy Policy</a></li>
          <li><strong>Google AdSense</strong> (if enabled) — ad serving. <a href="https://policies.google.com/privacy" style={{ color: "var(--accent)" }}>Google Privacy Policy</a></li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>Children&apos;s privacy</h2>
        <p style={p}>
          JsonWiz does not knowingly collect any information from children under 13. The site contains no user accounts or data submission forms.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>Changes to this policy</h2>
        <p style={p}>
          We may update this policy as the site evolves. The &quot;last updated&quot; date at the top will reflect any changes. Continued use of the site after changes constitutes acceptance of the updated policy.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>Contact</h2>
        <p style={p}>
          Questions about this privacy policy? Open an issue on our GitHub repository or reach out via the contact details on file with our domain registrar.
        </p>
      </div>
    </div>
  );
}
