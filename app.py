from flask import Flask, render_template, request, abort, redirect, url_for, flash, session, render_template_string
import urllib.parse
import os
import requests
import json
import pytz
import traceback
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build
import re
from flask import send_from_directory, jsonify
import base64
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from flask_pymongo import PyMongo
from urllib.parse import unquote
import time
from flask import send_from_directory


app = Flask(__name__)
app.secret_key = "your_super_secret_key_123"  # 換成你自己的隨機字串

# MongoDB 連線字串（請改成你實際的連線URI）
MONGO_URI = "mongodb://localhost:27017/myapp"
app.config["MONGO_URI"] ="mongodb://localhost:27017/myapp"
client = MongoClient(MONGO_URI)
db_mongo = client['mydatabase']  # 資料庫名稱
users_collection = db_mongo['users']  # 集合名稱
mongo = PyMongo(app)
user_actions_collection = mongo.db.user_actions



DEEPSEEK_API_URL = "https://api.deepseek.com/v1/speech-to-text"  # 範例API端點，請以官方提供的為主
DEEPSEEK_API_KEY = "sk-fa5b93231839447e8965e3542119049a"

DATA_FOLDER = os.path.join('data', 'general_knowledge')
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

DATA_FOLDER_A = 'data/comment_comment_data'

# 模擬留言，可改成從DB或其他地方讀取
comments = {
    "1": "這是科目X的留言內容範例",
    "2": "這是科目Y的留言內容範例"
}

# 新增留言永久儲存資料夾位置
COMMENT_DATA_FOLDER = os.path.join('data', 'comment_data')
os.makedirs(COMMENT_DATA_FOLDER, exist_ok=True)

os.makedirs(DATA_FOLDER, exist_ok=True)

DATA_DIR = 'data/course_data'
os.makedirs(DATA_DIR, exist_ok=True)

COMMENT_DATA_DIR = os.path.join('data', 'course_comment_data')
if not os.path.exists(COMMENT_DATA_DIR):
    os.makedirs(COMMENT_DATA_DIR)

DATA_DIR = 'data/course_data'
VALID_FIELDS = {'語言', '天', '地', '人', '心'}  # 預設允許的領域

# === Discord Webhook URLs ===
VISITOR_DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399031760964026398/gAqAAb2ugQe67jjNFeBwhsNrfyb0S4t_pNqG2zI3whp_IBWuL1wtIW33qIfocBy5pi9"
APPOINTMENT_DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399124589740560605/jcwCIWL5Ai0rzAnPYeTlZTDcFnZl_hc_spJmVWzCsxkpku78jgg9g0XmhrYfaFQ0ZZVX"

