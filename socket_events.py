from flask_socketio import emit, join_room, leave_room
from flask_login import current_user
from flask import request
import json
import logging
from datetime import datetime

def register_socket_events(socketio):
    
    @socketio.on('connect')
    def handle_connect():
        if current_user.is_authenticated:
            logging.info(f'User {current_user.username} connected')
            emit('status', {'msg': f'Welcome {current_user.username}!'})
        else:
            logging.info('Anonymous user connected')
            emit('status', {'msg': 'Connected as guest'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        if current_user.is_authenticated:
            logging.info(f'User {current_user.username} disconnected')
        else:
            logging.info('Anonymous user disconnected')
    
    @socketio.on('join_collaboration')
    def handle_join_collaboration(data):
        room_id = data['room_id']
        tool_name = data['tool_name']
        
        join_room(room_id)
        
        if current_user.is_authenticated:
            username = current_user.username
        else:
            username = 'Anonymous'
        
        emit('user_joined', {
            'username': username,
            'tool_name': tool_name,
            'timestamp': datetime.utcnow().isoformat()
        }, room=room_id)
        
        logging.info(f'User {username} joined collaboration room {room_id} for tool {tool_name}')
    
    @socketio.on('leave_collaboration')
    def handle_leave_collaboration(data):
        room_id = data['room_id']
        tool_name = data['tool_name']
        
        leave_room(room_id)
        
        if current_user.is_authenticated:
            username = current_user.username
        else:
            username = 'Anonymous'
        
        emit('user_left', {
            'username': username,
            'tool_name': tool_name,
            'timestamp': datetime.utcnow().isoformat()
        }, room=room_id)
        
        logging.info(f'User {username} left collaboration room {room_id} for tool {tool_name}')
    
    @socketio.on('real_time_update')
    def handle_real_time_update(data):
        room_id = data['room_id']
        tool_name = data['tool_name']
        update_data = data['data']
        
        if current_user.is_authenticated:
            username = current_user.username
        else:
            username = 'Anonymous'
        
        emit('update_received', {
            'username': username,
            'tool_name': tool_name,
            'data': update_data,
            'timestamp': datetime.utcnow().isoformat()
        }, room=room_id)
        
        logging.info(f'Real-time update from {username} in room {room_id} for tool {tool_name}')
    
    @socketio.on('tool_progress')
    def handle_tool_progress(data):
        room_id = data.get('room_id')
        progress = data.get('progress', 0)
        message = data.get('message', '')
        
        if room_id:
            emit('progress_update', {
                'progress': progress,
                'message': message,
                'timestamp': datetime.utcnow().isoformat()
            }, room=room_id)
        else:
            emit('progress_update', {
                'progress': progress,
                'message': message,
                'timestamp': datetime.utcnow().isoformat()
            })
    
    @socketio.on('drag_update')
    def handle_drag_update(data):
        room_id = data['room_id']
        element_id = data['element_id']
        position = data['position']
        
        if current_user.is_authenticated:
            username = current_user.username
        else:
            username = 'Anonymous'
        
        emit('drag_sync', {
            'username': username,
            'element_id': element_id,
            'position': position,
            'timestamp': datetime.utcnow().isoformat()
        }, room=room_id)
    
    @socketio.on('live_chat')
    def handle_live_chat(data):
        room_id = data['room_id']
        message = data['message']
        
        if current_user.is_authenticated:
            username = current_user.username
            user_id = current_user.id
        else:
            username = 'Anonymous'
            user_id = None
        
        emit('chat_message', {
            'username': username,
            'user_id': user_id,
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }, room=room_id)
        
        logging.info(f'Chat message from {username} in room {room_id}: {message}')
