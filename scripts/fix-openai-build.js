// This script modifies the OpenAI client initialization to use a dummy key during build
const fs = require('fs');
const path = require('path');

// Define paths to search for OpenAI client initialization
const appDir = path.join(process.cwd(), 'app');
const srcDir = path.join(process.cwd(), 'src');

// Function to recursively search for files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to check if a file contains OpenAI client initialization
function containsOpenAIClient(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('new OpenAI(') || 
           content.includes('from "openai"') || 
           content.includes("from 'openai'");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

// Function to modify OpenAI client initialization
function modifyOpenAIClient(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add a dummy key for OpenAI client initialization
    content = content.replace(
      /new OpenAI\(\s*\{?\s*apiKey\s*:\s*process\.env\.OPENAI_API_KEY\s*\}?\s*\)/g,
      'new OpenAI({ apiKey: "sk-dummy-key-for-build-process-only" })'
    );
    
    // Also handle direct environment variable access
    content = content.replace(
      /process\.env\.OPENAI_API_KEY/g,
      '"sk-dummy-key-for-build-process-only"'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Modified OpenAI client in ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error modifying file ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('Searching for files with OpenAI client initialization...');
  
  // Search in app directory
  if (fs.existsSync(appDir)) {
    const appFiles = findFiles(appDir);
    appFiles.forEach(file => {
      if (containsOpenAIClient(file)) {
        console.log(`Found OpenAI client in ${file}`);
        modifyOpenAIClient(file);
      }
    });
  }
  
  // Search in src directory
  if (fs.existsSync(srcDir)) {
    const srcFiles = findFiles(srcDir);
    srcFiles.forEach(file => {
      if (containsOpenAIClient(file)) {
        console.log(`Found OpenAI client in ${file}`);
        modifyOpenAIClient(file);
      }
    });
  }
  
  console.log('Done modifying OpenAI client initialization.');
}

main();