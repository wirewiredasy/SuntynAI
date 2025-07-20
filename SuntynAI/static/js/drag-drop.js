// Suntyn AI - Drag and Drop Functionality
// Handles drag-and-drop operations with real-time synchronization

class DragDropManager {
    constructor() {
        this.sortableInstances = new Map();
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.collaborativeMode = false;
        this.init();
    }

    init() {
        this.initializeSortableLists();
        this.initializeDragDropZones();
        this.initializeFileDropZones();
        this.setupGlobalDragHandlers();
        console.log('🔄 Drag and drop manager initialized');
    }

    initializeSortableLists() {
        // Initialize sortable lists using SortableJS
        if (typeof Sortable === 'undefined') {
            console.warn('SortableJS not available, sortable features disabled');
            return;
        }

        document.querySelectorAll('.sortable-list').forEach(list => {
            this.createSortableInstance(list);
        });

        // Initialize PDF merger file list
        const pdfFilesList = document.getElementById('files-list');
        if (pdfFilesList) {
            this.createSortableInstance(pdfFilesList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                onStart: (evt) => this.handleSortStart(evt),
                onEnd: (evt) => this.handleSortEnd(evt),
                onMove: (evt) => this.handleSortMove(evt)
            });
        }
    }

    createSortableInstance(element, options = {}) {
        const defaultOptions = {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onStart: (evt) => this.handleSortStart(evt),
            onEnd: (evt) => this.handleSortEnd(evt),
            onMove: (evt) => this.handleSortMove(evt),
            onAdd: (evt) => this.handleSortAdd(evt),
            onRemove: (evt) => this.handleSortRemove(evt),
            onUpdate: (evt) => this.handleSortUpdate(evt)
        };

        const sortable = Sortable.create(element, { ...defaultOptions, ...options });
        this.sortableInstances.set(element, sortable);
        return sortable;
    }

    initializeDragDropZones() {
        // Initialize general drag-drop zones
        document.querySelectorAll('.drag-drop-zone').forEach(zone => {
            this.setupDragDropZone(zone);
        });
    }

    setupDragDropZone(zone) {
        zone.addEventListener('dragover', (e) => this.handleDragOver(e, zone));
        zone.addEventListener('dragenter', (e) => this.handleDragEnter(e, zone));
        zone.addEventListener('dragleave', (e) => this.handleDragLeave(e, zone));
        zone.addEventListener('drop', (e) => this.handleDrop(e, zone));
    }

    initializeFileDropZones() {
        // File-specific drag and drop
        document.querySelectorAll('input[type="file"]').forEach(input => {
            const zone = input.closest('.drag-drop-zone');
            if (zone) {
                this.setupFileDropZone(zone, input);
            }
        });
    }

    setupFileDropZone(zone, input) {
        zone.addEventListener('click', (e) => {
            if (e.target === zone || e.target.closest('.btn')) {
                input.click();
            }
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('dragover');
            }
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.handleFilesDrop(files, input, zone);
        });
    }

    setupGlobalDragHandlers() {
        // Global drag handlers for custom draggable elements
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                this.startDrag(e, e.target);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.endDrag();
            }
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                this.startDrag(e.touches[0], e.target);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.handleDrag(e.touches[0]);
            }
        });

        document.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.endDrag();
            }
        });
    }

    // Sortable event handlers
    handleSortStart(evt) {
        evt.item.classList.add('sortable-dragging');
        this.isDragging = true;
        
        // Notify WebSocket about drag start
        if (this.collaborativeMode && window.wsClient) {
            window.wsClient.sendDragUpdate(evt.item.id, {
                action: 'start',
                index: evt.oldIndex
            });
        }
    }

    handleSortEnd(evt) {
        evt.item.classList.remove('sortable-dragging');
        this.isDragging = false;
        
        // Handle reordering
        if (evt.oldIndex !== evt.newIndex) {
            this.handleReorder(evt);
        }
        
        // Notify WebSocket about drag end
        if (this.collaborativeMode && window.wsClient) {
            window.wsClient.sendDragUpdate(evt.item.id, {
                action: 'end',
                oldIndex: evt.oldIndex,
                newIndex: evt.newIndex
            });
        }
    }

    handleSortMove(evt) {
        // Handle move validation
        return true; // Allow move
    }

    handleSortAdd(evt) {
        // Handle item added to list
        console.log('Item added to list:', evt.item);
    }

    handleSortRemove(evt) {
        // Handle item removed from list
        console.log('Item removed from list:', evt.item);
    }

    handleSortUpdate(evt) {
        // Handle list update
        this.updateListState(evt.from);
    }

    // Drag and drop event handlers
    handleDragOver(e, zone) {
        e.preventDefault();
        zone.classList.add('dragover');
    }

    handleDragEnter(e, zone) {
        e.preventDefault();
        zone.classList.add('dragover');
    }

    handleDragLeave(e, zone) {
        e.preventDefault();
        if (!zone.contains(e.relatedTarget)) {
            zone.classList.remove('dragover');
        }
    }

    handleDrop(e, zone) {
        e.preventDefault();
        zone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const input = zone.querySelector('input[type="file"]');
            if (input) {
                this.handleFilesDrop(files, input, zone);
            }
        }
    }

    // File handling
    handleFilesDrop(files, input, zone) {
        if (files.length === 0) return;

        // Validate file types
        const acceptedTypes = input.accept ? input.accept.split(',') : [];
        const validFiles = files.filter(file => this.isValidFileType(file, acceptedTypes));

        if (validFiles.length !== files.length) {
            const invalidCount = files.length - validFiles.length;
            if (window.app) {
                window.app.showNotification(`${invalidCount} file(s) were rejected due to invalid type`, 'warning');
            }
        }

        if (validFiles.length === 0) return;

        // Handle multiple files
        if (input.multiple) {
            this.setInputFiles(input, validFiles);
        } else {
            this.setInputFiles(input, [validFiles[0]]);
            if (validFiles.length > 1) {
                if (window.app) {
                    window.app.showNotification('Only one file is allowed', 'warning');
                }
            }
        }

        // Update UI
        this.updateFilePreview(validFiles, zone);
        
        // Trigger change event
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    isValidFileType(file, acceptedTypes) {
        if (acceptedTypes.length === 0) return true;
        
        return acceptedTypes.some(type => {
            type = type.trim();
            if (type.startsWith('.')) {
                return file.name.toLowerCase().endsWith(type.toLowerCase());
            } else if (type.includes('/')) {
                return file.type === type;
            } else if (type.includes('*')) {
                const baseType = type.split('/')[0];
                return file.type.startsWith(baseType);
            }
            return false;
        });
    }

    setInputFiles(input, files) {
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        input.files = dt.files;
    }

    updateFilePreview(files, zone) {
        let previewContainer = zone.querySelector('.file-preview');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'file-preview mt-3';
            zone.appendChild(previewContainer);
        }

        previewContainer.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = this.createFilePreviewItem(file, index);
            previewContainer.appendChild(fileItem);
        });
    }

    createFilePreviewItem(file, index) {
        const item = document.createElement('div');
        item.className = 'file-preview-item d-flex align-items-center justify-content-between p-2 bg-light rounded mb-2';
        item.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="ti ti-${this.getFileIcon(file.type)} me-2"></i>
                <div>
                    <div class="fw-medium">${file.name}</div>
                    <small class="text-muted">${this.formatFileSize(file.size)}</small>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('.file-preview-item').remove()">
                <i class="ti ti-x"></i>
            </button>
        `;
        return item;
    }

    getFileIcon(mimeType) {
        const iconMap = {
            'application/pdf': 'file-type-pdf',
            'image/': 'photo',
            'video/': 'video',
            'audio/': 'music',
            'text/': 'file-text',
            'application/zip': 'file-zip',
            'application/x-zip-compressed': 'file-zip'
        };

        for (const [type, icon] of Object.entries(iconMap)) {
            if (mimeType.startsWith(type)) {
                return icon;
            }
        }
        return 'file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Custom drag handlers
    startDrag(event, element) {
        this.isDragging = true;
        this.draggedElement = element;
        
        const rect = element.getBoundingClientRect();
        this.dragOffset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        element.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
    }

    handleDrag(event) {
        if (!this.isDragging || !this.draggedElement) return;
        
        const x = event.clientX - this.dragOffset.x;
        const y = event.clientY - this.dragOffset.y;
        
        this.draggedElement.style.position = 'fixed';
        this.draggedElement.style.left = x + 'px';
        this.draggedElement.style.top = y + 'px';
        this.draggedElement.style.zIndex = '9999';
        
        // Notify WebSocket about drag position
        if (this.collaborativeMode && window.wsClient) {
            window.wsClient.sendDragUpdate(this.draggedElement.id, { x, y });
        }
    }

    endDrag() {
        if (!this.isDragging || !this.draggedElement) return;
        
        this.isDragging = false;
        this.draggedElement.classList.remove('dragging');
        this.draggedElement.style.position = '';
        this.draggedElement.style.left = '';
        this.draggedElement.style.top = '';
        this.draggedElement.style.zIndex = '';
        
        document.body.style.cursor = '';
        this.draggedElement = null;
    }

    // Utility methods
    handleReorder(evt) {
        const list = evt.from;
        const items = Array.from(list.children);
        
        // Update data attributes or IDs
        items.forEach((item, index) => {
            item.dataset.index = index;
        });
        
        // Trigger reorder event
        const reorderEvent = new CustomEvent('itemReorder', {
            detail: {
                oldIndex: evt.oldIndex,
                newIndex: evt.newIndex,
                item: evt.item,
                list: list
            }
        });
        document.dispatchEvent(reorderEvent);
    }

    updateListState(list) {
        const items = Array.from(list.children);
        const state = items.map(item => ({
            id: item.id,
            content: item.textContent.trim(),
            position: Array.from(list.children).indexOf(item)
        }));
        
        // Store state for persistence
        list.dataset.state = JSON.stringify(state);
    }

    // Public API
    enableCollaborativeMode() {
        this.collaborativeMode = true;
        console.log('Collaborative drag and drop enabled');
    }

    disableCollaborativeMode() {
        this.collaborativeMode = false;
        console.log('Collaborative drag and drop disabled');
    }

    destroySortable(element) {
        const sortable = this.sortableInstances.get(element);
        if (sortable) {
            sortable.destroy();
            this.sortableInstances.delete(element);
        }
    }

    createSortable(element, options = {}) {
        return this.createSortableInstance(element, options);
    }

    getSortableInstance(element) {
        return this.sortableInstances.get(element);
    }

    getAllSortableInstances() {
        return Array.from(this.sortableInstances.values());
    }
}

// Initialize drag and drop manager
const dragDropManager = new DragDropManager();

// Export for global access
window.DragDropManager = DragDropManager;
window.dragDropManager = dragDropManager;
