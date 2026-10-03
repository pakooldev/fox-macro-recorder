import icons from "@/generated/icons.json";

export type IconName = keyof typeof icons;

// Same pixel icons as the extension panel (content/icons.js, via sync-design)
export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="px-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}

type MascotState = "idle" | "record" | "play" | "success" | "error" | "sleep";

// The extension's sprite rules (fox-shared.css): --f = one frame on screen
export function Mascot({ state = "idle", big = false }: { state?: MascotState; big?: boolean }) {
  return <span className={`fox-mascot fox-m-${state}${big ? " fox-mascot-2x" : ""}`} aria-hidden="true" />;
}

// Keyboard shortcut as keycaps: "Alt+Shift+F" -> [Alt] [Shift] [F]
export function Keys({ combo }: { combo: string }) {
  return (
    <span className="keys">
      {combo.split("+").map((k) => (
        <kbd key={k}>{k}</kbd>
      ))}
    </span>
  );
}
