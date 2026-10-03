import { STORE_URL } from "./site";
import { Icon } from "./pixel";

export function StoreButton({ small = false }: { small?: boolean }) {
  const cls = `btn btn-primary${small ? " btn-small" : ""}`;
  if (!STORE_URL) {
    return (
      <span className={`${cls} is-disabled`} aria-disabled="true">
        Coming soon to Chrome
      </span>
    );
  }
  return (
    <a className={cls} href={STORE_URL} target="_blank" rel="noopener">
      <Icon name="download" /> Add to Chrome
    </a>
  );
}
