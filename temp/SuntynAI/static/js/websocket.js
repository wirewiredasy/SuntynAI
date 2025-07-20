// Suntyn AI - WebSocket Client
// Handles real-time communication and collaboration features

class WebSocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.currentRoom = null;
        this.collaborators = new Map();
        this.messageHandlers = new Map();
        this.init();
    }

    init() {
        // Enable WebSocket for real-time features
        console.log('🔌 WebSocket client initialized');
        
        try {
            if (typeof io !== 'undefined') {
                this.connect();
            } else {
                console.warn('Socket.IO not available, real-time features disabled');
                this.connected = false;
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.warn('WebSocket initialization failed:', error);
            this.connected = false;
            this.updateConnectionStatus(false);
        }
    }

    connect() {
        try {
            this.socket = io({
                transports: ['polling', 'websocket'],
                upgrade: true,
                rememberUpgrade: false,
                timeout: 20000,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                forceNew: true
            });

            this.setupEventHandlers();
            console.log('🔌 WebSocket client initialized');
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }

    setupEventHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            console.log('✅ WebSocket connected');
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.log('❌ WebSocket disconnected:', reason);
            this.updateConnectionStatus(false);
            
            if (reason === 'io server disconnect') {
                // Server disconnected, reconnect manually
                this.reconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.reconnect();
        });

        // Status events
        this.socket.on('status', (data) => {
            console.log('Status:', data.msg);
            if (window.app) {
                window.app.showNotification(data.msg, 'info', 3000);
            }
        });

        // Collaboration events
        this.socket.on('user_joined', (data) => {
            this.handleUserJoined(data);
        });

        this.socket.on('user_left', (data) => {
            this.handleUserLeft(data);
        });

        this.socket.on('update_received', (data) => {
            this.handleUpdateReceived(data);
        });

        this.socket.on('progress_update', (data) => {
            this.handleProgressUpdate(data);
        });

        this.socket.on('drag_sync', (data) => {
            this.handleDragSync(data);
        });

        this.socket.on('chat_message', (data) => {
            this.handleChatMessage(data);
        });

        // Custom message handler
        this.socket.on('custom_message', (data) => {
            this.handleCustomMessage(data);
        });
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.socket.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
            if (window.app) {
                window.app.showNotification('Connection lost. Please refresh the page.', 'error');
            }
        }
    }

    updateConnectionStatus(connected) {
        const statusIndicator = document.getElementById('connection-status');
        if (statusIndicator) {
            statusIndicator.className = connected ? 'text-success' : 'text-danger';
            statusIndicator.innerHTML = connected ? 
                '<i class="ti ti-wifi"></i> Connected' : 
                '<i class="ti ti-wifi-off"></i> Disconnected';
        }

        // Update collaboration UI
        const collaborationButton = document.querySelector('[onclick="toggleCollaboration()"]');
        if (collaborationButton) {
            collaborationButton.disabled = !connected;
            collaborationButton.classList.toggle('btn-secondary', !connected);
            collaborationButton.classList.toggle('btn-primary', connected);
        }
    }

    // Collaboration methods
    joinRoom(roomId, toolName) {
        if (!this.connected) {
            console.warn('Cannot join room: not connected');
            return;
        }

        this.currentRoom = roomId;
        this.socket.emit('join_collaboration', {
            room_id: roomId,
            tool_name: toolName
        });

        console.log(`🏠 Joined room: ${roomId} for tool: ${toolName}`);
    }

    leaveRoom(roomId, toolName) {
        if (!this.connected) return;

        this.socket.emit('leave_collaboration', {
            room_id: roomId,
            tool_name: toolName
        });

        this.currentRoom = null;
        this.collaborators.clear();
        console.log(`🚪 Left room: ${roomId}`);
    }

    sendUpdate(data) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('real_time_update', {
            room_id: this.currentRoom,
            tool_name: this.getCurrentToolName(),
            data: data
        });
    }

    sendProgress(progress, message) {
        if (!this.connected) return;

        this.socket.emit('tool_progress', {
            room_id: this.currentRoom,
            progress: progress,
            message: message
        });
    }

    sendDragUpdate(elementId, position) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('drag_update', {
            room_id: this.currentRoom,
            element_id: elementId,
            position: position
        });
    }

    sendChatMessage(message) {
        if (!this.connected || !this.currentRoom) return;

        this.socket.emit('live_chat', {
            room_id: this.currentRoom,
            message: message
        });
    }

    // Event handlers
    handleUserJoined(data) {
        this.collaborators.set(data.username, {
            username: data.username,
            joinedAt: data.timestamp,
            toolName: data.tool_name
        });

        this.updateCollaboratorsList();
        
        if (window.app) {
            window.app.showNotification(`${data.username} joined the session`, 'info', 3000);
        }
    }

    handleUserLeft(data) {
        this.collaborators.delete(data.username);
        this.updateCollaboratorsList();
        
        if (window.app) {
            window.app.showNotification(`${data.username} left the session`, 'info', 3000);
        }
    }

    handleUpdateReceived(data) {
        // Handle real-time updates from other users
        console.log('Update received:', data);
        
        // Dispatch custom event for tool-specific handling
        const event = new CustomEvent('collaborationUpdate', {
            detail: data
        });
        document.dispatchEvent(event);
    }

    handleProgressUpdate(data) {
        // Update progress indicators
        if (window.app) {
            window.app.showProgress(data.message, data.progress);
        }
    }

    handleDragSync(data) {
        // Sync drag operations
        const element = document.getElementById(data.element_id);
        if (element && data.username !== this.getCurrentUsername()) {
            element.style.left = data.position.x + 'px';
            element.style.top = data.position.y + 'px';
        }
    }

    handleChatMessage(data) {
        this.addChatMessage(data);
    }

    handleCustomMessage(data) {
        // Handle custom messages
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
            handler(data);
        }
    }

    // UI update methods
    updateCollaboratorsList() {
        const collaboratorsEl = document.getElementById('collaboration-users');
        if (!collaboratorsEl) return;

        if (this.collaborators.size === 0) {
            collaboratorsEl.innerHTML = '<div class="text-muted">No users connected</div>';
            return;
        }

        const collaboratorsList = Array.from(this.collaborators.values())
            .map(user => `
                <div class="d-flex align-items-center mb-2">
                    <div class="avatar-circle bg-primary text-white me-2">${user.username[0].toUpperCase()}</div>
                    <div class="flex-grow-1">
                        <div class="fw-medium">${user.username}</div>
                        <small class="text-muted">${user.toolName}</small>
                    </div>
                    <div class="status-indicator bg-success"></div>
                </div>
            `).join('');

        collaboratorsEl.innerHTML = collaboratorsList;
    }

    addChatMessage(data) {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message mb-2';
        messageEl.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="avatar-circle bg-primary text-white me-2">${data.username[0].toUpperCase()}</div>
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <strong class="me-2">${data.username}</strong>
                        <small class="text-muted">${this.formatTimestamp(data.timestamp)}</small>
                    </div>
                    <div class="message-content">${this.escapeHtml(data.message)}</div>
                </div>
            </div>
        `;

        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Utility methods
    getCurrentToolName() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1] || 'unknown';
    }

    getCurrentUsername() {
        // Get current user from global state or DOM
        const userElement = document.querySelector('[data-username]');
        return userElement?.dataset.username || 'Anonymous';
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Public API methods
    registerMessageHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }

    unregisterMessageHandler(type) {
        this.messageHandlers.delete(type);
    }

    isConnected() {
        return this.connected;
    }

    getCollaborators() {
        return Array.from(this.collaborators.values());
    }

    getCurrentRoom() {
        return this.currentRoom;
    }
}

// Global collaboration functions
function toggleCollaboration() {
    const panel = document.getElementById('collaboration-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

function joinRoom() {
    const roomId = document.getElementById('room-id').value.trim();
    if (!roomId) {
        if (window.app) {
            window.app.showNotification('Please enter a room ID', 'warning');
        }
        return;
    }

    const toolName = window.wsClient.getCurrentToolName();
    window.wsClient.joinRoom(roomId, toolName);
}

function createRoom() {
    const roomId = window.wsClient.generateRoomId();
    document.getElementById('room-id').value = roomId;
    joinRoom();
}

function leaveCurrentRoom() {
    if (window.wsClient.currentRoom) {
        const toolName = window.wsClient.getCurrentToolName();
        window.wsClient.leaveRoom(window.wsClient.currentRoom, toolName);
    }
}

// Initialize WebSocket client
const wsClient = new WebSocketClient();

// Export for global access
window.WebSocketClient = WebSocketClient;
window.wsClient = wsClient;
