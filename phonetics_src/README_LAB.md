# 發音互動教室（/phonetics）

這個資料夾是開源專案 [CHIMERA](https://github.com/jamesondh/chimera-vocal-synth)（MIT 授權，作者 Jameson Hodge）的完整原始碼，
再加上本網站用的單頁版面：

- `voice-lab.html`、`src/lab/`：新的教科書式頁面（聲道剖面、聲帶模式、頻譜圖、Say、母音四邊形、IPA 子音表）
- `vite.lab.config.ts`：把頁面編譯到網站的 `static/phonetics/`

網站實際載入的是已編譯好的 `static/phonetics/`，Flask 路由 `/phonetics` 會回傳其中的 `voice-lab.html`。
只改網站其他部分時不需要重新編譯。

## 修改頁面後重新編譯

需要 Rust（加上 `wasm32-unknown-unknown` 目標）與 Bun：

```sh
rustup target add wasm32-unknown-unknown
cd phonetics_src
bun install
bun run build:lab     # 編譯聲音引擎 (wasm) 與頁面，輸出到 ../static/phonetics/
bun run dev:lab       # 本機開發：http://127.0.0.1:5319/static/phonetics/voice-lab.html
```

瀏覽器的 AudioWorklet 只能在 HTTPS 或 localhost 上運作。
