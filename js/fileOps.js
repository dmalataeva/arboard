// File operations module
export class FileOperations {
    constructor(app) {
        this.app = app;
    }

    saveFile() {
        const data = this.app.boardManager.exportData();
        const board = this.app.boardManager.getCurrentBoard();
        
        // Generate filename based on current board name
        const filename = this.sanitizeFilename(board ? board.name : 'arboard') + '.arb';
        
        // Convert to JSON string
        const jsonString = JSON.stringify(data, null, 2);
        
        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('File saved:', filename);
    }

    openFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.boards || !Array.isArray(data.boards)) {
                    throw new Error('Invalid file format: missing boards array');
                }

                // Import data
                this.app.boardManager.importData(data);
                
                // Save to localStorage for auto-save
                this.app.saveToLocalStorage();
                
                console.log('File loaded successfully');
                alert('File loaded successfully!');
                
            } catch (error) {
                console.error('Error loading file:', error);
                alert('Error loading file: ' + error.message);
            }
        };

        reader.onerror = () => {
            alert('Error reading file');
        };

        reader.readAsText(file);
        
        // Reset file input so the same file can be loaded again
        event.target.value = '';
    }

    exportImage() {
        const board = this.app.boardManager.getCurrentBoard();
        if (!board) {
            alert('No board to export');
            return;
        }

        // Generate filename
        const filename = this.sanitizeFilename(board.name) + '.png';
        
        // Export as PNG
        this.app.graphRenderer.exportAsPNG(filename);
        
        console.log('Image exported:', filename);
    }

    exportSVG() {
        const board = this.app.boardManager.getCurrentBoard();
        if (!board) {
            alert('No board to export');
            return;
        }

        // Generate filename
        const filename = this.sanitizeFilename(board.name) + '.svg';
        
        // Export as SVG
        this.app.graphRenderer.downloadSVG(filename);
        
        console.log('SVG exported:', filename);
    }

    sanitizeFilename(name) {
        // Remove invalid filename characters
        return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
    }

    // Auto-save functionality
    enableAutoSave(intervalMs = 30000) {
        setInterval(() => {
            this.app.saveToLocalStorage();
        }, intervalMs);
    }
}
