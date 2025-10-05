from flask import Flask, render_template, request, abort, redirect, url_for, flash, session
import urllib.parse
import os
import requests
import json
import pytz
import re
from flask import send_from_directory, jsonify
from urllib.parse import unquote
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

app = Flask(__name__)
app.secret_key = "your_super_secret_key_123"  # 換成你自己的隨機字串

DEEPSEEK_API_URL = "https://api.deepseek.com/v1/speech-to-text"  # 範例API端點，請以官方提供的為主
DEEPSEEK_API_KEY = "sk-fa5b93231839447e8965e3542119049a"

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

DATA_DIR = 'data/course_data'

VALID_FIELDS = {'語言', '天', '地', '人', '心'}  # 預設允許的領域

# === Discord Webhook URLs ===
VISITOR_DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399031760964026398/gAqAAb2ugQe67jjNFeBwhsNrfyb0S4t_pNqG2zI3whp_IBWuL1wtIW33qIfocBy5pi9"
APPOINTMENT_DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1399124589740560605/jcwCIWL5Ai0rzAnPYeTlZTDcFnZl_hc_spJmVWzCsxkpku78jgg9g0XmhrYfaFQ0ZZVX"

CATEGORIES = ['作業', '總複習', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八']
GRADES = ['大一', '大二', '大三']
SEMESTERS = ['上學期', '下學期']
EXPERIENCES = ['國際交流', '競賽成果', '實習心得', '其他經歷']

SERVICE_ACCOUNT_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/calendar']
CALENDAR_ID = 'fbee9e120b8cf6db5151fcda035b17afd8806a86ade2e839c225ad43fe93f65b@group.calendar.google.com'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)
calendar_service = build('calendar', 'v3', credentials=credentials)

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
    decoded_name = urllib.parse.unquote(course_name)
    content = courses.get(decoded_name)
    if not content:
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
        return redirect(url_for('course_detail', course_name=course_name))
    
    for category in CATEGORIES:
        cat_dir = os.path.join(app.config['UPLOAD_FOLDER'], course_name, category)
        if os.path.exists(cat_dir):
            uploaded_files[category] = os.listdir(cat_dir)

    return render_template('course_detail.html', title=course_name,
                           content=f"<p>{course_name} 的課程介紹。</p>",
                           categories=CATEGORIES,
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

def send_appointment_to_discord(appointments, name, phone, datetime_str):
    try:
        msg = f"📅 **新預約通知**\n- 姓名：{name}\n- 電話：{phone}\n- 時間：{datetime_str.replace('T', ' ')}\n\n**目前完整行事曆:**\n"
        for a in appointments:
            msg += f"- {a['datetime'].replace('T', ' ')}，姓名：{a['name']}，電話：{a['phone']}\n"
        requests.post(APPOINTMENT_DISCORD_WEBHOOK_URL, json={"content": msg})
    except Exception as e:
        print(f"Discord 預約 Webhook 發送錯誤: {e}")

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

    # 用課程名稱當檔名
    filename = f"{course_name}.json"
    filepath = os.path.join(folder_path, filename)

    try:
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
    json_path = os.path.join('data', 'content_data', f'{course_name}.json')
    if not os.path.exists(json_path):
        return jsonify({"content": "此課程尚無儲存的介紹內容。"})
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

# 跳轉到留言回覆頁面
@app.route("/comment/<subject>/<time>")
def comment_comment(subject, time):
    return render_template("comment_comment.html", subject=subject, time=time)

# 留言回覆頁
@app.route('/comment_comment/<subject>')
def comment_comment_page(subject):
    return render_template('comment_comment.html', subject=subject, comment_text=None, replies=None)

@app.route('/teach')
def teach():
    return render_template('teach.html')

print(app.url_map)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
