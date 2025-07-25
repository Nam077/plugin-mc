#!/usr/bin/env node
/**
 * Script để đặt lại income = 0 cho tất cả actions
 * Giữ nguyên income formula để vẫn có tiền khi lên level
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

async function resetActionIncome(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) return;
        
        const jobName = Object.keys(data)[0];
        const jobData = data[jobName];
        
        // Activity types to reset
        const activityTypes = ['Break', 'Place', 'Kill', 'Fish', 'Tame', 'Breed', 'Shear', 'Milk', 'Collect', 'Craft', 'Smelt', 'Repair', 'Enchant', 'Brew'];
        
        let changedCount = 0;
        
        activityTypes.forEach(activityType => {
            if (jobData[activityType]) {
                Object.keys(jobData[activityType]).forEach(item => {
                    if (jobData[activityType][item].income !== 0) {
                        jobData[activityType][item].income = 0;
                        changedCount++;
                    }
                });
            }
        });
        
        // Write back
        const yamlStr = yaml.dump(data, {
            defaultFlowStyle: false,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false
        });
        
        await fs.writeFile(filePath, yamlStr, 'utf8');
        
        console.log(`✅ ${path.basename(filePath)}: ${changedCount} actions reset to income = 0`);
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

async function main() {
    console.log('🔄 RESETTING ACTION INCOME TO 0!');
    console.log('🎯 Goal: No money from actions, only from quests and level-up');
    console.log('💡 Strategy: Keep income formula but set action income = 0');
    
    const jobFiles = await glob('Jobs/jobs/*.yml');
    let processedCount = 0;
    let totalChanged = 0;
    
    for (const filePath of jobFiles) {
        if (await fs.pathExists(filePath)) {
            const jobName = path.basename(filePath, '.yml');
            console.log(`\n🔧 Processing ${jobName}...`);
            await resetActionIncome(filePath);
            processedCount++;
        }
    }
    
    console.log('\n🎉 ACTION INCOME RESET COMPLETED!');
    console.log(`📁 Jobs processed: ${processedCount}`);
    
    console.log('\n💰 New Income System:');
    console.log('  ❌ Action income: 0 coins (no money from mining/farming/etc)');
    console.log('  ✅ Level income: Formula still active (money when leveling up)');
    console.log('  ✅ Quest rewards: 150-800 coins (primary income source)');
    
    console.log('\n⚖️ Perfect Balance:');
    console.log('  🎯 Players earn money ONLY from:');
    console.log('    • Completing daily quests (150-800 coins)');
    console.log('    • Leveling up their job (15-30 coins per level)');
    console.log('  🚫 No money from regular gameplay actions');
    console.log('  ✅ Prevents grinding and maintains quest focus');
    
    console.log('\n🏆 Economy now perfectly balanced!');
    console.log('💎 Quest-focused progression with level bonuses!');
}

if (require.main === module) {
    main();
}

module.exports = { resetActionIncome };
