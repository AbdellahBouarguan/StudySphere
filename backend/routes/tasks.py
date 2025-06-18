from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from backend.app import db
from backend.models import Task

bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@bp.route('/add', methods=['POST'])
@login_required
def add_task():
    data = request.json
    task = Task(user_id=current_user.id, description=data.get('description'))
    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Task added'})

@bp.route('/list', methods=['GET'])
@login_required
def list_tasks():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': t.id, 'description': t.description, 'completed': t.completed} for t in tasks])

@bp.route('/complete/<int:task_id>', methods=['POST'])
@login_required
def complete_task(task_id):
    task = Task.query.get(task_id)
    if task and task.user_id == current_user.id:
        task.completed = True
        db.session.commit()
        return jsonify({'message': 'Task marked complete'})
    return jsonify({'error': 'Task not found'}), 404
