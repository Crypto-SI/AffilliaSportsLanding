// This script replaces any references to the old Supabase URL in the built JavaScript files
const fs = require('fs');
const path = require('path');

const OLD_URL = 'api.supabase.cryptosi.org';
const NEW_URL = 'cxabjqdukorysrusylap.supabase.co';

// Function to recursively search for files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to replace the old URL with the new URL in a file
function replaceUrlInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(OLD_URL)) {
      console.log(`Found old URL in ${filePath}`);
      const newContent = content.replace(new RegExp(OLD_URL, 'g'), NEW_URL);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Replaced old URL in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('Searching for files with old Supabase URL...');
  
  // Search in .next directory
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    const files = findFiles(nextDir);
    let replacementCount = 0;
    
    files.forEach(file => {
      if (replaceUrlInFile(file)) {
        replacementCount++;
      }
    });
    
    console.log(`Replaced old URL in ${replacementCount} files.`);
  } else {
    console.error('.next directory not found. Make sure to run this script after building the application.');
  }
}

main();