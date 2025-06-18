from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from backend.app import db
from backend.models import StudySession
from datetime import datetime, time

bp = Blueprint('study', __name__, url_prefix='/api/study')

@bp.route('/add', methods=['POST'])
@login_required
def add_study_session():
    data = request.json
    subject = data.get('subject')
    duration = data.get('duration')
    session = StudySession(user_id=current_user.id, subject=subject, duration=duration)
    db.session.add(session)
    db.session.commit()
    return jsonify({'message': 'Study session added'})

@bp.route('/today', methods=['GET'])
@login_required
def get_today_study():
    # Reset day at 5 AM
    now = datetime.utcnow()
    reset_time = datetime.combine(now.date(), time(5, 0))
    if now.time() < time(5, 0):
        reset_time = reset_time.replace(day=now.day - 1)
    sessions = StudySession.query.filter(
        StudySession.user_id == current_user.id,
        StudySession.timestamp >= reset_time
    ).all()
    result = {}
    for s in sessions:
        result[s.subject] = result.get(s.subject, 0) + s.duration
    return jsonify(result)
