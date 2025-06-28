from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from backend.app import db
from backend.models import Group, GroupMember, User, StudySession

bp = Blueprint('groups', __name__, url_prefix='/api/groups')

@bp.route('/create', methods=['POST'])
@login_required
def create_group():
    data = request.json
    group_name = data.get('name')
    if Group.query.filter_by(name=group_name).first():
        return jsonify({'error': 'Group name already exists'}), 400
    group = Group(name=group_name)
    db.session.add(group)
    db.session.commit()
    member = GroupMember(group_id=group.id, user_id=current_user.id)
    db.session.add(member)
    db.session.commit()
    return jsonify({'message': 'Group created', 'group_id': group.id})

@bp.route('/join', methods=['POST'])
@login_required
def join_group():
    data = request.json
    group_id = data.get('group_id')
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    if GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first():
        return jsonify({'message': 'Already a member'})
    member = GroupMember(group_id=group_id, user_id=current_user.id)
    db.session.add(member)
    db.session.commit()
    return jsonify({'message': 'Joined group'})

@bp.route('/members/<int:group_id>', methods=['GET'])
@login_required
def group_members(group_id):
    members = GroupMember.query.filter_by(group_id=group_id).all()
    user_ids = [m.user_id for m in members]
    users = User.query.filter(User.id.in_(user_ids)).all()
    return jsonify([u.username for u in users])


@bp.route('/ranking/<int:group_id>', methods=['GET'])
@login_required
def group_ranking(group_id):
    members = GroupMember.query.filter_by(group_id=group_id).all()
    user_ids = [m.user_id for m in members]

    def parse_duration(duration_str):
        try:
            h, m, s = map(int, duration_str.split(':'))
            return h * 3600 + m * 60 + s
        except:
            return 0

    rankings = {}
    for user_id in user_ids:
        user = User.query.get(user_id)
        sessions = StudySession.query.filter_by(user_id=user_id).all()
        total = sum(parse_duration(s.duration) for s in sessions)
        rankings[user.username] = total

    sorted_rankings = dict(sorted(rankings.items(), key=lambda item: item[1], reverse=True))
    return jsonify(sorted_rankings)
