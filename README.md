# Arboard - Relationship Mapping Web App

A powerful web-based application for mapping and visualizing human relationships. Create interactive graphs with nodes representing people and connections representing their relationships.

![Arboard Interface](https://img.shields.io/badge/Status-Ready-green)

## Features

### 🎯 Core Features
- **Multiple Boards**: Create and manage multiple relationship boards
- **Interactive Nodes**: Add, edit, move, and delete person nodes
- **Relationship Connections**: Connect people with labeled relationships
- **Connection Types**: Choose between unidirectional (→) and bidirectional (↔) connections
- **Drag & Drop**: Intuitive drag-and-drop interface for repositioning nodes
- **Properties Panel**: Edit details for selected nodes and connections
- **Context Menus**: Right-click for quick access to edit and delete options

### 💾 File Management
- **Save/Load**: Save boards as `.arb` files and reload them later
- **Auto-save**: Automatic saving to browser localStorage
- **Export**: Export boards as PNG images
- **JSON Format**: Human-readable JSON file format for easy editing

### 🎨 User Interface
- **Clean Design**: Modern, intuitive interface with dark sidebar theme
- **Tool Selection**: Multiple tools for different operations
- **Visual Feedback**: Selected elements are highlighted
- **Responsive Canvas**: Grid-based canvas with smooth interactions

## Getting Started

### Option 1: Using npm (Recommended)

For the best development experience, use the included npm server:

```bash
# Clone the repository
git clone https://github.com/yourusername/arboard.git

# Navigate to the directory
cd arboard

# Install dependencies
npm install

# Start the development server
npm start
```

The server will automatically open your browser to `http://localhost:3000`.

**Available npm scripts:**
- `npm start` - Start server on port 3000 and open browser
- `npm run dev` - Start server with disabled caching (for development)
- `npm run serve` - Start server on port 8080

### Option 2: Direct Browser Access

No installation required! Simply open `index.html` in a modern web browser.

```bash
# Clone the repository
git clone https://github.com/yourusername/arboard.git

# Navigate to the directory
cd arboard

# Open in browser
open index.html
```

### Browser Requirements
- Modern web browser with ES6 module support
- Chrome, Firefox, Safari, or Edge (latest versions)
- JavaScript must be enabled

## How to Use

### Creating Your First Board

1. **Launch the App**: Open `index.html` in your browser
2. The app starts with a default board called "My First Board"
3. The canvas is ready for you to start adding people

### Adding People (Nodes)

1. **Select the "Add Person" tool** (default tool, shown with 👤 icon)
2. **Click anywhere on the canvas** where you want to place a person
3. **Enter the person's name** in the dialog that appears
4. Optionally add notes about the person
5. Click "Save" to create the node

### Creating Connections

1. **Select the "Connect" tool** (🔗 icon in the left sidebar)
2. **Click on the first person** (source node)
3. **Click on the second person** (target node)
4. **Enter the relationship type** (e.g., "Friend", "Parent", "Sibling")
5. **Choose connection type**:
   - **Unidirectional (→)**: One-way relationship (e.g., "Parent of", "Manager of")
   - **Bidirectional (↔)**: Two-way relationship (e.g., "Friend", "Sibling", "Colleague")
6. Optionally add notes about the relationship
7. Click "Save" to create the connection

### Moving Nodes

1. **Select the "Select" tool** (👆 icon in the left sidebar)
2. **Click and drag any node** to reposition it
3. Connections automatically update to follow the nodes

### Editing Elements

**Method 1: Right-Click**
- Right-click on any node or connection
- Select "Edit" from the context menu

**Method 2: Properties Panel**
- Select the "Select" tool
- Click on a node or connection
- Edit properties in the right sidebar panel

### Deleting Elements

**Method 1: Delete Tool**
- Select the "Delete" tool (🗑️ icon)
- Click on any node or connection to delete it

**Method 2: Context Menu**
- Right-click on any node or connection
- Select "Delete" from the context menu

### Managing Multiple Boards

**Create New Board:**
- Click "New Board" in the top toolbar
- Enter a name for the new board

**Switch Between Boards:**
- Click on any board name in the left sidebar

**Rename Board:**
- Double-click on a board name in the left sidebar
- Enter the new name

**Delete Board:**
- Hover over a board name in the left sidebar
- Click the "×" button that appears

### Saving and Loading

**Save to File:**
1. Click the "Save" button (💾) in the top toolbar
2. Choose a location to save the `.arb` file
3. The file contains all your boards and data

**Load from File:**
1. Click the "Open" button (📁) in the top toolbar
2. Select an `.arb` file to load
3. All boards from the file will be imported

**Auto-save:**
- Your work is automatically saved to browser localStorage
- Data persists between sessions
- No manual saving required for local work

**Export as Image:**
1. Click the "Export" button (🖼️) in the top toolbar
2. The current board will be exported as a PNG image

## File Format

Arboard uses a simple JSON format (`.arb` extension) for easy interoperability:

```json
{
  "version": "1.0",
  "boards": [
    {
      "id": "unique-id",
      "name": "Board Name",
      "nodes": [
        {
          "id": "node-id",
          "name": "Person Name",
          "x": 100,
          "y": 150,
          "metadata": {
            "notes": "Optional notes"
          }
        }
      ],
      "connections": [
        {
          "id": "connection-id",
          "source": "source-node-id",
          "target": "target-node-id",
          "label": "Relationship Type",
          "connectionType": "unidirectional",
          "metadata": {
            "notes": "Optional notes"
          }
        }
      ]
    }
  ],
  "currentBoardId": "active-board-id"
}
```

## Keyboard Shortcuts

Currently, the app uses mouse/click interactions. Keyboard shortcuts may be added in future versions.

## Tips and Tricks

1. **Organize Your Layout**: Arrange nodes in a logical pattern (e.g., family tree, social circles)
2. **Use Descriptive Labels**: Clear relationship labels make graphs easier to understand
3. **Add Notes**: Use the notes field to store additional information about people or relationships
4. **Multiple Boards**: Separate different social circles or contexts into different boards
5. **Regular Saves**: Save your work to files periodically for backup
6. **Export Images**: Share your relationship maps by exporting as PNG

## Technical Details

### Architecture
- **Pure JavaScript**: No frameworks or build tools required
- **ES6 Modules**: Modern modular architecture
- **SVG Rendering**: Scalable vector graphics for crisp visuals
- **Local Storage**: Browser-based persistence

### File Structure
```
arboard/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application logic
│   ├── board.js        # Board management
│   ├── graph.js        # Graph rendering
│   └── fileOps.js      # File operations
├── LICENSE             # MIT License
└── README.md           # This file
```

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## Privacy & Data

- **100% Client-Side**: All processing happens in your browser
- **No Server**: No data is sent to any server
- **Local Storage**: Data saved only in your browser's localStorage
- **File-Based**: Complete control over your data files

## Future Enhancements

Potential features for future versions:
- Undo/Redo functionality
- Keyboard shortcuts
- Node colors and shapes
- Search and filter
- Zoom and pan controls
- Multiple connection types (visual styles)
- Import from CSV/Excel
- Collaboration features
- Mobile touch support
- Dark/Light theme toggle

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation above

## Acknowledgments

Built with modern web technologies and inspired by tools like draw.io and similar diagramming applications.

---

**Arboard** - Map your world, visualize your connections.
