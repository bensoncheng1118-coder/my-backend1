/** Entry for the lab page: load the engine (wasm) first, then mount the page. */
import "./lab.css";
import { initChimera } from "../wasm/chimera.ts";

const root = document.getElementById("root")!;

async function boot(): Promise<void> {
  try {
    await initChimera();
  } catch (err) {
    root.textContent = `聲音引擎載入失敗：${err instanceof Error ? err.message : String(err)}（請重新整理頁面）`;
    return;
  }
  const [{ StrictMode }, { createRoot }, { LabApp }] = await Promise.all([import("react"), import("react-dom/client"), import("./LabApp.tsx")]);
  root.replaceChildren();
  createRoot(root).render(
    <StrictMode>
      <LabApp />
    </StrictMode>,
  );
}

void boot();