CATEGORIES = ['作業', '總複習', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八']
GRADES = ['大一', '大二', '大三']
SEMESTERS = ['上學期', '下學期']
EXPERIENCES = ['國際交流', '競賽成果', '實習心得', '其他經歷']

APPOINTMENT_FILE = 'appointments.json'
SERVICE_ACCOUNT_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/calendar']
CALENDAR_ID = 'fbee9e120b8cf6db5151fcda035b17afd8806a86ade2e839c225ad43fe93f65b@group.calendar.google.com'


# 根據環境選擇讀取方式
if os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON"):
    # 🔹 在 Render 雲端時，從環境變數載入 JSON
    info = json.loads(os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON"))
    credentials = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
else:
    # 🔹 在本地執行時，從 credentials.json 檔案讀取
    credentials = service_account.Credentials.from_service_account_file(
        "credentials.json", scopes=SCOPES
    )

# 建立 Google Calendar API 服務
calendar_service = build('calendar', 'v3', credentials=credentials)



# 載入回覆
def load_replies(subject):
    os.makedirs(DATA_FOLDER_A, exist_ok=True)
    filepath = os.path.join(DATA_FOLDER_A, f'{subject}.json')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# 儲存回覆
def save_replies(subject, replies):
    os.makedirs(DATA_FOLDER_A, exist_ok=True)
    filepath = os.path.join(DATA_FOLDER_A, f'{subject}.json')
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(replies, f, ensure_ascii=False, indent=2)

# 載入留言文字（示範，可改成你的資料結構）
def load_comments_by_time(course_name, target_time):
    """
    從 data/comment_data/{course_name}.json 讀取留言，
    回傳留言時間等於 target_time 的留言清單
    """
    # 處理 course_name 以避免非法檔名
    safe_course_name = re.sub(r'[\\/:"*?<>|]+', '_', course_name)
    filepath = os.path.join(COMMENT_DATA_FOLDER, f"{safe_course_name}.json")
    print("檔案路徑:", filepath, os.path.exists(filepath), flush=True)

    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                comments = json.load(f)
                if isinstance(comments, list):
                    for comment in comments:
                        print(comment.get("time"), comment.get("text"), flush=True)

                    # 篩選出時間符合 target_time 的留言
                    matched_comments = [
                        comment for comment in comments
                        if 'time' in comment and comment['time'] == target_time
                    ]
                    print(f"讀取檔案：{filepath}，找到 {len(matched_comments)} 則留言", flush=True)
                    return matched_comments
        except Exception as e:
            print(f"讀取留言檔案錯誤 [{filepath}]: {e}", flush=True)
    else:
        print(f"檔案不存在：{filepath}", flush=True)
    return []




def load_comments_from_file(course_name):
    """從 data/comment_data/{course_name}.json 讀取留言，回傳留言清單"""
    safe_course_name = re.sub(r'[\\/:"*?<>|]+', '_', course_name)
    filepath = os.path.join(COMMENT_DATA_FOLDER, f"{safe_course_name}.json")
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                comments = json.load(f)
                if isinstance(comments, list):
                    return comments
        except Exception as e:
            print(f"讀取留言檔案錯誤 [{filepath}]: {e}")
    return []

def save_comments_to_file(course_name, comments):
    """將留言清單寫入 data/comment_data/{course_name}.json"""
    safe_course_name = re.sub(r'[\\/:"*?<>|]+', '_', course_name)
    filepath = os.path.join(COMMENT_DATA_FOLDER, f"{safe_course_name}.json")
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(comments, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"儲存留言檔案錯誤 [{filepath}]: {e}")

def delete_comment_from_db(course_name, comment_time):
    comments = load_comments_from_file(course_name)
    initial_len = len(comments)
    comments = [c for c in comments if c['time'] != comment_time]
    if len(comments) == initial_len:
        return False
    save_comments_to_file(course_name, comments)
    return True

def sanitize_filename(name):
    """將課程名稱轉成安全檔名，避免特殊字元"""
    return re.sub(r'[^a-zA-Z0-9_-]', '_', name)

def get_course_filepath(course):
    return os.path.join('data', 'course_data', f'{course}.json')

def get_course_comment_filepath(course):
    return os.path.join('data', 'course_comment_data', f'{course}.json')

def format_time(ts):
    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")

# 首頁（改成無登入限制）
@app.route('/')
def index():
    username = session.get('username')
    actions = session.get('actions', [])  # 預設使用空列表避免 Undefined
    return render_template('index.html', mode='note', grades=GRADES, semesters=SEMESTERS, experiences=EXPERIENCES, username=username, actions=actions)

@app.route('/uploads/<course>/<category>/<filename>')
def uploaded_file(course, category, filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], course, category), filename)

@app.before_request
def log_visitor_info():
    visitor_info = {
        "時間": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "IP": request.remote_addr,
        "使用者代理": request.user_agent.string,
        "請求方法": request.method,
        "請求路徑": request.path,
        "來源頁面": request.referrer or "無"
    }
    message = "\n".join([f"**{k}**：{v}" for k, v in visitor_info.items()])
    send_to_discord(message, VISITOR_DISCORD_WEBHOOK_URL, prefix="📡 有人訪問網站！")

def send_to_discord(content, webhook_url, prefix=""):
    try:
        data = {"content": f"{prefix}\n{content}" if prefix else content}
        requests.post(webhook_url, json=data)
    except Exception as e:
        print(f"❌ 傳送 Discord 失敗：{e}")

courses = {
    "溝通障礙學導論": """<span style="font-size:24px; color:purple; font-weight:bold;">溝通障礙分類</span>""",
    "普通心理學": "尚未更新",
    "語言學概論": """<span style="font-size:24px; color:purple; font-weight:bold;">什麼是語言</span>""",
    "聽語科學導論": "尚未更新",
    "解剖學": "尚未更新",
    "基礎聽力科學": "尚未更新",
    "言語科學": "尚未更新",
    "生理學": "尚未更新",
    "聽語神經解剖機轉": "尚未更新",
    "基礎臨床實務論(二)": "尚未更新",
    "兒童語言發展學": "尚未更新",
    "語音音韻學": "尚未更新",
    "行為治療原理與技術": "尚未更新",
    "語音聲學": "尚未更新",
    "嬰幼兒與學前兒童語言障礙學": "尚未更新",
    "生物統計學": "尚未更新",
    "構音與音韻異常": "尚未更新",
}

