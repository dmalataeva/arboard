// Main application entry point
import { BoardManager } from './board.js';
import { GraphRenderer } from './graph.js';
import { FileOperations } from './fileOps.js';

class ArboardApp {
    constructor() {
        this.currentTool = 'addNode';
        this.boardManager = new BoardManager(this);
        this.graphRenderer = new GraphRenderer(this);
        this.fileOps = new FileOperations(this);
        
        this.selectedElement = null;
        this.draggedNode = null;
        this.connectionStart = null;
        
        this.init();
    }

    init() {
        this.setupToolbar();
        this.setupTools();
        this.setupCanvas();
        this.setupModal();
        this.setupContextMenu();
        
        // Create initial board
        this.boardManager.createBoard('My First Board');
        
        // Load from localStorage if available
        this.loadFromLocalStorage();
    }

    setupToolbar() {
        // New Board
        document.getElementById('newBoardBtn').addEventListener('click', () => {
            const name = prompt('Enter board name:', 'New Board');
            if (name) {
                this.boardManager.createBoard(name);
            }
        });

        // Open File
        document.getElementById('openFileBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.fileOps.openFile(e);
        });

        // Save File
        document.getElementById('saveFileBtn').addEventListener('click', () => {
            this.fileOps.saveFile();
        });

        // Export Image
        document.getElementById('exportImageBtn').addEventListener('click', () => {
            this.fileOps.exportImage();
        });
    }

    setupTools() {
        const tools = ['addNodeBtn', 'addConnectionBtn', 'selectBtn', 'deleteBtn'];
        const toolMap = {
            'addNodeBtn': 'addNode',
            'addConnectionBtn': 'addConnection',
            'selectBtn': 'select',
            'deleteBtn': 'delete'
        };

        tools.forEach(toolId => {
            const btn = document.getElementById(toolId);
            btn.addEventListener('click', () => {
                this.setTool(toolMap[toolId]);
                tools.forEach(id => {
                    document.getElementById(id).classList.remove('active');
                });
                btn.classList.add('active');
            });
        });
    }

    setupCanvas() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        canvas.addEventListener('mousedown', (e) => {
            this.handleCanvasMouseDown(e);
        });

        canvas.addEventListener('mousemove', (e) => {
            this.handleCanvasMouseMove(e);
        });

        canvas.addEventListener('mouseup', (e) => {
            this.handleCanvasMouseUp(e);
        });

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleCanvasRightClick(e);
        });

        // Close context menu on click outside
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    setupModal() {
        const modal = document.getElementById('modal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('modalCancel');

        closeBtn.addEventListener('click', () => {
            this.hideModal();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    setupContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        
        contextMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.dataset.action;
            
            if (action === 'edit') {
                this.editSelectedElement();
            } else if (action === 'delete') {
                this.deleteSelectedElement();
            }
            
            this.hideContextMenu();
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        const canvas = document.getElementById('canvas');
        
        switch(tool) {
            case 'addNode':
                canvas.style.cursor = 'crosshair';
                break;
            case 'addConnection':
                canvas.style.cursor = 'crosshair';
                break;
            case 'select':
                canvas.style.cursor = 'default';
                break;
            case 'delete':
                canvas.style.cursor = 'not-allowed';
                break;
        }
    }

    handleCanvasClick(e) {
        if (e.target.id !== 'canvas') return;
        
        const board = this.boardManager.getCurrentBoard();
        if (!board) return;

        if (this.currentTool === 'addNode') {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.showNodeModal(null, x, y);
        }
    }

    handleCanvasMouseDown(e) {
        const board = this.boardManager.getCurrentBoard();
        if (!board) return;

        const target = e.target;
        
        if (target.classList.contains('node-circle')) {
            const nodeId = target.parentElement.dataset.nodeId;
            
            if (this.currentTool === 'select') {
                this.draggedNode = nodeId;
                this.selectElement('node', nodeId);
            } else if (this.currentTool === 'addConnection') {
                this.connectionStart = nodeId;
            } else if (this.currentTool === 'delete') {
                this.boardManager.deleteNode(nodeId);
                this.graphRenderer.render();
            }
        } else if (target.classList.contains('connection-line')) {
            const connectionId = target.parentElement.dataset.connectionId;
            
            if (this.currentTool === 'select') {
                this.selectElement('connection', connectionId);
            } else if (this.currentTool === 'delete') {
                this.boardManager.deleteConnection(connectionId);
                this.graphRenderer.render();
            }
        }
    }

    handleCanvasMouseMove(e) {
        if (this.draggedNode && this.currentTool === 'select') {
            const canvas = document.getElementById('canvas');
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.boardManager.updateNodePosition(this.draggedNode, x, y);
            this.graphRenderer.render();
        }
    }

    handleCanvasMouseUp(e) {
        if (this.currentTool === 'addConnection' && this.connectionStart) {
            const target = e.target;
            
            if (target.classList.contains('node-circle')) {
                const nodeId = target.parentElement.dataset.nodeId;
                
                if (nodeId !== this.connectionStart) {
                    this.showConnectionModal(this.connectionStart, nodeId);
                }
            }
            
            this.connectionStart = null;
        }
        
        this.draggedNode = null;
        this.saveToLocalStorage();
    }

    handleCanvasRightClick(e) {
        const target = e.target;
        
        if (target.classList.contains('node-circle')) {
            const nodeId = target.parentElement.dataset.nodeId;
            this.selectElement('node', nodeId);
            this.showContextMenu(e.clientX, e.clientY);
        } else if (target.classList.contains('connection-line')) {
            const connectionId = target.parentElement.dataset.connectionId;
            this.selectElement('connection', connectionId);
            this.showContextMenu(e.clientX, e.clientY);
        }
    }

    selectElement(type, id) {
        this.selectedElement = { type, id };
        this.graphRenderer.render();
        this.updatePropertiesPanel();
    }

    updatePropertiesPanel() {
        const panel = document.getElementById('propertiesPanel');
        
        if (!this.selectedElement) {
            panel.innerHTML = '<p class="empty-state">Select a node or connection to edit its properties</p>';
            return;
        }

        const board = this.boardManager.getCurrentBoard();
        if (!board) return;

        if (this.selectedElement.type === 'node') {
            const node = board.nodes.find(n => n.id === this.selectedElement.id);
            if (node) {
                panel.innerHTML = `
                    <div class="property-group">
                        <label class="property-label">Name</label>
                        <input type="text" class="property-input" id="propName" value="${node.name}">
                    </div>
                    <div class="property-group">
                        <label class="property-label">Notes</label>
                        <textarea class="property-input property-textarea" id="propNotes">${node.metadata?.notes || ''}</textarea>
                    </div>
                `;
                
                document.getElementById('propName').addEventListener('input', (e) => {
                    node.name = e.target.value;
                    this.graphRenderer.render();
                    this.saveToLocalStorage();
                });
                
                document.getElementById('propNotes').addEventListener('input', (e) => {
                    if (!node.metadata) node.metadata = {};
                    node.metadata.notes = e.target.value;
                    this.saveToLocalStorage();
                });
            }
        } else if (this.selectedElement.type === 'connection') {
            const connection = board.connections.find(c => c.id === this.selectedElement.id);
            if (connection) {
                const connectionType = connection.connectionType || 'unidirectional';
                panel.innerHTML = `
                    <div class="property-group">
                        <label class="property-label">Relationship Type</label>
                        <input type="text" class="property-input" id="propLabel" value="${connection.label || ''}">
                    </div>
                    <div class="property-group">
                        <label class="property-label">Connection Type</label>
                        <select class="property-input" id="propConnectionType">
                            <option value="unidirectional" ${connectionType === 'unidirectional' ? 'selected' : ''}>Unidirectional (→)</option>
                            <option value="bidirectional" ${connectionType === 'bidirectional' ? 'selected' : ''}>Bidirectional (↔)</option>
                        </select>
                    </div>
                    <div class="property-group">
                        <label class="property-label">Notes</label>
                        <textarea class="property-input property-textarea" id="propNotes">${connection.metadata?.notes || ''}</textarea>
                    </div>
                `;
                
                document.getElementById('propLabel').addEventListener('input', (e) => {
                    connection.label = e.target.value;
                    this.graphRenderer.render();
                    this.saveToLocalStorage();
                });
                
                document.getElementById('propConnectionType').addEventListener('change', (e) => {
                    connection.connectionType = e.target.value;
                    this.graphRenderer.render();
                    this.saveToLocalStorage();
                });
                
                document.getElementById('propNotes').addEventListener('input', (e) => {
                    if (!connection.metadata) connection.metadata = {};
                    connection.metadata.notes = e.target.value;
                    this.saveToLocalStorage();
                });
            }
        }
    }

    showNodeModal(nodeId = null, x = 0, y = 0) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const saveBtn = document.getElementById('modalSave');

        const board = this.boardManager.getCurrentBoard();
        if (!board) return;

        const existingNode = nodeId ? board.nodes.find(n => n.id === nodeId) : null;

        title.textContent = existingNode ? 'Edit Person' : 'Add Person';
        body.innerHTML = `
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" id="nodeName" value="${existingNode?.name || ''}" placeholder="Enter name">
            </div>
            <div class="form-group">
                <label class="form-label">Notes (optional)</label>
                <textarea class="form-input" id="nodeNotes" placeholder="Add notes...">${existingNode?.metadata?.notes || ''}</textarea>
            </div>
        `;

        modal.style.display = 'flex';

        // Focus on name input
        setTimeout(() => document.getElementById('nodeName').focus(), 100);

        saveBtn.onclick = () => {
            const name = document.getElementById('nodeName').value.trim();
            const notes = document.getElementById('nodeNotes').value.trim();

            if (!name) {
                alert('Please enter a name');
                return;
            }

            if (existingNode) {
                existingNode.name = name;
                if (!existingNode.metadata) existingNode.metadata = {};
                existingNode.metadata.notes = notes;
            } else {
                this.boardManager.addNode(name, x, y, { notes });
            }

            this.graphRenderer.render();
            this.hideModal();
            this.saveToLocalStorage();
        };
    }

    showConnectionModal(sourceId, targetId) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');
        const saveBtn = document.getElementById('modalSave');

        title.textContent = 'Add Connection';
        body.innerHTML = `
            <div class="form-group">
                <label class="form-label">Relationship Type</label>
                <input type="text" class="form-input" id="connectionLabel" placeholder="e.g., Friend, Parent, Sibling...">
            </div>
            <div class="form-group">
                <label class="form-label">Connection Type</label>
                <select class="form-input" id="connectionType">
                    <option value="unidirectional">Unidirectional (→)</option>
                    <option value="bidirectional">Bidirectional (↔)</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Notes (optional)</label>
                <textarea class="form-input" id="connectionNotes" placeholder="Add notes..."></textarea>
            </div>
        `;

        modal.style.display = 'flex';

        setTimeout(() => document.getElementById('connectionLabel').focus(), 100);

        saveBtn.onclick = () => {
            const label = document.getElementById('connectionLabel').value.trim();
            const notes = document.getElementById('connectionNotes').value.trim();
            const connectionType = document.getElementById('connectionType').value;

            this.boardManager.addConnection(sourceId, targetId, label, { notes }, connectionType);
            this.graphRenderer.render();
            this.hideModal();
            this.saveToLocalStorage();
        };
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
    }

    hideContextMenu() {
        document.getElementById('contextMenu').style.display = 'none';
    }

    hideModal() {
        document.getElementById('modal').style.display = 'none';
    }

    editSelectedElement() {
        if (!this.selectedElement) return;

        const board = this.boardManager.getCurrentBoard();
        if (!board) return;

        if (this.selectedElement.type === 'node') {
            const node = board.nodes.find(n => n.id === this.selectedElement.id);
            if (node) {
                this.showNodeModal(node.id, node.x, node.y);
            }
        } else if (this.selectedElement.type === 'connection') {
            const connection = board.connections.find(c => c.id === this.selectedElement.id);
            if (connection) {
                // For now, we'll show a simple prompt
                const label = prompt('Enter relationship type:', connection.label || '');
                if (label !== null) {
                    connection.label = label;
                    this.graphRenderer.render();
                    this.saveToLocalStorage();
                }
            }
        }
    }

    deleteSelectedElement() {
        if (!this.selectedElement) return;

        if (this.selectedElement.type === 'node') {
            this.boardManager.deleteNode(this.selectedElement.id);
        } else if (this.selectedElement.type === 'connection') {
            this.boardManager.deleteConnection(this.selectedElement.id);
        }

        this.selectedElement = null;
        this.graphRenderer.render();
        this.updatePropertiesPanel();
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        try {
            const data = this.boardManager.exportData();
            localStorage.setItem('arboard-data', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('arboard-data');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.boards && parsed.boards.length > 0) {
                    this.boardManager.importData(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.arboardApp = new ArboardApp();
});
