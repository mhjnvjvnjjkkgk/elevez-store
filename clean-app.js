
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(process.cwd(), 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Define the start and end markers of the block to remove
const startMarker = "  // Detect when section is centered in viewport";
const endMarker = "  }, []);";

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.log("Start marker not found!");
    process.exit(1);
}

// Find the end marker AFTER the start index
const endIndex = content.indexOf(endMarker, startIndex);
if (endIndex === -1) {
    console.log("End marker not found!");
    process.exit(1);
}

// Extract the text to be removed to verify
const textToRemove = content.substring(startIndex, endIndex + endMarker.length);
console.log("Removing block:\n" + textToRemove);

// Remove the block
const newContent = content.slice(0, startIndex) + content.slice(endIndex + endMarker.length);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully removed the block!");
