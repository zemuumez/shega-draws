export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="sanity-studio-root"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100vh",
        maxHeight: "100dvh",
        width: "100vw",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        zIndex: 9999,
        background: "#0E1015",
      }}
    >
      <style>{`
        /* Sanity Studio High-Contrast Dark Mode Heading & Label Overrides */
        .sanity-studio-root h1,
        .sanity-studio-root h2,
        .sanity-studio-root h3,
        .sanity-studio-root h4,
        .sanity-studio-root h5,
        .sanity-studio-root h6,
        .sanity-studio-root [data-ui="Heading"],
        .sanity-studio-root [data-testid="pane-header"] h1,
        .sanity-studio-root [data-testid="pane-header"] h2,
        .sanity-studio-root [data-testid="pane-header"] h3,
        .sanity-studio-root [data-testid="document-pane"] h1,
        .sanity-studio-root [data-testid="document-pane"] h2,
        .sanity-studio-root [data-testid="document-pane"] h3,
        .sanity-studio-root [data-testid="document-pane"] h4,
        .sanity-studio-root [data-testid="document-panel-portal"] h1,
        .sanity-studio-root [data-testid="document-panel-portal"] h2,
        .sanity-studio-root [data-testid="document-panel-portal"] h3 {
          color: #F8FAFC !important;
        }

        .sanity-studio-root label,
        .sanity-studio-root legend,
        .sanity-studio-root [data-ui="FormField"] label,
        .sanity-studio-root [data-ui="Field"] label,
        .sanity-studio-root [data-testid*="field-"] label {
          color: #F1F5F9 !important;
        }
      `}</style>
      {children}
    </div>
  );
}
