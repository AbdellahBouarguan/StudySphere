from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from backend.app import db
from backend.models import StudySession

bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')

@bp.route('/', methods=['GET'])
@login_required
def get_subjects():
    """Return the user's list of subjects."""
    return jsonify(current_user.subjects or [])


@bp.route('/create', methods=['POST'])
@login_required
def add_subject():
    """Add a new subject to the user's subject list."""
    data = request.json
    new_subject = data.get('subject')

    if not new_subject:
        return jsonify({'error': 'Subject name is required'}), 400

    subjects = current_user.subjects or []

    if new_subject in subjects:
        return jsonify({'error': 'Subject already exists'}), 400

    # Append and commit
    subjects.append(new_subject)
    current_user.subjects = subjects  # ensure assignment triggers tracking
    db.session.commit()

    return jsonify({'message': f'Subject "{new_subject}" added'}), 201


@bp.route('/delete', methods=['POST'])
@login_required
def delete_subject():
    """Delete a subject and all associated study sessions."""
    data = request.json
    subject = data.get('subject')

    if not subject:
        return jsonify({'error': 'Subject name is required'}), 400

    subjects = current_user.subjects or []

    if subject not in subjects:
        return jsonify({'error': 'Subject not found'}), 404

    # Remove subject from list
    subjects.remove(subject)
    current_user.subjects = subjects

    # Delete associated study sessions
    StudySession.query.filter_by(user_id=current_user.id, subject=subject).delete()

    db.session.commit()

    return jsonify({'message': f'Subject "{subject}" deleted.'}), 200
