
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'admin-panel/discount-panel.html');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '<script src="discount-service.js"></script>';
const endMarker = '</body>';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.log("Start marker not found!");
    process.exit(1);
}

const endIndex = content.lastIndexOf(endMarker);
if (endIndex === -1) {
    console.log("End marker not found!");
    process.exit(1);
}

const newScripts = `
  <script type="module" src="discount-service.js"></script>
  <script type="module" src="discount-panel-app.js"></script>
`;

const newContent = content.slice(0, startIndex) + newScripts + content.slice(endIndex);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully replaced scripts!");
