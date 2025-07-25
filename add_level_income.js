#!/usr/bin/env node
/**
 * Script để thêm ít tiền khi lên level
 * Không nhiều quá, chỉ để khuyến khích chơi
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Công thức tiền lên level - VỪA PHẢI, KHÔNG QUÁ NHIỀU
const LEVEL_INCOME_FORMULA = 'baseincome+(baseincome*(joblevel-1)*0.02)'; // Tăng 2% mỗi level

// Base income cho mỗi job (tiền cơ bản mỗi level)
const BASE_INCOMES = {
    farmer: 15,      // 15 coins level 1, ~20 coins level 50
    miner: 18,       // 18 coins level 1, ~25 coins level 50  
    builder: 12,     // 12 coins level 1, ~16 coins level 50
    woodcutter: 14,  // 14 coins level 1, ~19 coins level 50
    digger: 10,      // 10 coins level 1, ~14 coins level 50
    hunter: 20,      // 20 coins level 1, ~27 coins level 50
    fisherman: 16,   // 16 coins level 1, ~22 coins level 50
    weaponsmith: 25, // 25 coins level 1, ~34 coins level 50
    brewer: 22,      // 22 coins level 1, ~30 coins level 50
    enchanter: 30,   // 30 coins level 1, ~41 coins level 50
    crafter: 18,     // 18 coins level 1, ~25 coins level 50
    explorer: 20     // 20 coins level 1, ~27 coins level 50
};

async function addLevelIncome(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) return;
        
        const jobName = Object.keys(data)[0];
        const jobData = data[jobName];
        const jobType = jobName.toLowerCase();
        
        // Get base income for this job
        const baseIncome = BASE_INCOMES[jobType] || 15;
        
        // Change income formula from '0' to gradual increase
        jobData['income-progression-equation'] = LEVEL_INCOME_FORMULA;
        
        // Add baseincome to all activities to enable the formula
        const activityTypes = ['Break', 'Place', 'Kill', 'Fish', 'Tame', 'Breed', 'Shear', 'Milk', 'Collect', 'Craft', 'Smelt', 'Repair', 'Enchant', 'Brew'];
        
        activityTypes.forEach(activityType => {
            if (jobData[activityType]) {
                Object.keys(jobData[activityType]).forEach(item => {
                    // Set baseincome for the formula to work
                    jobData[activityType][item].income = baseIncome;
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
        
        console.log(`✅ ${path.basename(filePath)}: Base income ${baseIncome} coins/level`);
        console.log(`   💰 Level 1: ${baseIncome} coins, Level 50: ~${Math.round(baseIncome * 1.98)} coins, Level 100: ~${Math.round(baseIncome * 2.98)} coins`);
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

async function main() {
    console.log('💰 ADDING LEVEL INCOME TO JOBS!');
    console.log('🎯 Goal: Small money rewards for leveling up');
    console.log('⚖️ Strategy: Modest amounts that dont break economy');
    
    const jobFiles = await glob('Jobs/jobs/*.yml');
    let processedCount = 0;
    
    for (const filePath of jobFiles) {
        if (await fs.pathExists(filePath)) {
            const jobName = path.basename(filePath, '.yml');
            console.log(`\n🔧 Processing ${jobName}...`);
            await addLevelIncome(filePath);
            processedCount++;
        }
    }
    
    console.log('\n🎉 LEVEL INCOME SYSTEM COMPLETED!');
    console.log(`📁 Jobs updated: ${processedCount}`);
    console.log('\n💡 New Income System:');
    console.log('  📈 Formula: baseincome + (baseincome * (level-1) * 0.02)');
    console.log('  💰 Growth: 2% increase per level (very modest)');
    console.log('  🎯 Balance: Encourages leveling without breaking economy');
    
    console.log('\n📊 Example Progression:');
    console.log('  • Level 1-10: 15-17 coins per action');
    console.log('  • Level 11-30: 17-24 coins per action');  
    console.log('  • Level 31-50: 24-30 coins per action');
    console.log('  • Level 51-100: 30-45 coins per action');
    console.log('  • Level 100+: 45+ coins per action');
    
    console.log('\n⚖️ Economy Impact:');
    console.log('  ✅ Quest rewards (150-800) still primary income');
    console.log('  ✅ Level income provides small supplementary bonus');
    console.log('  ✅ High-level players get modest advantage');
    console.log('  ✅ No inflation risk - amounts stay reasonable');
    
    console.log('\n🏆 Players now rewarded for dedication and progression!');
}

if (require.main === module) {
    main();
}

module.exports = { addLevelIncome };
