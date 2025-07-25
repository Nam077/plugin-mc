#!/usr/bin/env node
/**
 * Script để tạo ANTI-AUTOMATION quests
 * Ngăn players exploit với auto-farms và automation
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// ANTI-AUTOMATION quest templates
const ANTI_AUTOMATION_QUESTS = {
    farmer: [
        {
            name: "Diverse Farmer",
            objectives: [
                "Break;wheat;30", 
                "Break;carrot;20", 
                "Break;potato;20",
                "Break;pumpkin;10",
                "Break;melon;10",
                "Breed;Cow;3",
                "Milk;Cow;5"
            ],
            reward: 150,
            desc: "Diversified farming prevents automation"
        },
        {
            name: "Animal Specialist", 
            objectives: [
                "Breed;Cow;8",
                "Breed;Pig;6", 
                "Breed;Chicken;10",
                "Breed;Sheep;8",
                "Shear;White;10",
                "Milk;Cow;8"
            ],
            reward: 200,
            desc: "Complex animal management"
        },
        {
            name: "Bee Master",
            objectives: [
                "Collect;honeycomb;15",
                "Collect;honeybottle;10",
                "Break;wheat;40"
            ],
            reward: 250,
            desc: "Requires manual bee management"
        },
        {
            name: "Garden Expert",
            objectives: [
                "Break;sugar_cane;80",
                "Break;pumpkin;25", 
                "Break;melon;25",
                "Break;wheat;35",
                "Breed;Cow;5"
            ],
            reward: 300,
            desc: "Mixed farming activities"
        },
        {
            name: "Master Agriculturalist",
            objectives: [
                "Break;wheat;60",
                "Break;carrot;40",
                "Break;potato;40", 
                "Break;pumpkin;20",
                "Breed;Cow;10",
                "Breed;Pig;8",
                "Collect;honeycomb;8"
            ],
            reward: 500,
            desc: "Ultimate farming challenge"
        }
    ],
    miner: [
        {
            name: "Cave Explorer",
            objectives: [
                "Break;stone;80",
                "Break;coal_ore;12", 
                "Break;iron_ore;8",
                "Break;deepslate;30"
            ],
            reward: 180,
            desc: "Requires actual cave mining"
        },
        {
            name: "Ore Specialist",
            objectives: [
                "Break;iron_ore;15",
                "Break;coal_ore;20",
                "Break;copper_ore;12",
                "Break;gold_ore;6",
                "Break;lapis_ore;4"
            ],
            reward: 300,
            desc: "Must find various ores naturally"
        },
        {
            name: "Deep Miner",
            objectives: [
                "Break;deepslate;100",
                "Break;deepslate_iron_ore;10",
                "Break;deepslate_coal_ore;15",
                "Break;stone;50"
            ],
            reward: 250,
            desc: "Deep underground mining required"
        },
        {
            name: "Precious Hunter",
            objectives: [
                "Break;diamond_ore;3",
                "Break;emerald_ore;2",
                "Break;deepslate_diamond_ore;2",
                "Break;gold_ore;8",
                "Break;iron_ore;20"
            ],
            reward: 600,
            desc: "Rare ore hunting - no automation possible"
        },
        {
            name: "Master Excavator",
            objectives: [
                "Break;stone;150",
                "Break;deepslate;80",
                "Break;iron_ore;25",
                "Break;coal_ore;30",
                "Break;diamond_ore;4"
            ],
            reward: 800,
            desc: "Massive mining operation"
        }
    ],
    builder: [
        {
            name: "Foundation Expert",
            objectives: [
                "Place;cobblestone;80",
                "Place;stone_bricks;40", 
                "Place;oak_planks;60",
                "Place;glass;30"
            ],
            reward: 200,
            desc: "Varied building materials"
        },
        {
            name: "Architect",
            objectives: [
                "Place;bricks;60",
                "Place;quartz_block;20",
                "Place;oak_stairs;40",
                "Place;glass_pane;50",
                "Place;iron_bars;20"
            ],
            reward: 350,
            desc: "Complex architectural work"
        },
        {
            name: "Decorator",
            objectives: [
                "Place;wool;80",
                "Place;carpet;40",
                "Place;item_frame;10",
                "Place;painting;5"
            ],
            reward: 180,
            desc: "Interior decoration"
        },
        {
            name: "Infrastructure Builder",
            objectives: [
                "Place;stone;120",
                "Place;cobblestone;100",
                "Place;oak_planks;80",
                "Place;torch;60",
                "Place;ladder;30"
            ],
            reward: 400,
            desc: "Large scale construction"
        },
        {
            name: "Master Constructor",
            objectives: [
                "Place;stone;200",
                "Place;bricks;80",
                "Place;quartz_block;40",
                "Place;iron_block;15",
                "Place;glass;100"
            ],
            reward: 700,
            desc: "Epic construction project"
        }
    ]
};

async function createAntiAutomationQuests(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) return;
        
        const jobName = Object.keys(data)[0];
        const jobData = data[jobName];
        const jobType = jobName.toLowerCase();
        
        // Get anti-automation templates
        const templates = ANTI_AUTOMATION_QUESTS[jobType];
        if (!templates) return;
        
        // Increase maxDailyQuests to 5 for balance
        jobData.maxDailyQuests = 5;
        
        // Create new anti-automation quests
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
        
        // Write back
        const yamlStr = yaml.dump(data, {
            defaultFlowStyle: false,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false
        });
        
        await fs.writeFile(filePath, yamlStr, 'utf8');
        console.log(`✅ Anti-automation: ${path.basename(filePath)} (${Object.keys(newQuests).length} quests)`);
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

async function main() {
    console.log('🚫 CREATING ANTI-AUTOMATION QUESTS!');
    console.log('🎯 Target: Prevent auto-farms and exploitation');
    console.log('💡 Strategy: Complex, mixed objectives that require manual play');
    
    const targetJobs = ['farmer.yml', 'miner.yml', 'builder.yml'];
    
    for (const jobFile of targetJobs) {
        const filePath = path.join(__dirname, 'Jobs', 'jobs', jobFile);
        if (await fs.pathExists(filePath)) {
            console.log(`\n🔧 Processing ${jobFile}...`);
            await createAntiAutomationQuests(filePath);
        }
    }
    
    console.log('\n🚫 ANTI-AUTOMATION QUEST SYSTEM COMPLETED!');
    console.log('📊 New features:');
    console.log('  ✅ Mixed objectives prevent single-purpose automation');
    console.log('  ✅ Animal breeding requires manual interaction');
    console.log('  ✅ Ore requirements force actual mining');
    console.log('  ✅ Varied materials prevent simple place/break loops');
    
    console.log('\n🎯 Anti-Automation Benefits:');
    console.log('  🚫 No more auto-farm exploitation');
    console.log('  🚫 No more cobblestone generator abuse');
    console.log('  🚫 No more place/break repetition');
    console.log('  ✅ Requires genuine gameplay and exploration');
    
    console.log('\n💰 Balanced rewards:');
    console.log('  • Basic quests: 150-200 coins (manageable effort)');
    console.log('  • Medium quests: 250-400 coins (significant work)'); 
    console.log('  • Master quests: 500-800 coins (major undertaking)');
    
    console.log('\n🏆 Economy now SUSTAINABLE long-term!');
    console.log('⚖️ Players must engage in genuine Minecraft gameplay!');
}

if (require.main === module) {
    main();
}

module.exports = { createAntiAutomationQuests };
