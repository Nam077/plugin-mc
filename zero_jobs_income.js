#!/usr/bin/env node
/**
 * Script để đặt thu nhập Jobs về 0 (chỉ giữ lại points và experience)
 * Sử dụng: node zero_jobs_income.js
 * hoặc: npm run zero-income
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

/**
 * Đặt tất cả income = 0 trong file job
 * @param {string} filePath - Đường dẫn file job
 */
async function zeroJobIncome(filePath) {
    try {
        // Đọc file YAML
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) {
            console.log(`⚠️  File rỗng: ${path.basename(filePath)}`);
            return;
        }
        
        let modified = false;
        const jobName = Object.keys(data)[0]; // Tên job (Miner, Builder, etc.)
        const jobData = data[jobName];
        
        // Đặt công thức income = 0
        if (jobData['income-progression-equation']) {
            jobData['income-progression-equation'] = '0';
            modified = true;
        }
        
        // Các action types có thể có trong Jobs
        const actionTypes = [
            'Break', 'Place', 'Kill', 'Craft', 'Smelt', 'Repair', 
            'TNTBreak', 'Tame', 'Breed', 'Milk', 'Shear', 'Fish', 
            'Enchant', 'custom-kill', 'Explore', 'custom-explore', 
            'Brew', 'Brush', 'Strip', 'Dye', 'Collect'
        ];
        
        // Duyệt qua các action types
        for (const actionType of actionTypes) {
            if (jobData[actionType]) {
                for (const [itemName, itemData] of Object.entries(jobData[actionType])) {
                    if (typeof itemData === 'object' && itemData.income !== undefined) {
                        const oldIncome = itemData.income;
                        itemData.income = 0;
                        if (oldIncome !== 0) {
                            console.log(`    ${actionType}.${itemName}: ${oldIncome} → 0`);
                            modified = true;
                        }
                    }
                }
            }
        }
        
        if (modified) {
            // Ghi lại file với format đẹp
            const yamlStr = yaml.dump(data, {
                defaultFlowStyle: false,
                lineWidth: -1,
                noRefs: true,
                sortKeys: false
            });
            
            await fs.writeFile(filePath, yamlStr, 'utf8');
            console.log(`✅ Zeroed income: ${path.basename(filePath)}`);
        } else {
            console.log(`ℹ️  No income found: ${path.basename(filePath)}`);
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚫 Setting all Jobs income to 0...');
        
        // Tìm tất cả file job
        const jobsDir = path.join(__dirname, 'Jobs', 'jobs');
        const pattern = path.join(jobsDir, '*.yml');
        const jobFiles = await glob(pattern);
        
        // Loại bỏ file example và none
        const validJobFiles = jobFiles.filter(file => {
            const basename = path.basename(file).toLowerCase();
            return !basename.includes('example') && !basename.includes('none');
        });
        
        console.log(`📁 Found ${validJobFiles.length} job files`);
        
        if (validJobFiles.length === 0) {
            console.log('❌ No valid job files found!');
            console.log(`📂 Looking in: ${jobsDir}`);
            return;
        }
        
        // Xử lý từng file
        for (const jobFile of validJobFiles) {
            await zeroJobIncome(jobFile);
        }
        
        console.log('\n✅ Done! All Jobs now give 0 income (only points & experience)');
        console.log('💡 Players will need to use shop or other methods to earn money');
        console.log('🔄 Remember to restart your server to apply changes!');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = { zeroJobIncome };
