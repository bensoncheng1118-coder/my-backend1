# -*- coding: utf-8 -*-
"""科目 → 年級學期 → 雲端資料夾 對照表，供搜尋引擎使用。

雲端連結來自 templates/t_course.html（Study Drive 各學期資料夾），
NotebookLM 連結來自 templates/notebooklm.html。
新增科目或學期時，只要改這個檔案即可，首頁即時搜尋與搜尋結果頁都會同步更新。
"""
import re

# 各學期雲端資料夾（與 t_course.html 相同）
SEMESTER_DRIVE = {
    "大一上學期": "https://drive.google.com/drive/folders/1Quyg3y5d1vxp5Vzo7s6lgjfHTYMycInu",
    "大一下學期": "https://drive.google.com/drive/folders/1oKXgwixYfIOtqtlueijHH9pZsvgFUF1N",
    "大二上學期": "https://drive.google.com/drive/folders/1Aw30owh1LPhbzt4jAdO3O6tja5w0fjII",
    "大二下學期": "https://drive.google.com/drive/folders/1usbWiUDNFFiI3vLvJL4HfpCk_qUpqOla",
    "大三上學期": "https://drive.google.com/drive/folders/1WzBMse9GLYP4_PXlG0QTuOiII13g8Dy0",
    "大三下學期": "https://drive.google.com/drive/folders/1IEusjwK1rZbOAceYKVH7lCj85DllSkOH",
    "國考": "https://drive.google.com/drive/folders/1WAScrWic5vHayJsIxxTBAXrakOVIrx98",
}
DRIVE_ROOT = "https://drive.google.com/drive/folders/1Sv4IFVYWN7cAfrSQWDR3ZvjMXkt7Vw9-"

_NB = "https://notebooklm.google.com/notebook/"

# name: 正式科目名稱；aliases: 其他寫法／簡稱；notebook: NotebookLM 連結（可為空）
SUBJECTS = [
    # 大一上學期
    {"name": "溝通障礙學導論", "semester": "大一上學期", "aliases": ["溝通障礙導論", "溝障導論", "溝障"],
     "notebook": _NB + "835ab921-8d96-4566-99ca-e90ec6fb0cbc"},
    {"name": "普通心理學", "semester": "大一上學期", "aliases": ["普心", "心理學"],
     "notebook": _NB + "0b6d928b-a8a6-407f-9b76-bb179f02b2c0"},
    {"name": "語言學概論", "semester": "大一上學期", "aliases": ["語概", "語言學"],
     "notebook": _NB + "cc542c32-0e45-47e9-a9cd-6f26995b9935"},
    {"name": "聽語科學導論", "semester": "大一上學期", "aliases": ["聽語導論"],
     "notebook": _NB + "f49dfd75-7be3-4b49-94eb-b6aa606df28e"},
    {"name": "解剖學", "semester": "大一上學期", "aliases": ["解剖"],
     "notebook": _NB + "f6ccb284-cc4c-4837-98e5-df298aac1920"},
    # 大一下學期
    {"name": "基礎聽力科學", "semester": "大一下學期", "aliases": ["聽力科學", "基聽"],
     "notebook": _NB + "362dd5b1-ef00-4eca-b27b-34323fe91dbd"},
    {"name": "言語科學", "semester": "大一下學期", "aliases": [],
     "notebook": _NB + "5b38cf0b-86df-4073-aa2e-36da302911c0"},
    {"name": "生理學", "semester": "大一下學期", "aliases": ["生理"],
     "notebook": _NB + "d873b5c4-e797-4319-9a8d-b6b8b803a05b"},
    {"name": "聽語神經解剖機轉", "semester": "大一下學期", "aliases": ["聽語神經科學解剖機轉", "神經解剖", "神解"],
     "notebook": _NB + "6221962e-bf4b-402f-9f56-61ca2f118b1f"},
    {"name": "基礎臨床實務論(二)", "semester": "大一下學期", "aliases": ["基礎臨床實務論", "臨床實務"],
     "notebook": ""},
    {"name": "兒童語言發展學", "semester": "大一下學期", "aliases": ["兒童語言發展", "兒語發展", "兒語"],
     "notebook": _NB + "d5f7c990-615e-4741-bc97-7a70d87a9b77"},
    {"name": "語音音韻學", "semester": "大一下學期", "aliases": ["音韻學"],
     "notebook": _NB + "115b4cfd-a302-4a49-b12b-a1d1ebeb637c"},
    # 大二上學期
    {"name": "語音聲學", "semester": "大二上學期", "aliases": [],
     "notebook": _NB + "16b9fc21-f238-4297-80c3-7def50bc1b5a"},
    {"name": "嬰幼兒及學前兒童語言障礙學", "semester": "大二上學期", "aliases": ["嬰幼兒語言障礙", "學前兒童語言障礙", "兒語障"],
     "notebook": _NB + "1b96720f-495f-4ba8-9753-b348d15190e3"},
    {"name": "構音與音韻障礙", "semester": "大二上學期", "aliases": ["構音障礙", "音韻障礙", "構音"],
     "notebook": _NB + "be7cea7a-c194-45bf-91d3-5261848c1954"},
    {"name": "臨床聽力學基礎", "semester": "大二上學期", "aliases": ["臨床聽力學", "臨聽"],
     "notebook": _NB + "00fe1379-d1ac-4bb7-af5f-b41c7a7973a2"},
    {"name": "行為治療原理與技術", "semester": "大二上學期", "aliases": ["行為治療", "行治"],
     "notebook": _NB + "bccad2f3-86d1-41ad-99b3-83e30d66d346"},
    {"name": "生物統計學", "semester": "大二上學期", "aliases": ["生物統計", "生統"],
     "notebook": _NB + "61410e83-dc82-4e0f-87b5-b9feb3030791"},
]

