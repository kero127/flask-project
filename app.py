from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# إعداد قاعدة البيانات SQLite
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'tasks.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# تعريف جدول المهام
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    done = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {"id": self.id, "text": self.text, "done": self.done}

# إنشاء قاعدة البيانات عند تشغيل السيرفر
with app.app_context():
    db.create_all()

# صفحة الواجهة الأمامية
@app.route('/')
def index():
    return render_template('index.html')

# API - جلب كل المهام
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([t.to_dict() for t in tasks])

# API - إضافة مهمة جديدة
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    new_task = Task(text=data['text'], done=False)
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

# API - تعديل مهمة
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    task.text = data.get('text', task.text)
    task.done = data.get('done', task.done)
    db.session.commit()
    return jsonify(task.to_dict())

# API - حذف مهمة
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})

if __name__ == '__main__':
    # فقط للتشغيل المحلي، على Render سيتم تشغيله بواسطة gunicorn
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

