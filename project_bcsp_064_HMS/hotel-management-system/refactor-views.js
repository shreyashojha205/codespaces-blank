const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace everything from <!DOCTYPE html> to </header> with <%- include('partials/header') %>
  content = content.replace(/<!DOCTYPE html>[\s\S]*?<\/header>/i, "<%- include('partials/header') %>");

  // Replace everything from <footer> to </html> with <%- include('partials/footer') %>
  // Wait, some files have custom scripts at the bottom.
  // Instead, replace <footer>...</footer> the scripts ... </body></html> with <%- include('partials/footer') %> 
  // EXCEPT we want to preserve the custom scripts!
  content = content.replace(/<footer>[\s\S]*?<\/footer>/i, "");
  
  // The footer partial already contains: <script src="/public/js/app.js"></script></body></html>
  // So we can replace `<script src="/public/js/app.js"></script>` up to `</html>` with `<%- include('partials/footer') %>`
  // And move any EXTRA `<script>` tags before it.
  content = content.replace(/<script src="\/public\/js\/app\.js"><\/script>\s*<\/body>\s*<\/html>/i, "<%- include('partials/footer') %>");

  fs.writeFileSync(filePath, content);
}
console.log('Refactored EJS files');
