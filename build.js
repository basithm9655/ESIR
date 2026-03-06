const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'supabase-config.js');
let content = fs.readFileSync(configPath, 'utf8');

const vars = {
    '___SUPABASE_URL___': process.env.SUPABASE_URL,
    '___SUPABASE_ANON_KEY___': process.env.SUPABASE_ANON_KEY,
    '___ADMIN_USERNAME___': process.env.ADMIN_USERNAME,
    '___ADMIN_PASSWORD___': process.env.ADMIN_PASSWORD
};

let count = 0;
for (const [placeholder, value] of Object.entries(vars)) {
    if (value) {
        // Use split/join to replace all occurrences if many
        content = content.split(placeholder).join(value);
        count++;
    }
}

fs.writeFileSync(configPath, content);
console.log(`✅ ${count} environment variables successfully injected into supabase-config.js`);