_STRIP = re.compile(r"[\s()（）［］\[\]・·．.,，、\-_/]+")


def normalize(text):
    return _STRIP.sub("", (text or "").lower())


def _match_score(q, names):
    """回傳匹配分數（越小越好），不匹配回傳 None。"""
    best = None
    for i, raw in enumerate(names):
        n = normalize(raw)
        if not n:
            continue
        if q == n:
            s = 0 if i == 0 else 1
        elif n.startswith(q):
            s = 2
        elif len(q) >= 2 and q in n:
            s = 3
        elif len(n) >= 2 and n in q:  # 使用者打了一整句，裡面含有科目名稱
            s = 4
        else:
            continue
        best = s if best is None else min(best, s)
    return best


def find_subjects(query, limit=6):
    """依關鍵字找出科目，附上所在學期的雲端連結。"""
    q = normalize(query)
    if not q:
        return []
    hits = []
    for order, subj in enumerate(SUBJECTS):
        score = _match_score(q, [subj["name"]] + subj["aliases"])
        if score is not None:
            hits.append((score, order, subj))
    hits.sort(key=lambda h: (h[0], h[1]))
    return [dict(h[2], drive=SEMESTER_DRIVE.get(h[2]["semester"], DRIVE_ROOT)) for h in hits[:limit]]


def find_semesters(query):
    """輸入「大一」「大二上」「國考」等，直接回傳對應的學期資料夾。"""
    q = normalize(query)
    if not q:
        return []
    out = []
    for sem, url in SEMESTER_DRIVE.items():
        n = normalize(sem)
        short = n.replace("學期", "")
        if q in (n, short) or (len(q) >= 2 and n.startswith(q)) or (len(short) >= 2 and short in q):
            out.append({"semester": sem, "drive": url})
    return out


def public_data():
    """給前端即時搜尋用的完整資料。"""
    return {
        "subjects": [dict(s, drive=SEMESTER_DRIVE.get(s["semester"], DRIVE_ROOT)) for s in SUBJECTS],
        "semesters": [{"semester": k, "drive": v} for k, v in SEMESTER_DRIVE.items()],
        "driveRoot": DRIVE_ROOT,
    }
