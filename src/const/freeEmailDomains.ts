import { readFileSync } from "fs"
import path from "path"

// to determinate whether reply from @gmail.com or @domain.name is required
// DEPENDS ON VM-receiveEmails and OT (freeEmailDomains)
  
// 📁 Works because CommonJS has __dirname by default
const filePath = path.resolve(__dirname, "../../../freeEmailList.txt")

export const freeEmailDomains = readFileSync(filePath, "utf-8")
      .split("\n")
      .map(domain => domain.trim().toLowerCase())
      .filter(Boolean) // remove empty lines