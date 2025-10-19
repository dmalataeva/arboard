// Graph rendering module
export class GraphRenderer {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById('canvas');
        this.nodeRadius = 30;
    }

    render() {
        // Clear canvas
        this.canvas.innerHTML = '';

        const board = this.app.boardManager.getCurrentBoard();
        if (!board) return;

        // Create SVG groups for connections and nodes
        const connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        connectionsGroup.setAttribute('class', 'connections-group');
        
        const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodesGroup.setAttribute('class', 'nodes-group');

        // Render connections first (so they appear behind nodes)
        board.connections.forEach(connection => {
            this.renderConnection(connectionsGroup, connection, board);
        });

        // Render nodes
        board.nodes.forEach(node => {
            this.renderNode(nodesGroup, node);
        });

        // Append groups to canvas
        this.canvas.appendChild(connectionsGroup);
        this.canvas.appendChild(nodesGroup);
    }

    renderNode(container, node) {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'node');
        nodeGroup.setAttribute('data-node-id', node.id);

        // Check if selected
        const isSelected = this.app.selectedElement && 
                          this.app.selectedElement.type === 'node' && 
                          this.app.selectedElement.id === node.id;
        
        if (isSelected) {
            nodeGroup.classList.add('selected');
        }

        // Create circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', this.nodeRadius);

        // Create text label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5); // Center vertically
        text.textContent = this.truncateText(node.name, 10);

        // Add tooltip with full name if truncated
        if (node.name.length > 10) {
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = node.name;
            nodeGroup.appendChild(title);
        }

        nodeGroup.appendChild(circle);
        nodeGroup.appendChild(text);
        container.appendChild(nodeGroup);
    }

    renderConnection(container, connection, board) {
        const sourceNode = board.nodes.find(n => n.id === connection.source);
        const targetNode = board.nodes.find(n => n.id === connection.target);

        if (!sourceNode || !targetNode) return;

        const connectionGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        connectionGroup.setAttribute('class', 'connection');
        connectionGroup.setAttribute('data-connection-id', connection.id);

        // Check if selected
        const isSelected = this.app.selectedElement && 
                          this.app.selectedElement.type === 'connection' && 
                          this.app.selectedElement.id === connection.id;
        
        if (isSelected) {
            connectionGroup.classList.add('selected');
        }

        // Calculate line endpoints (on the edge of circles, not center)
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
        
        const x1 = sourceNode.x + this.nodeRadius * Math.cos(angle);
        const y1 = sourceNode.y + this.nodeRadius * Math.sin(angle);
        const x2 = targetNode.x - this.nodeRadius * Math.cos(angle);
        const y2 = targetNode.y - this.nodeRadius * Math.sin(angle);

        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'connection-line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);

        // Add visual indicators based on connection type
        const connectionType = connection.connectionType || 'unidirectional';
        
        if (connectionType === 'bidirectional') {
            // For bidirectional connections, add arrows at both ends
            const markerId1 = `arrow-start-${connection.id}`;
            const markerId2 = `arrow-end-${connection.id}`;
            this.createArrowMarker(markerId1);
            this.createArrowMarker(markerId2);
            line.setAttribute('marker-start', `url(#${markerId1})`);
            line.setAttribute('marker-end', `url(#${markerId2})`);
            line.setAttribute('stroke-dasharray', '5,5'); // Dashed line for bidirectional
        } else {
            // For unidirectional connections, add arrow only at the end
            const markerId = `arrow-${connection.id}`;
            this.createArrowMarker(markerId);
            line.setAttribute('marker-end', `url(#${markerId})`);
        }

        connectionGroup.appendChild(line);

        // Add label if exists
        if (connection.label) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            // Create background rectangle for label
            const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const labelText = this.truncateText(connection.label, 15);
            const textWidth = labelText.length * 7; // Approximate width
            const textHeight = 18;

            labelBg.setAttribute('x', midX - textWidth / 2 - 4);
            labelBg.setAttribute('y', midY - textHeight / 2 - 2);
            labelBg.setAttribute('width', textWidth + 8);
            labelBg.setAttribute('height', textHeight + 4);
            labelBg.setAttribute('fill', 'white');
            labelBg.setAttribute('stroke', '#95A5A6');
            labelBg.setAttribute('stroke-width', '1');
            labelBg.setAttribute('rx', '3');

            // Create text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'connection-label');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY + 5);
            text.textContent = labelText;

            connectionGroup.appendChild(labelBg);
            connectionGroup.appendChild(text);

            // Add tooltip with full label if truncated
            if (connection.label.length > 15) {
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = connection.label;
                connectionGroup.appendChild(title);
            }
        }

        container.appendChild(connectionGroup);
    }

    createArrowMarker(id) {
        // Check if marker already exists
        if (document.getElementById(id)) return;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        
        marker.setAttribute('id', id);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        path.setAttribute('fill', '#95A5A6');

        marker.appendChild(path);
        defs.appendChild(marker);
        this.canvas.appendChild(defs);
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 1) + '…';
    }

    // Export canvas as image
    getSVGString() {
        const svg = this.canvas.cloneNode(true);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Get canvas dimensions
        const rect = this.canvas.getBoundingClientRect();
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);

        // Convert SVG to string
        const serializer = new XMLSerializer();
        return serializer.serializeToString(svg);
    }

    downloadSVG(filename) {
        const svgString = this.getSVGString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Convert SVG to PNG
    exportAsPNG(filename) {
        const svgString = this.getSVGString();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const rect = this.canvas.getBoundingClientRect();
        canvas.width = rect.width * 2; // 2x for better quality
        canvas.height = rect.height * 2;

        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
}
