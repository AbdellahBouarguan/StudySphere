from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from backend.app import db
from backend.models import StudySession
import datetime

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

def parse_duration(duration_str):
    """Parse 'HH:MM:SS' string to seconds."""
    h, m, s = map(int, duration_str.split(':'))
    return h * 3600 + m * 60 + s


@bp.route('/today', methods=['GET'])
@login_required
def get_today_study():
    # Reset day at 5 AM
    now = datetime.datetime.now(datetime.UTC)
    reset_time = datetime.datetime.combine(now.date(), datetime.time(5, 0))
    if now.time() < datetime.time(5, 0):
        reset_time = reset_time.replace(day=now.day - 1)
    sessions = StudySession.query.filter(
        StudySession.user_id == current_user.id,
        StudySession.timestamp >= reset_time
    ).all()
    result = {}
    for s in sessions:
        result[s.subject] = result.get(s.subject, 0) + parse_duration(s.duration)
        
    return jsonify(result)