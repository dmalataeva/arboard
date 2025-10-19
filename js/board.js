// Board management module
export class BoardManager {
    constructor(app) {
        this.app = app;
        this.boards = [];
        this.currentBoardId = null;
    }

    createBoard(name) {
        const board = {
            id: this.generateId(),
            name: name,
            nodes: [],
            connections: []
        };

        this.boards.push(board);
        this.switchBoard(board.id);
        this.renderBoardsList();
        return board;
    }

    switchBoard(boardId) {
        this.currentBoardId = boardId;
        this.renderBoardsList();
        this.app.graphRenderer.render();
        this.app.selectedElement = null;
        this.app.updatePropertiesPanel();
    }

    getCurrentBoard() {
        return this.boards.find(b => b.id === this.currentBoardId);
    }

    deleteBoard(boardId) {
        const index = this.boards.findIndex(b => b.id === boardId);
        if (index === -1) return;

        this.boards.splice(index, 1);

        // Switch to another board or create a new one
        if (this.currentBoardId === boardId) {
            if (this.boards.length > 0) {
                this.switchBoard(this.boards[0].id);
            } else {
                this.createBoard('My First Board');
            }
        }

        this.renderBoardsList();
    }

    renameBoard(boardId, newName) {
        const board = this.boards.find(b => b.id === boardId);
        if (board) {
            board.name = newName;
            this.renderBoardsList();
        }
    }

    renderBoardsList() {
        const boardsList = document.getElementById('boardsList');
        
        if (this.boards.length === 0) {
            boardsList.innerHTML = '<p class="empty-state">No boards yet</p>';
            return;
        }

        boardsList.innerHTML = this.boards.map(board => `
            <div class="board-item ${board.id === this.currentBoardId ? 'active' : ''}" data-board-id="${board.id}">
                <span class="board-item-name">${this.escapeHtml(board.name)}</span>
                <button class="board-item-delete" title="Delete board">×</button>
            </div>
        `).join('');

        // Add event listeners
        boardsList.querySelectorAll('.board-item').forEach(item => {
            const boardId = item.dataset.boardId;
            
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('board-item-delete')) {
                    this.switchBoard(boardId);
                }
            });

            item.addEventListener('dblclick', (e) => {
                if (!e.target.classList.contains('board-item-delete')) {
                    const board = this.boards.find(b => b.id === boardId);
                    const newName = prompt('Enter new board name:', board.name);
                    if (newName && newName.trim()) {
                        this.renameBoard(boardId, newName.trim());
                        this.app.saveToLocalStorage();
                    }
                }
            });

            const deleteBtn = item.querySelector('.board-item-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete board "${this.boards.find(b => b.id === boardId).name}"?`)) {
                    this.deleteBoard(boardId);
                    this.app.saveToLocalStorage();
                }
            });
        });
    }

    // Node operations
    addNode(name, x, y, metadata = {}) {
        const board = this.getCurrentBoard();
        if (!board) return null;

        const node = {
            id: this.generateId(),
            name: name,
            x: x,
            y: y,
            metadata: metadata
        };

        board.nodes.push(node);
        return node;
    }

    updateNodePosition(nodeId, x, y) {
        const board = this.getCurrentBoard();
        if (!board) return;

        const node = board.nodes.find(n => n.id === nodeId);
        if (node) {
            node.x = x;
            node.y = y;
        }
    }

    deleteNode(nodeId) {
        const board = this.getCurrentBoard();
        if (!board) return;

        // Remove the node
        const nodeIndex = board.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex !== -1) {
            board.nodes.splice(nodeIndex, 1);
        }

        // Remove all connections involving this node
        board.connections = board.connections.filter(
            c => c.source !== nodeId && c.target !== nodeId
        );
    }

    // Connection operations
    addConnection(sourceId, targetId, label = '', metadata = {}, connectionType = 'unidirectional') {
        const board = this.getCurrentBoard();
        if (!board) return null;

        // Check if connection already exists
        const exists = board.connections.some(
            c => (c.source === sourceId && c.target === targetId) ||
                 (c.source === targetId && c.target === sourceId)
        );

        if (exists) {
            alert('Connection already exists between these nodes');
            return null;
        }

        const connection = {
            id: this.generateId(),
            source: sourceId,
            target: targetId,
            label: label,
            connectionType: connectionType, // 'unidirectional' or 'bidirectional'
            metadata: metadata
        };

        board.connections.push(connection);
        return connection;
    }

    deleteConnection(connectionId) {
        const board = this.getCurrentBoard();
        if (!board) return;

        const index = board.connections.findIndex(c => c.id === connectionId);
        if (index !== -1) {
            board.connections.splice(index, 1);
        }
    }

    // Data export/import
    exportData() {
        return {
            version: '1.0',
            boards: this.boards,
            currentBoardId: this.currentBoardId
        };
    }

    importData(data) {
        if (data.boards) {
            this.boards = data.boards;
            
            if (data.currentBoardId && this.boards.find(b => b.id === data.currentBoardId)) {
                this.currentBoardId = data.currentBoardId;
            } else if (this.boards.length > 0) {
                this.currentBoardId = this.boards[0].id;
            }

            this.renderBoardsList();
            this.app.graphRenderer.render();
        }
    }

    // Utility functions
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
