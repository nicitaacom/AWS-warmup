how warmup works - https://i.imgur.com/G890fdv.png


## Step 1
npm run build

## Step 2
index.js
```
const decryptResend_1 = require("./dist/src/utils/decryptResend.js");
const Warmup_1 = require("./dist/src/classes/Warmup.js");
```

## Step 3
Warmup.js
```
const freeEmailDomains_1 = require("../const/freeEmailDomains.js");
const extractEmailFromNameEmail_1 = require("../utils/extractEmailFromNameEmail.js");
const extractNameFromNameEmail_1 = require("../utils/extractNameFromNameEmail.js");
const decryptResend_1 = require("../utils/decryptResend.js");
const WARMUP_CONFIG_1 = require("../const/WARMUP_CONFIG.js");
const randomNames_1 = require("../const/randomNames.js");
const randomMemes_1 = require("../const/randomMemes.js");
```

## Step 4
Warmup.js (in getRandomEmail)
```
  async getRandomEmail(niche) {
        const fullPath = path.join(__dirname, "..", "..", "const", `${niche}.js`)
        const emailTemplates = require(fullPath)
```

## Step 5
zip -r warmup.zip index.js node_modules dist