import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (!dirPath.includes('node_modules')) {
            let isDirectory = fs.statSync(dirPath).isDirectory();
            isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
        }
    }); // eslint-disable-next-line
}

walkDir('c:/Users/vishn/Downloads/PP/src', (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        content = content.replace(/['"](.+)\/lib\/AuthContext['"]/g, "'@/contexts/AuthContext'");
        content = content.replace(/['"](.+)\/lib\/ThemeContext['"]/g, "'@/contexts/ThemeContext'");
        content = content.replace(/['"](.+)\/lib\/TransactionContext['"]/g, "'@/contexts/TransactionContext'");
        content = content.replace(/['"](.+)\/lib\/exportExcel['"]/g, "'@/utils/exportExcel'");
        content = content.replace(/['"](.+)\/lib\/types['"]/g, "'@/lib/types'");
        content = content.replace(/['"](.+)\/lib\/store['"]/g, "'@/lib/store'");

        content = content.replace(/['"](.+)\/components\/auth\/AuthScreen['"]/g, "'@/pages/AuthScreen'");
        content = content.replace(/['"](.+)\/components\/log\/ExpenseLogScreen['"]/g, "'@/pages/ExpenseLogScreen'");
        content = content.replace(/['"](.+)\/components\/stats\/StatisticsScreen['"]/g, "'@/pages/StatisticsScreen'");
        content = content.replace(/['"](.+)\/components\/log\/AddExpenseModal['"]/g, "'@/modals/AddExpenseModal'");
        content = content.replace(/['"]\.\/AddExpenseModal['"]/g, "'@/modals/AddExpenseModal'");
        content = content.replace(/['"]\.\.\/components\/ui\/(.*)['"]/g, "'@/components/ui/$1'");
        content = content.replace(/['"]\.\.\/\.\.\/components\/(.*)['"]/g, "'@/components/$1'");
        content = content.replace(/['"]\.\.\/\.\.\/\.\.\/components\/(.*)['"]/g, "'@/components/$1'");

        if (filePath.includes('ExpenseLogScreen')) {
            content = content.replace(/['"]\.\/ExpenseCard['"]/g, "'@/components/log/ExpenseCard'");
        }

        if (filePath.includes('App.tsx')) {
            content = content.replace(/['"]\.\/components\/layout\/Layout['"]/g, "'@/components/layout/Layout'");
        }

        if (filePath.includes('routes.ts') || filePath.includes('App.tsx')) {
            content = content.replace(/['"]\.\/components\//g, "'@/components/");
            content = content.replace(/['"]\.\/pages\//g, "'@/pages/");
        }

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed', filePath);
        }
    }
});
