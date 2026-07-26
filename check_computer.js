const fs = require('fs');

const content = fs.readFileSync('assets/js/main.js', 'utf8');

const regex = /title:\s*"([^"]+)",[^}]*subj:\s*"The Educators Computer"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log("Computer Book:", match[1]);
}
