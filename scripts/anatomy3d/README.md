# 3D 解剖模型資料（/anatomy 頁面）

`static/anatomy3d/auditory.bin`、`static/anatomy3d/oral.bin` 是由 BodyParts3D 4.3 的 OBJ 網格精簡而成。

- 來源：BodyParts3D / Anatomography © The Database Center for Life Science（DBCLS），CC BY-SA 2.1 JP。
  OBJ 取自 <https://github.com/olivercase/body_parts_3d_api>（Git LFS）。
- `selection.json`：使用的 FJ 編號與英文名稱（`aud` 聽覺、`oral` 口咽喉）。
- `download.py`：把選到的 OBJ 下載到 `raw/`。
- `build_models.py`：用 trimesh + fast-simplification 精簡網格，座標轉成 three.js（x, z, -y），
  以 int16 量化頂點、uint16 索引，寫成 `.bin`（4 位元組標頭長度 + JSON 標頭 + 資料）。

需要：`pip install trimesh fast-simplification networkx numpy`。
聽小骨、耳蝸、柯地氏器、腦幹聽覺神經核與傳導束不在 BodyParts3D 內，由 `static/anatomy3d/app.js` 程式建模。
