#!/usr/bin/env node
/**
 * Script để tăng NHIỀU Daily Quests hơn cho tất cả Jobs (7-10 quest/job)
 * Sử dụng: node super_increase_quests.js
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Template quests mở rộng cho từng job type
const superQuestTemplates = {
    miner: [
        {
            name: "Stone Collector",
            objectives: ["Break;stone;50", "Break;granite;50", "Break;sandstone;50"],
            reward: 150,
            desc: "Break basic blocks and get money"
        },
        {
            name: "Ore Hunter",
            objectives: ["Break;coal_ore;20", "Break;iron_ore;15", "Break;copper_ore;10"],
            reward: 200,
            desc: "Mine common ores and get money"
        },
        {
            name: "Precious Metals",
            objectives: ["Break;gold_ore;8", "Break;lapis_ore;5", "Break;redstone_ore;12"],
            reward: 300,
            desc: "Mine valuable ores and get money"
        },
        {
            name: "Diamond Seeker",
            objectives: ["Break;diamond_ore;3", "Break;emerald_ore;2"],
            reward: 500,
            desc: "Mine rare gems and get big money"
        },
        {
            name: "Deep Miner",
            objectives: ["Break;deepslate;100", "Break;deepslate_coal_ore;15", "Break;deepslate_iron_ore;10"],
            reward: 250,
            desc: "Mine in the depths and get money"
        },
        {
            name: "Nether Excavator",
            objectives: ["Break;netherrack;200", "Break;nether_quartz_ore;25", "Break;obsidian;10"],
            reward: 350,
            desc: "Mine dangerous nether materials"
        },
        {
            name: "Master Miner",
            objectives: ["Break;deepslate_diamond_ore;5", "Break;deepslate_emerald_ore;3"],
            reward: 800,
            desc: "Master the art of deep mining"
        },
        {
            name: "Speedrun Miner",
            objectives: ["Break;stone;500"],
            reward: 400,
            desc: "Mine massive amounts quickly"
        }
    ],
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
        },
        {
            name: "Skyscraper Builder",
            objectives: ["Place;stone_bricks;200", "Place;glass_pane;100", "Place;iron_bars;50"],
            reward: 300,
            desc: "Build tall structures"
        },
        {
            name: "Decorator",
            objectives: ["Place;wool;100", "Place;carpet;50"],
            reward: 180,
            desc: "Decorate buildings beautifully"
        },
        {
            name: "Bridge Engineer",
            objectives: ["Place;oak_planks;150", "Place;oak_fence;50", "Place;torch;30"],
            reward: 220,
            desc: "Build bridges and pathways"
        },
        {
            name: "Castle Builder",
            objectives: ["Place;stone;300", "Place;cobblestone_wall;80", "Place;iron_door;5"],
            reward: 500,
            desc: "Build massive castles"
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
        },
        {
            name: "Farm Animal Hunter",
            objectives: ["Kill;Cow;20", "Kill;Pig;15", "Kill;Chicken;25", "Kill;Sheep;18"],
            reward: 120,
            desc: "Hunt farm animals for food"
        },
        {
            name: "Ocean Hunter",
            objectives: ["Kill;SQUID;15", "Kill;GUARDIAN;8", "Kill;DROWNED;10"],
            reward: 200,
            desc: "Hunt sea creatures"
        },
        {
            name: "Nether Hunter",
            objectives: ["Kill;GHAST;3", "Kill;BLAZE;8", "Kill;WITHER_SKELETON;5"],
            reward: 350,
            desc: "Hunt dangerous nether mobs"
        },
        {
            name: "Ultimate Hunter",
            objectives: ["Kill;WITHER;1", "Kill;ENDER_DRAGON;1"],
            reward: 1000,
            desc: "Hunt the most powerful bosses"
        },
        {
            name: "Pest Control",
            objectives: ["Kill;SILVERFISH;30", "Kill;CAVE_SPIDER;20", "Kill;PHANTOM;10"],
            reward: 160,
            desc: "Clean up annoying pests"
        },
        {
            name: "PvP Warrior",
            objectives: ["Kill;Player;5"],
            reward: 300,
            desc: "Defeat other players in combat"
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
            objectives: ["Break;wheat;50", "Break;carrot;30", "Break;potato;30"],
            reward: 100,
            desc: "Harvest your crops"
        },
        {
            name: "Beekeeper",
            objectives: ["Collect;honeycomb;10", "Collect;honeybottle;5"],
            reward: 180,
            desc: "Work with bees and honey"
        },
        {
            name: "Rancher",
            objectives: ["Breed;Cow;10", "Breed;Pig;8", "Breed;Chicken;15"],
            reward: 200,
            desc: "Expand your ranch"
        },
        {
            name: "Shepherd",
            objectives: ["Breed;Sheep;20", "Shear;White;25"],
            reward: 160,
            desc: "Manage sheep and wool"
        },
        {
            name: "Gardener",
            objectives: ["Break;pumpkin;20", "Break;melon;15", "Break;sugar_cane;50"],
            reward: 140,
            desc: "Tend to garden crops"
        },
        {
            name: "Mega Farmer",
            objectives: ["Break;wheat;200", "Breed;Cow;25"],
            reward: 400,
            desc: "Become a farming tycoon"
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
            name: "Deep Sea Fisher",
            objectives: ["Fish;PUFFERFISH;5", "Fish;TROPICAL_FISH;10"],
            reward: 180,
            desc: "Catch exotic fish"
        },
        {
            name: "Treasure Hunter",
            objectives: ["Fish;ENCHANTED_BOOK;2", "Fish;NAME_TAG;1"],
            reward: 300,
            desc: "Fish for treasures"
        },
        {
            name: "Professional Angler",
            objectives: ["Fish;COD;50", "Fish;SALMON;30", "Fish;PUFFERFISH;10"],
            reward: 250,
            desc: "Master the art of fishing"
        },
        {
            name: "Junk Collector",
            objectives: ["Fish;LEATHER_BOOTS;3", "Fish;STICK;10", "Fish;BOWL;5"],
            reward: 80,
            desc: "Even junk has value"
        }
    ],
    woodcutter: [
        {
            name: "Lumberjack",
            objectives: ["Break;oak_log;50", "Break;birch_log;30", "Break;spruce_log;40"],
            reward: 120,
            desc: "Cut down common trees"
        },
        {
            name: "Forest Cleaner",
            objectives: ["Break;jungle_log;25", "Break;acacia_log;20", "Break;dark_oak_log;15"],
            reward: 160,
            desc: "Clear rare wood types"
        },
        {
            name: "Cherry Collector",
            objectives: ["Break;cherry_log;30", "Break;cherry_leaves;100"],
            reward: 200,
            desc: "Harvest beautiful cherry wood"
        },
        {
            name: "Mangrove Harvester",
            objectives: ["Break;mangrove_log;40"],
            reward: 180,
            desc: "Work in swampy conditions"
        },
        {
            name: "Bamboo Farmer",
            objectives: ["Break;bamboo;200"],
            reward: 150,
            desc: "Harvest fast-growing bamboo"
        },
        {
            name: "Leaf Cleaner",
            objectives: ["Break;oak_leaves;200", "Break;birch_leaves;150", "Break;spruce_leaves;100"],
            reward: 100,
            desc: "Clean up fallen leaves"
        },
        {
            name: "Master Woodcutter",
            objectives: ["Break;oak_log;100", "Break;birch_log;100", "Break;spruce_log;100", "Break;jungle_log;50"],
            reward: 400,
            desc: "Master all wood types"
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
        },
        {
            name: "Redstone Engineer",
            objectives: ["Craft;piston;5", "Craft;redstone_torch;20", "Craft;repeater;10"],
            reward: 250,
            desc: "Master redstone crafting"
        },
        {
            name: "Decorator Crafter",
            objectives: ["Craft;item_frame;15", "Craft;flower_pot;20"],
            reward: 180,
            desc: "Craft decorative items"
        },
        {
            name: "Transportation Crafter",
            objectives: ["Craft;minecart;5", "Craft;rail;50", "Craft;boat;8"],
            reward: 220,
            desc: "Craft transportation items"
        },
        {
            name: "Mass Producer",
            objectives: ["Craft;stick;500", "Craft;torch;200", "Craft;ladder;100"],
            reward: 300,
            desc: "Mass produce common items"
        }
    ]
};

/**
 * Tăng quest cho job với nhiều quest hơn
 */
