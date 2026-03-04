import fs from 'fs';
import path from 'path';

["AuthContext.tsx", "ThemeContext.tsx", "TransactionContext.tsx"].forEach(f => {
    let p = path.join('c:/Users/vishn/Downloads/PP/src/contexts', f);
    if (fs.existsSync(p)) {
        let text = fs.readFileSync(p, 'utf8');
        text = text.replace(/from "(\.\/([^"]+))"/g, 'from "@/lib/$2"');
        fs.writeFileSync(p, text);
    }
});
