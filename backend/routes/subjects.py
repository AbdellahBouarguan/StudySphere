from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from backend.app import db

bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')

@bp.route('/', methods=['GET'])
@login_required
def get_subjects():
    return jsonify(current_user.subjects or [])

@bp.route('/create', methods=['POST'])
@login_required
def add_subject():
    data = request.json
    new_subject = data.get('subject')

    if not new_subject:
        return jsonify({'error': 'Subject name is required'}), 400

    if new_subject in (current_user.subjects or []):
        return jsonify({'error': 'Subject already exists'}), 400

    # Initialize the list if empty
    if not current_user.subjects:
        current_user.subjects = []

    current_user.subjects.append(new_subject)
    db.session.commit()

    return jsonify({'message': f'Subject "{new_subject}" added'})
