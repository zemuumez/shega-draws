export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
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
      {children}
    </div>
  );
}
