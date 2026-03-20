const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // If we already inserted it somehow, skip
  if (!content.includes("<%- include('partials/footer') %>")) {
    // In all files, the main content is wrapped in <div class="container"> ... </div>
    // Right before <script src="/public/js/app.js">, we should insert the footer
    content = content.replace(/<script src="\/public\/js\/app\.js"><\/script>/i, "<%- include('partials/footer') %>\n  <script src=\"/public/js/app.js\"></script>");
    fs.writeFileSync(filePath, content);
  }
}
console.log('Fixed footers');