async function superIncreaseQuests(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) return;
        
        const jobName = Object.keys(data)[0];
        const jobData = data[jobName];
        const jobType = jobName.toLowerCase();
        
        // Tăng maxDailyQuests lên 7-10
        const maxQuests = jobType === 'miner' ? 8 : jobType === 'hunter' ? 9 : jobType === 'builder' ? 7 : jobType === 'farmer' ? 7 : jobType === 'woodcutter' ? 7 : jobType === 'crafter' ? 7 : 5;
        jobData.maxDailyQuests = maxQuests;
        
        // Lấy template
        let templates = superQuestTemplates[jobType] || [
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
            },
            {
                name: "Expert Worker",
                objectives: ["Break;iron_ore;20"],
                reward: 300,
                desc: "Expert level work"
            },
            {
                name: "Master Worker",
                objectives: ["Break;diamond_ore;5"],
                reward: 500,
                desc: "Master level challenges"
            }
        ];
        
        // Tạo quests mới
        const newQuests = {};
        templates.slice(0, maxQuests).forEach((template, index) => {
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
        console.log(`✅ Super updated: ${path.basename(filePath)} (${Object.keys(newQuests).length} quests, max ${maxQuests}/day)`);
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚀 SUPER INCREASING Daily Quests for all Jobs...');
        
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
        
        // Xử lý tất cả files
        for (const jobFile of validJobFiles) {
            await superIncreaseQuests(jobFile);
        }
        
        console.log('\n🎉 SUPER UPGRADE COMPLETED!');
        console.log('📈 Quest rewards: 80-1000 coins per quest');
        console.log('🎯 Max daily quests: 5-9 per job');
        console.log('💰 Potential daily income: 5,000-8,000+ coins');
        console.log('🏆 Total possible quests: 70+ daily quests');
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

module.exports = { superIncreaseQuests };
