from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__, static_folder='.', static_url_path='')
DATA_FILE = 'data.json'

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/codes', methods=['GET'])
def get_codes():
    data = load_data()
    return jsonify(data)

@app.route('/api/codes', methods=['POST'])
def add_code():
    new_code = request.json
    if not new_code or 'title' not in new_code or 'code' not in new_code:
        return jsonify({'error': 'Invalid data'}), 400
    
    data = load_data()
    # Add a simple ID
    new_code['id'] = len(data) + 1
    data.append(new_code)
    save_data(data)
    return jsonify(new_code), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
