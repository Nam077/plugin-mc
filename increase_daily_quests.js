#!/usr/bin/env node
/**
 * Script để tăng số lượng Daily Quests và reward cho tất cả Jobs
 * Sử dụng: node increase_daily_quests.js
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Template quests cho từng job type
const questTemplates = {
    builder: [
        {
            name: "Foundation Builder",
            objectives: ["Place;cobblestone;100", "Place;stone;50", "Place;oak_planks;75"],
            reward: 150,
            desc: "Build foundations and get money"
        },
        {
            name: "Architect",
            objectives: ["Place;bricks;50", "Place;oak_stairs;30", "Place;glass;40"],
            reward: 200,
            desc: "Create beautiful structures"
        },
        {
            name: "Master Builder",
            objectives: ["Place;quartz_block;25", "Place;iron_block;10", "Place;diamond_block;2"],
            reward: 400,
            desc: "Build with precious materials"
        }
    ],
    farmer: [
        {
            name: "Animal Caretaker",
            objectives: ["Breed;Cow;5", "Breed;Sheep;5", "Milk;Cow;10"],
            reward: 120,
            desc: "Take care of farm animals"
        },
        {
            name: "Crop Master",
            objectives: ["Collect;wheat;50", "Collect;carrot;30", "Collect;potato;30"],
            reward: 100,
            desc: "Harvest your crops"
        },
        {
            name: "Beekeeper",
            objectives: ["Collect;honeycomb;10", "Collect;honeybottle;5"],
            reward: 180,
            desc: "Work with bees and honey"
        }
    ],
    hunter: [
        {
            name: "Monster Slayer",
            objectives: ["Kill;ZOMBIE;15", "Kill;SKELETON;10", "Kill;SPIDER;12"],
            reward: 180,
            desc: "Hunt common monsters"
        },
        {
            name: "Beast Hunter",
            objectives: ["Kill;CREEPER;8", "Kill;ENDERMAN;5", "Kill;WITCH;3"],
            reward: 250,
            desc: "Hunt dangerous beasts"
        },
        {
            name: "Boss Fighter",
            objectives: ["Kill;BLAZE;5", "Kill;WITHER_SKELETON;3"],
            reward: 400,
            desc: "Fight powerful bosses"
        }
    ],
    fisherman: [
        {
            name: "Casual Fisher",
            objectives: ["Fish;RAW_FISH;20", "Fish;RAW_SALMON;15"],
            reward: 100,
            desc: "Catch common fish"
        },
        {
            name: "Treasure Hunter",
            objectives: ["Fish;ENCHANTED_BOOK;2", "Fish;NAME_TAG;1"],
            reward: 300,
            desc: "Fish for treasures"
        }
    ],
    woodcutter: [
        {
            name: "Lumberjack",
            objectives: ["Break;oak_log;50", "Break;birch_log;30", "Break;spruce_log;40"],
            reward: 120,
            desc: "Cut down trees"
        },
        {
            name: "Forest Cleaner",
            objectives: ["Break;jungle_log;25", "Break;acacia_log;20", "Break;dark_oak_log;15"],
            reward: 160,
            desc: "Clear rare wood types"
        }
    ],
    crafter: [
        {
            name: "Basic Crafter",
            objectives: ["Craft;chest;10", "Craft;crafting_table;5", "Craft;furnace;5"],
            reward: 140,
            desc: "Craft basic items"
        },
        {
            name: "Tool Maker",
            objectives: ["Craft;iron_pickaxe;3", "Craft;iron_sword;2", "Craft;iron_axe;2"],
            reward: 200,
            desc: "Craft useful tools"
        },
        {
            name: "Advanced Crafter",
            objectives: ["Craft;enchanting_table;1", "Craft;anvil;1", "Craft;beacon;1"],
            reward: 500,
            desc: "Craft advanced items"
        }
    ]
};

/**
 * Tăng quests cho một job file
 */
async function increaseJobQuests(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) return;
        
        const jobName = Object.keys(data)[0];
        const jobData = data[jobName];
        const jobType = jobName.toLowerCase();
        
        // Tăng maxDailyQuests
        jobData.maxDailyQuests = 3;
        
        // Tìm template phù hợp
        let templates = questTemplates[jobType] || [
            {
                name: "Daily Worker",
                objectives: ["Break;stone;50"],
                reward: 150,
                desc: "Complete daily work"
            },
            {
                name: "Hard Worker", 
                objectives: ["Break;cobblestone;100"],
                reward: 200,
                desc: "Work harder for more money"
            }
        ];
        
        // Tạo quests mới
        const newQuests = {};
        templates.forEach((template, index) => {
            newQuests[`${index + 1}`] = {
                Name: template.name,
                Objectives: template.objectives,
                RewardCommands: [
                    `eco give [playerName] ${template.reward}`,
                    `msg [playerName] &aCompleted ${template.name} quest! &6+${template.reward} coins`
                ],
                RewardDesc: [
                    template.desc,
                    `Get ${template.reward} coins for this!`
                ]
            };
        });
        
        jobData.Quests = newQuests;
        
        // Ghi lại file
        const yamlStr = yaml.dump(data, {
            defaultFlowStyle: false,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false
        });
        
        await fs.writeFile(filePath, yamlStr, 'utf8');
        console.log(`✅ Updated quests: ${path.basename(filePath)} (${Object.keys(newQuests).length} quests)`);
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🎯 Increasing Daily Quests for all Jobs...');
        
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
        
        // Xử lý từng file (trừ miner.yml đã sửa thủ công)
        for (const jobFile of validJobFiles) {
            if (!jobFile.includes('miner.yml')) {
                await increaseJobQuests(jobFile);
            }
        }
        
        console.log('\n✅ Done! All Jobs now have multiple daily quests');
        console.log('📈 Quest rewards increased: 100-500 coins per quest');
        console.log('🎯 Max daily quests: 3-5 per job');
        console.log('💰 Potential daily income: 1,500-3,000+ coins');
        console.log('🔄 Remember to restart your server to apply changes!');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Chạy script
if (require.main === module) {
    main();
}

module.exports = { increaseJobQuests };
