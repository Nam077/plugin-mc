#!/usr/bin/env node
/**
 * Script để GIẢM quest rewards để farming khó hơn
 * Target: 2 tiếng farming = 1 diamond (thay vì 1 tiếng)
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Divisor để giảm quest rewards xuống 50% (÷2)
const QUEST_REWARD_DIVISOR = 2;

async function reduceQuestRewards(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) return;
        
        const jobName = Object.keys(data)[0];
        const jobData = data[jobName];
        
        if (!jobData.Quests) return;
        
        let totalDecrease = 0;
        
        // Giảm reward cho từng quest
        Object.keys(jobData.Quests).forEach(questId => {
            const quest = jobData.Quests[questId];
            
            // Tìm reward command
            if (quest.RewardCommands) {
                quest.RewardCommands = quest.RewardCommands.map(command => {
                    if (command.includes('eco give')) {
                        // Extract current reward amount
                        const match = command.match(/eco give \[playerName\] (\d+)/);
                        if (match) {
                            const oldReward = parseInt(match[1]);
                            const newReward = Math.floor(oldReward / QUEST_REWARD_DIVISOR);
                            totalDecrease += (oldReward - newReward);
                            
                            // Update command
                            return command.replace(/eco give \[playerName\] \d+/, `eco give [playerName] ${newReward}`);
                        }
                    }
                    
                    if (command.includes('&6+') && command.includes('coins')) {
                        // Update message
                        const match = command.match(/&6\+(\d+) coins/);
                        if (match) {
                            const oldReward = parseInt(match[1]);
                            const newReward = Math.floor(oldReward / QUEST_REWARD_DIVISOR);
                            return command.replace(/&6\+\d+ coins/, `&6+${newReward} coins`);
                        }
                    }
                    
                    return command;
                });
            }
            
            // Update reward description
            if (quest.RewardDesc) {
                quest.RewardDesc = quest.RewardDesc.map(desc => {
                    const match = desc.match(/Get (\d+) coins/);
                    if (match) {
                        const oldReward = parseInt(match[1]);
                        const newReward = Math.floor(oldReward / QUEST_REWARD_DIVISOR);
                        return desc.replace(/Get \d+ coins/, `Get ${newReward} coins`);
                    }
                    return desc;
                });
            }
        });
        
        // Ghi lại file
        const yamlStr = yaml.dump(data, {
            defaultFlowStyle: false,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false
        });
        
        await fs.writeFile(filePath, yamlStr, 'utf8');
        console.log(`✅ Reduced: ${path.basename(filePath)} (-${totalDecrease} coins decrease)`);
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

async function main() {
    console.log('⬇️ REDUCING Quest Rewards to make farming harder!');
    console.log('🎯 Target: 2 hours farming = 1 diamond (was 1 hour)');
    console.log(`📉 Applying ÷${QUEST_REWARD_DIVISOR} to all quest rewards`);
    
    const jobsDir = path.join(__dirname, 'Jobs', 'jobs');
    const pattern = path.join(jobsDir, '*.yml');
    const jobFiles = await glob(pattern);
    
    const validJobFiles = jobFiles.filter(file => {
        const basename = path.basename(file).toLowerCase();
        return !basename.includes('example') && !basename.includes('none');
    });
    
    console.log(`📁 Found ${validJobFiles.length} job files to reduce rewards`);
    
    for (const jobFile of validJobFiles) {
        await reduceQuestRewards(jobFile);
    }
    
    console.log('\n⬇️ QUEST REWARD REDUCTION COMPLETED!');
    console.log('📊 New reward ranges:');
    console.log('  • Basic quests: 160-400 coins (was 320-800)');
    console.log('  • Medium quests: 300-600 coins (was 600-1,200)');
    console.log('  • Hard quests: 600-1,000 coins (was 1,200-2,000)');
    console.log('  • Master quests: 1,000-2,000 coins (was 2,000-4,000)');
    
    console.log('\n💰 New daily earning potential: 10,000-17,500 coins (was 20,000-35,000)');
    
    console.log('\n🌾 NEW FARMER ECONOMICS (Diamond = 262 coins):');
    console.log('  • Crop Master (200 coins): 50 wheat → Need 66 wheat for 1 diamond');
    console.log('  • Mega Farmer (800 coins): 200 wheat → Need 66 wheat for 1 diamond');
    console.log('  • 66 wheat = ~1 stack = 2 hours farming ✅');
    
    console.log('\n⏰ NEW TIME INVESTMENT:');
    console.log('  💎 1 Diamond = 2 hours farming (was 1 hour)');
    console.log('  🏺 1 Ancient Debris = 2-4 weeks farming (was 1-2 weeks)');
    console.log('  🛡️ 1 Netherite Ingot = 2-4 months farming (was 1-2 months)');
    
    console.log('\n🎯 NOW FARMING IS PROPERLY CHALLENGING! 💪');
    console.log('⚖️ Economy balanced for long-term engagement!');
}

if (require.main === module) {
    main();
}

module.exports = { reduceQuestRewards };
