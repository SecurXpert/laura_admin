const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Case 1: standalone exact string assignment
  // const BASE_URL = "https://lauratek.in:8000"; -> const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // baseURL: "https://lauratek.in:8000" -> baseURL: import.meta.env.VITE_API_BASE_URL
  // We match exactly "https://lauratek.in:8000" or 'https://lauratek.in:8000'
  content = content.replace(/["']https:\/\/lauratek\.in:8000["']/g, 'import.meta.env.VITE_API_BASE_URL');

  // Case 2: inside a template string
  // `https://lauratek.in:8000/some/path` -> `${import.meta.env.VITE_API_BASE_URL}/some/path`
  content = content.replace(/`https:\/\/lauratek\.in:8000/g, '`${import.meta.env.VITE_API_BASE_URL}');

  // Case 3: inside a regular string with paths
  // "https://lauratek.in:8000/some/path" -> `${import.meta.env.VITE_API_BASE_URL}/some/path`
  // We need to carefully handle the quotes for this.
  // Match "https://lauratek.in:8000..." or 'https://lauratek.in:8000...'
  content = content.replace(/(["'])https:\/\/lauratek\.in:8000(.*?)(\1)/g, '`${import.meta.env.VITE_API_BASE_URL}$2`');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('Finished updating URLs to use .env');