custom_subjects = {}

def extract_text_from_html(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        text = re.sub(r'<[^>]+>', '', content)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    except Exception as e:
        print(f"讀取檔案失敗 {filepath}: {e}")
        return ""

@app.route('/experience/<name>')
def show_experience(name):
    decoded_name = urllib.parse.unquote(name)
    content = f"<h2>{decoded_name}</h2><p>這是 {decoded_name} 的內容區塊。</p>"
    return render_template('course_detail.html', title=decoded_name, content=content, categories=CATEGORIES)

@app.route('/course/<path:course_name>', methods=['GET', 'POST'])
def course_detail(course_name):
    course_name = course_name.strip()
    uploaded_files = {category: [] for category in CATEGORIES}
    print("Raw course_name from URL:", course_name)
    decoded_name = urllib.parse.unquote(course_name)
    print("Decoded course_name:", repr(decoded_name))
    print("Courses keys:", list(courses.keys()))
    content = courses.get(decoded_name)
    if not content:
        print("Course not found!")
        return abort(404, description="課程不存在")

    if request.method == 'POST':
        if 'file' in request.files:
            category = request.form.get('category')
            uploaded_file = request.files.get('file')
            if uploaded_file and category in CATEGORIES:
                save_dir = os.path.join(app.config['UPLOAD_FOLDER'], course_name, category)
                os.makedirs(save_dir, exist_ok=True)
                file_path = os.path.join(save_dir, uploaded_file.filename)
                uploaded_file.save(file_path)
        elif 'comment' in request.form and request.path.startswith('/course/'):
            comment = request.form.get('comment', '').strip()
            if comment:
                comments = load_comments_from_file(decoded_name)
                comments.append({
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "text": comment
                })
                save_comments_to_file(decoded_name, comments)
                flash("留言已送出！")
            else:
                flash("留言不得為空")

        return redirect(url_for('course_detail', course_name=course_name))
    
    for category in CATEGORIES:
        cat_dir = os.path.join(app.config['UPLOAD_FOLDER'], course_name, category)
        if os.path.exists(cat_dir):
            uploaded_files[category] = os.listdir(cat_dir)

    comments = load_comments_from_file(decoded_name)

    return render_template('course_detail.html', title=course_name,
                           content=f"<p>{course_name} 的課程介紹。</p>",
                           categories=CATEGORIES, comments=comments,
                           uploaded_files=uploaded_files)

@app.route('/appointment', methods=['GET', 'POST'])
def appointment():
    appointments = [] 
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        phone = request.form.get('phone', '').strip()
        datetime_str = request.form.get('datetime', '').strip()
        request_note = request.form.get('request', '').strip()

        if not name or not phone or not datetime_str:
            flash("請完整填寫姓名、電話與預約時間")
            return redirect(url_for('appointment'))

        try:
            dt_obj = datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M')
        except ValueError:
            flash("日期時間格式錯誤")
            return redirect(url_for('appointment'))

        try:
            tz = pytz.timezone('Asia/Taipei')
            dt_obj_tz = tz.localize(dt_obj) if dt_obj.tzinfo is None else dt_obj.astimezone(tz)

            time_min = dt_obj_tz.isoformat()
            time_max = (dt_obj_tz + timedelta(hours=1)).isoformat()

            events_result = calendar_service.events().list(
                calendarId=CALENDAR_ID,
                timeMin=time_min,
                timeMax=time_max,
                timeZone='Asia/Taipei',
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = [e for e in events_result.get('items', []) if e.get('status') != 'cancelled']
            if events:
                flash("該時段已有人預約")
                return redirect(url_for('appointment'))

        except Exception as e:
            flash(f"無法檢查 Google Calendar 衝突：{e}")
            return redirect(url_for('appointment'))

        appointments.append({'name': name, 'phone': phone, 'datetime': datetime_str, 'request': request_note})
        send_appointment_to_discord(appointments, name, phone, datetime_str)

        try:
            event = {
                'summary': f'預約：{name}',
                'description': f'電話：{phone} \n預約需求：{request_note}',
                'start': {'dateTime': dt_obj_tz.isoformat(), 'timeZone': 'Asia/Taipei'},
                'end': {'dateTime': (dt_obj_tz + timedelta(hours=1)).isoformat(), 'timeZone': 'Asia/Taipei'},
            }
            calendar_service.events().insert(calendarId=CALENDAR_ID, body=event).execute()
            flash("預約成功，並已記錄到 Google Calendar！")
        except Exception as e:
            flash(f"預約成功，但同步 Google Calendar 失敗：{e}")

        return redirect(url_for('appointment'))

    appointments_sorted = sorted(appointments, key=lambda x: x['datetime'])
    return render_template('appointment.html', appointments=appointments_sorted)

@app.route('/grade_calculator', methods=['GET', 'POST'])
def grade_calculator():
    result = None
    if request.method == 'POST':
        try:
            scores = request.form.getlist('score', type=float)
            weights = request.form.getlist('weight', type=float)
            total_weight = sum(weights)
            if total_weight == 0:
                result = "加權總和不能為 0"
            else:
                weighted_avg = sum(s * w for s, w in zip(scores, weights)) / total_weight
                result = f"加權平均成績為：{round(weighted_avg, 2)}"
        except Exception as e:
            result = f"計算錯誤：{e}"
    return render_template('grade_calculator.html', result=result)

@app.route('/admin/comments')
def view_comments():
    # 讀取 data/comment_data 所有留言檔案，並匯總呈現
    comments_list = []
    try:
        for filename in os.listdir(COMMENT_DATA_FOLDER):
            if filename.endswith('.json'):
                course_name = os.path.splitext(filename)[0]
                filepath = os.path.join(COMMENT_DATA_FOLDER, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    try:
                        msgs = json.load(f)
                        if isinstance(msgs, list):
                            for msg in msgs:
                                time_str = msg.get('time', '')
                                time_obj = None
                                try:
                                    time_obj = datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S')
                                except Exception:
                                    time_obj = None
                                comments_list.append({
                                    'course': course_name,
                                    'time': time_obj,
                                    'name': msg.get('name', '匿名'),
                                    'content': msg.get('text', '')
                                })
                    except Exception as e:
                        print(f"解析留言檔案失敗 {filename}: {e}")
    except Exception as e:
        print(f"讀取留言資料夾失敗: {e}")

    # 預設不分頁，全部呈現
    return render_template('admin_comments.html',
                           comments=comments_list,
                           all_courses=[os.path.splitext(f)[0] for f in os.listdir(COMMENT_DATA_FOLDER) if f.endswith('.json')],
                           selected_course='')

def send_appointment_to_discord(appointments, name, phone, datetime_str):
    try:
        msg = f"📅 **新預約通知**\n- 姓名：{name}\n- 電話：{phone}\n- 時間：{datetime_str.replace('T', ' ')}\n\n**目前完整行事曆:**\n"
        for a in appointments:
            msg += f"- {a['datetime'].replace('T', ' ')}，姓名：{a['name']}，電話：{a['phone']}\n"
        requests.post(APPOINTMENT_DISCORD_WEBHOOK_URL, json={"content": msg})
    except Exception as e:
        print(f"Discord 預約 Webhook 發送錯誤: {e}")

@app.route('/api/comments/<course_name>', endpoint='get_comments')
def get_comments(course_name):
    decoded_name = urllib.parse.unquote(course_name)
    comments = load_comments_from_file(decoded_name)
    return {
        "comments": [
            {
                "name": comment.get("name", "匿名"),
                "time": comment.get("time", ""),
                "content": comment.get("text", "")
            }
            for comment in comments
        ]
    }

@app.route('/api/information/<course_name>', endpoint='get_information')
def get_information(course_name):
    decoded_name = urllib.parse.unquote(course_name)
    comments = load_comments_from_file(decoded_name)
    return {
        "comments": [
            {
                "name": comment.get("name", "匿名"),
                "time": comment.get("time", ""),
                "content": comment.get("text", "")
            }
            for comment in comments
        ]
    }

def get_excerpt(text, query, radius=30):
    pos = text.find(query)
    if pos == -1:
        return ""
    start = max(0, pos - radius)
    end = min(len(text), pos + len(query) + radius)
    excerpt = text[start:end].strip()
    if start > 0:
        excerpt = "..." + excerpt
    if end < len(text):
        excerpt = excerpt + "..."
    return excerpt

def load_all_courses():
    base_path = 'data/course_data'
    all_data = []

    for filename in os.listdir(base_path):
        if filename.endswith('.json'):
            category = os.path.splitext(filename)[0]  # 檔名去掉 .json，例如 "語言"
            with open(os.path.join(base_path, filename), 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    # 每一筆資料加上分類欄位
                    for course in data:
                        course['category'] = category
                        all_data.append(course)
                except json.JSONDecodeError as e:
                    print(f"❌ 無法解析 {filename}: {e}")
    return all_data

@app.route('/search')
def search():
    raw_query = request.args.get('q', '').strip().lower()
    if not raw_query:
        flash("輸入關鍵字搜尋")
        return redirect(url_for('index'))

    results = []

    # 將輸入的關鍵字以空白分割成多個關鍵詞，保留有實際字串的詞
    keywords = [kw for kw in raw_query.split() if kw]

    def strip_html(text):
        return re.sub(r'<[^>]+>', '', text).lower()

    def contains_any_keyword(target, keywords_list):
        if not target:
            return False
        target_lower = target.lower()
        return any(kw in target_lower for kw in keywords_list)

    # 1. 搜尋網站中所有頁面按鈕名稱（含動態讀取 courses 和按鈕）
    navigation_buttons = []

    # 經驗分享按鈕（EXPERIENCES）
    for exp in EXPERIENCES:
        navigation_buttons.append({
            "name": exp,
            "url": url_for('show_experience', name=urllib.parse.quote(exp))
        })

    # 課程按鈕（改用讀檔資料載入）
    all_courses = load_all_courses()
    for course in all_courses:
        course_name = course.get('course_name', '')
        navigation_buttons.append({
            "name": course_name,
            "url": url_for('course_detail', course_name=course_name)
        })

    # 固定按鈕頁面
    navigation_buttons.extend([
        {"name": "讀書筆記", "url": url_for('t_course', course_name='讀書筆記')},
        {"name": "通識", "url": url_for('general_knowledge', course_name='通識')},
        {"name": "預約系統", "url": url_for('appointment')},
        {"name": "成績計算機", "url": url_for('grade_calculator')},
        {"name": "首頁", "url": url_for('index')},
        {"name": "問題留言區", "url": url_for('view_comments', course='問題留言區')}
    ])

    # 搜尋按鈕名稱
    for btn in navigation_buttons:
        if contains_any_keyword(btn["name"], keywords):
            results.append({
                'title': f"頁面按鈕：{btn['name']}",
                'url': btn['url'],
                'excerpt': f"按鈕名稱包含相關關鍵字"
            })

    # 2. 搜尋經驗分享內容（名稱與簡短描述）
    for exp in EXPERIENCES:
        exp_text = f"{exp} 這是 {exp} 的內容區塊。"
        if contains_any_keyword(exp, keywords) or contains_any_keyword(exp_text, keywords):
            results.append({
                'title': f"經驗分享：{exp}",
                'url': url_for('show_experience', name=urllib.parse.quote(exp)),
                'excerpt': get_excerpt(exp_text.lower(), raw_query)
            })

    # 3. 搜尋課程內容（名稱與描述）
    for course in all_courses:
        name = course.get('course_name', '')
        description = course.get('description', '') or ''
        # 如果description是html，去除標籤
        content = strip_html(description)
        if contains_any_keyword(name, keywords) or contains_any_keyword(content, keywords):
            # 使用相同路由格式 /course/<course_name>
            results.append({
                'title': f"課程：{name}",
                'url': url_for('course_detail', course_name=name),
                'excerpt': get_excerpt(content, raw_query)
            })

    # 4. 搜尋 courses 字典中的內容（例如你網站裡直接定義的 courses，補充搜尋這個資料來源）
    for course_name, html_content in courses.items():
        text_content = strip_html(html_content)
        if contains_any_keyword(course_name, keywords) or contains_any_keyword(text_content, keywords):
            results.append({
                'title': f"(字典課程)課程：{course_name}",
                'url': url_for('course_detail', course_name=course_name),
                'excerpt': get_excerpt(text_content, raw_query)
            })
    
    # 新增：以下掃描 data 資料夾三個子資料夾，找存在該課程名稱的 JSON 檔案，加入留言管理頁面連結
    data_subfolders = ['comment_data', 'course_data', 'general_knowledge']
    # 讀取所有JSON檔案課程名集合
    found_courses = set()
    for subfolder in data_subfolders:
        folder_path = os.path.join('data', subfolder)
        if not os.path.isdir(folder_path):
            continue
        for filename in os.listdir(folder_path):
            if filename.endswith('.json'):
                course_name = os.path.splitext(filename)[0]
                found_courses.add(course_name)

    for fc in found_courses:
        # 判斷搜尋字串是否包含課程名稱(小寫比較)
        if any(kw in fc.lower() for kw in keywords):
            results.append({
                'title': f"留言管理頁面：{fc}",
                'url': url_for('view_comments') + f"?course={urllib.parse.quote(fc)}",
                'excerpt': f"點此查看課程「{fc}」的留言管理"
            })

    # 5. 搜尋留言內容 (掃描 comment_data 下所有留言)
    try:
        for filename in os.listdir(COMMENT_DATA_FOLDER):
            if filename.endswith('.json'):
                course_name = os.path.splitext(filename)[0]
                filepath = os.path.join(COMMENT_DATA_FOLDER, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    try:
                        comments = json.load(f)
                        if isinstance(comments, list):
                            for comment in comments:
                                text = comment.get('text', '')
                                if contains_any_keyword(text, keywords):
                                    results.append({
                                        'title': f"留言於 {course_name}",
                                        'url': url_for('course_detail', course_name=course_name),
                                        'excerpt': get_excerpt(text.lower(), raw_query)
                                    })
                    except Exception as e:
                        print(f"解析留言檔失敗 {filename}: {e}")
    except Exception as e:
        print(f"讀取留言資料夾失敗: {e}")

    # 6. 搜尋上傳檔案名稱（uploads 資料夾），掃描各課程各類別的檔名
    try:
        uploads_path = app.config['UPLOAD_FOLDER']
        for course_folder in os.listdir(uploads_path):
            course_folder_path = os.path.join(uploads_path, course_folder)
            if os.path.isdir(course_folder_path):
                for category_folder in os.listdir(course_folder_path):
                    category_path = os.path.join(course_folder_path, category_folder)
                    if os.path.isdir(category_path):
                        for filename in os.listdir(category_path):
                            if contains_any_keyword(filename, keywords):
                                url = url_for('uploaded_file', course=course_folder, category=category_folder, filename=filename)
                                results.append({
                                    'title': f"上傳檔案：{filename}",
                                    'url': url,
                                    'excerpt': f"檔名包含關鍵字"
                                })
    except Exception as e:
        print(f"讀取上傳檔案失敗: {e}")

    # 7. 搜尋固定頁面說明文字
    appointment_info = "預約頁面用於安排時間，請填寫姓名、電話與預約時間。"
    if contains_any_keyword(appointment_info, keywords):
        results.append({
            'title': '預約系統說明',
            'url': url_for('appointment'),
            'excerpt': get_excerpt(appointment_info.lower(), raw_query)
        })

    grade_calculator_info = "成績計算機可幫助你計算加權平均分數，輸入各項成績及其權重後，即可快速得到結果。"
    if contains_any_keyword(grade_calculator_info, keywords):
        results.append({
            'title': '成績計算機說明',
            'url': url_for('grade_calculator'),
            'excerpt': get_excerpt(grade_calculator_info.lower(), raw_query)
        })

    # 去重(依 url 去重)
    seen_urls = set()
    unique_results = []
    for r in results:
        if r['url'] not in seen_urls:
            unique_results.append(r)
            seen_urls.add(r['url'])

    return render_template('search_results.html', query=raw_query, results=unique_results)

@app.route('/general_knowledge')
def general_knowledge():
    return render_template('general_knowledge.html')

@app.route('/add_course', methods=['POST'])
def add_course():
    data = request.json
    domain = data.get('domain')
    course = data.get('course')

    valid_domains = ['語言', '天', '地', '人', '心']
    if not domain or not course or domain not in valid_domains:
        return jsonify({"success": False, "message": "請提供有效領域及課程資料"}), 400

    filepath = os.path.join(DATA_DIR, f"{domain}.json")

    # 如果檔案存在，讀取原有資料，否則初始化空列表
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                courses = json.load(f)
        except Exception:
            courses = []
    else:
        courses = []

    # 把新課程加到列表裡
    courses.append(course)

    # 寫回檔案
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(courses, f, ensure_ascii=False, indent=2)
    except Exception as e:
        return jsonify({"success": False, "message": f"無法儲存資料: {str(e)}"}), 500

    return jsonify({"success": True, "message": "新增課程成功"})

@app.route('/get_courses')
def get_courses():
    domain = request.args.get('domain', '')
    valid_domains = ['語言', '天', '地', '人', '心']
    if domain not in valid_domains:
        return jsonify({"success": False, "message": "領域不合法", "courses": []}), 400

    filepath = os.path.join(DATA_DIR, f"{domain}.json")

    if not os.path.exists(filepath):
        # 若檔案不存在回空清單
        return jsonify({"success": True, "message": "尚無課程資料", "courses": []})

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            courses = json.load(f)
    except Exception as e:
        return jsonify({"success": False, "message": f"讀取檔案錯誤: {str(e)}", "courses": []}), 500

    return jsonify({"success": True, "message": "讀取成功", "courses": courses})

@app.route('/voice_search')
def voice_search():
    query = request.args.get('q', '').strip()
    if not query:
        return render_template('search_results.html', query=query, results=[])
    # 這裡可以加入你的搜尋邏輯
    results = []  # 假設搜尋結果
    return render_template('search_results.html', query=query, results=results)

@app.route('/m_general_knowledge')
def m_general_knowledge():
    course_name = request.args.get('course')
    if not course_name:
        return "未指定課程名稱", 400

    # 這裡你可載入該課程相關的留言和評分數據，或留給前端 AJAX 載入
    # 範例先只傳名稱
    return render_template('m_general_knowledge.html', course=course_name)

@app.route('/add_course_feedback', methods=['POST'])
def add_course_feedback():
    """
    接收 JSON 包含: course, rating, comment
    儲存或新增到該課程的 json 文件中
    """
    data = request.get_json()
    if not data:
        return jsonify(success=False, message='缺少 JSON 資料'), 400

    course = data.get('course')
    rating = data.get('rating')
    comment = data.get('comment')

    if not course or rating is None or comment is None:
        return jsonify(success=False, message='缺少課程名稱或評分或留言內容'), 400

    # 驗證評分是否合理1~5整數
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            return jsonify(success=False, message='評分必須介於1至5'), 400
    except ValueError:
        return jsonify(success=False, message='評分格式錯誤'), 400

    filepath = get_course_comment_filepath(course)

    # 讀取已有資料
    feedback_data = {'comments': [], 'ratings': []}
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                feedback_data = json.load(f)
                if not isinstance(feedback_data.get('comments'), list):
                    feedback_data['comments'] = []
                if not isinstance(feedback_data.get('ratings'), list):
                    feedback_data['ratings'] = []
        except Exception:
            feedback_data = {'comments': [], 'ratings': []}

    # 新增留言與評分
    feedback_data['comments'].append(str(comment))
    feedback_data['ratings'].append(rating)

    # 寫回檔案
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(feedback_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        return jsonify(success=False, message='寫入資料失敗'), 500

    return jsonify(success=True, message='評分與留言已儲存')

@app.route('/get_course_feedback', methods=['GET'])
def get_course_feedback():
    """
    根據 query string 的 course 名稱讀取留言與評分並回傳 JSON，
    只讀取 data/course_comment_data 資料夾中的 JSON 檔資料
    """
    course = request.args.get('course')
    if not course:
        return jsonify(success=False, message='缺少課程名稱參數'), 400

    # 只讀取 data/course_comment_data 的評分留言
    comment_filepath = get_course_comment_filepath(course)
    if not os.path.exists(comment_filepath):
        # 該課程無留言評分資料時，回傳空陣列
        return jsonify(success=True, comments=[], ratings=[])

    try:
        with open(comment_filepath, 'r', encoding='utf-8') as f:
            feedback_data = json.load(f)
            comments = feedback_data.get('comments', [])
            ratings = feedback_data.get('ratings', [])
            return jsonify(success=True, comments=comments, ratings=ratings)
    except Exception as e:
        return jsonify(success=False, message='讀取資料失敗'), 500

@app.route('/speech_translate')
def speech_translate():
    return render_template('speech_translate.html')

@app.route('/wave')
def wave():
    return render_template('wave.html')

@app.route('/check')
def check():
    return render_template('check.html')

@app.route('/vowels')
def vowels():
    return render_template('vowels.html')

@app.route('/wave2')
def wave2():
    return render_template('wave2.html')

@app.route('/cochlear')
def cochlear():
    return render_template('cochlear.html')

@app.route('/wave3')
def wave3():
    return render_template('wave3.html')

@app.route('/update_course_content', methods=['POST'])
def update_course_content():
    data = request.get_json()
    course_name = data.get("course_name")
    content = data.get("content")

    if not course_name or content is None:
        return jsonify(success=False, message="資料不完整"), 400

    # 建立資料夾路徑
    folder_path = os.path.join('data', 'content_data')
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    # 用課程名稱當檔名，不保證安全，必要時做轉換或限制
    filename = f"{course_name}.json"
    filepath = os.path.join(folder_path, filename)

    try:
        # 將課程介紹內容存成 JSON 格式
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({"content": content}, f, ensure_ascii=False, indent=2)
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, message=str(e)), 500

@app.route('/t_course')
def t_course():
    return render_template('t_course.html')

@app.route('/show_course_info/<course_name>')
def show_course_info(course_name):
    # JSON檔案路徑
    json_path = os.path.join('data', 'content_data', f'{course_name}.json')
    
    # 檢查檔案是否存在
    if not os.path.exists(json_path):
        return jsonify({"content": "此課程尚無儲存的介紹內容。"})
    
    # 讀取json內容
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            course_data = json.load(f)
        content = course_data.get('content', '')
        return jsonify({"content": content})
    except Exception as e:
        return jsonify({"content": f"讀取課程儲存介紹失敗：{str(e)}"})

@app.route('/two_tone')
def two_tone():
    return render_template('2tone.html')

@app.route('/wave4')
def wave4():
    return render_template('wave4.html')

# 登入頁
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = users_collection.find_one({"username": username})
        if user and check_password_hash(user["password"], password):
            session["username"] = user["username"]
            session['user_id'] = str(user['_id'])
            session['last_state'] = user.get('last_state', {})
            return redirect(url_for("index"))
        else:
            flash("帳號或密碼錯誤！")
            return redirect(url_for("login"))

    return render_template("login.html")

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


# 註冊頁
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        if users_collection.find_one({"username": username}):
            flash("使用者已存在！")
            return redirect(url_for("register"))

        hashed_password = generate_password_hash(password)

        users_collection.insert_one({
            "username": username,
            "password": hashed_password
        })

        flash("註冊成功！請登入")
        return redirect(url_for("login"))

    return render_template("register.html")

@app.route('/api/save_user_action', methods=['POST'])
def save_user_action():
    data = request.get_json()
    user_id = data.get('userId')
    action = data.get('action')

    if not user_id or not action:
        return jsonify({"error": "缺少 userId 或 action"}), 400

    # 先找是否已有該使用者的操作紀錄
    record = user_actions_collection.find_one({"userId": user_id})

    if record:
        actions = record.get('actions', [])
        actions.append(action)
        # 限制保留最大筆數
        if len(actions) > 20:
            actions = actions[-20:]
        user_actions_collection.update_one(
            {"userId": user_id},
            {"$set": {"actions": actions, "updatedAt": datetime.utcnow()}}
        )
    else:
        user_actions_collection.insert_one({
            "userId": user_id,
            "actions": [action],
            "updatedAt": datetime.utcnow()
        })

    return jsonify({"message": "操作儲存成功"})

@app.route('/api/get_user_actions/<user_id>', methods=['GET'])
def get_user_actions(user_id):
    record = user_actions_collection.find_one({"userId": user_id})
    if not record:
        return jsonify([])
    return jsonify(record.get('actions', []))

# 跳轉到留言回覆頁面
@app.route("/comment/<subject>/<time>")
def comment_comment(subject, time):
    return render_template("comment_comment.html", subject=subject, time=time)

# 留言回覆頁
@app.route('/comment_comment/<subject>')
def comment_comment_page(subject):
    comment_text = load_comment(subject)
    replies = load_replies(subject)
    return render_template(
        'comment_comment.html',
        subject=subject,
        comment_text=comment_text,
        replies=replies
    )

# 新增回覆
@app.route('/add_reply', methods=['POST'])
def add_reply():
    subject = request.form.get('subject')
    reply_text = request.form.get('reply_text', '').strip()
    print("subject:", subject)
    print("reply_text:", reply_text)

    if not subject  or not reply_text:
        return "資料不完整", 400

    replies = load_replies(subject)
    replies.append(reply_text)
    save_replies(subject, replies)

    return redirect(url_for('comment_comment_page', subject=subject))

@app.route('/comment/<course_name>/<time>')
def comments():
    course_name = request.args.get('course_name')
    encoded_time = request.args.get('time')  # 例如 "2025-08-29%2002:46:25"
    target_time = unquote(encoded_time)  # 轉換為 "2025-08-29 02:46:25"
    
    filepath = f"data/comment_data/{course_name}.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        comments = json.load(f)
    
    filtered_comments = [c for c in comments if c['time'] == target_time]

    return render_template('comment_comment.html', comments=filtered_comments)

@app.route('/teach')
def teach():
    return render_template('teach.html')

@app.route('/google7cbf2a4d23dab379.html')
def google_verify():
    # __file__ 是 app.py 的路徑，dirname 可取得目前專案根目錄
    return send_from_directory(os.path.dirname(__file__), 'google7cbf2a4d23dab379.html')
@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory(os.path.dirname(__file__), 'sitemap.xml')

@app.route('/notebooklm')
def notebooklm():
    return render_template('notebooklm.html')

print(app.url_map)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
