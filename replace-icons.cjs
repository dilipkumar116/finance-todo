const fs = require('fs');
const path = require('path');

function replaceIconsImport(filePath, relativePathToIcons) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace react-icons/... with the local icons file
  const regex = /import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/[^'"]+['"];?/g;
  
  let modified = false;
  let newContent = content.replace(regex, (match, imports) => {
    modified = true;
    return `import { ${imports.trim()} } from '${relativePathToIcons}';`;
  });

  // Handle multiple react-icons imports in the same file by merging them or just leaving them as multiple imports from the same file.
  // The regex replace will just replace each one with `import { ... } from '../../utils/icons';`
  // This is perfectly valid JS.

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dir, basePath) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath, basePath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      // Calculate relative path to src/utils/icons.jsx
      let relativePath = path.relative(path.dirname(fullPath), path.join(basePath, 'utils', 'icons'));
      relativePath = relativePath.replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      replaceIconsImport(fullPath, relativePath);
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir, srcDir);
