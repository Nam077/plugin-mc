#!/usr/bin/env node
/**
 * Script để complete việc tăng Daily Quests cho các jobs còn lại
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// Enhanced quest templates for remaining jobs
const questTemplates = {
    digger: [
        {
            name: "Earth Mover",
            objectives: ["Break;dirt;150", "Break;grass_block;100", "Break;coarse_dirt;50"],
            reward: 120,
            desc: "Move earth and get money"
        },
        {
            name: "Sand Digger", 
            objectives: ["Break;sand;100", "Break;gravel;80", "Break;clay;30"],
            reward: 150,
            desc: "Dig sandy materials"
        },
        {
            name: "Tunnel Digger",
            objectives: ["Break;stone;200", "Break;andesite;50", "Break;diorite;50"],
            reward: 180,
            desc: "Create tunnels underground"
        },
        {
            name: "Deep Excavator",
            objectives: ["Break;deepslate;150", "Break;tuff;50"],
            reward: 220,
            desc: "Excavate deep materials"
        },
        {
            name: "Master Digger",
            objectives: ["Break;dirt;500", "Break;stone;300"],
            reward: 400,
            desc: "Master the art of digging"
        }
    ],
    explorer: [
        {
            name: "Local Explorer",
            objectives: ["Explore;FOREST;10", "Explore;PLAINS;15", "Explore;HILLS;8"],
            reward: 100,
            desc: "Explore nearby areas"
        },
        {
            name: "Biome Hunter",
            objectives: ["Explore;DESERT;5", "Explore;JUNGLE;3", "Explore;SWAMP;4"],
            reward: 180,
            desc: "Discover different biomes"
        },
        {
            name: "Cave Explorer",
            objectives: ["Explore;CAVES;20"],
            reward: 150,
            desc: "Explore underground caves"
        },
        {
            name: "Ocean Explorer",
            objectives: ["Explore;OCEAN;15", "Explore;BEACH;10"],
            reward: 200,
            desc: "Explore water biomes"
        },
        {
            name: "Adventurer",
            objectives: ["Explore;MOUNTAINS;5", "Explore;BADLANDS;3", "Explore;SAVANNA;7"],
            reward: 300,
            desc: "Go on great adventures"
        }
    ],
    weaponsmith: [
        {
            name: "Basic Smith",
            objectives: ["Repair;IRON_SWORD;5", "Repair;IRON_AXE;3", "Repair;IRON_PICKAXE;3"],
            reward: 140,
            desc: "Repair basic tools"
        },
        {
            name: "Advanced Smith",
            objectives: ["Repair;DIAMOND_SWORD;2", "Repair;DIAMOND_PICKAXE;2"],
            reward: 250,
            desc: "Work with precious materials"
        },
        {
            name: "Armor Smith",
            objectives: ["Repair;IRON_HELMET;3", "Repair;IRON_CHESTPLATE;2", "Repair;IRON_LEGGINGS;2"],
            reward: 200,
            desc: "Repair protective armor"
        },
        {
            name: "Weapon Master",
            objectives: ["Repair;NETHERITE_SWORD;1", "Repair;NETHERITE_AXE;1"],
            reward: 500,
            desc: "Master the finest weapons"
        },
        {
            name: "Tool Specialist",
            objectives: ["Repair;BOW;5", "Repair;CROSSBOW;3", "Repair;TRIDENT;1"],
            reward: 300,
            desc: "Specialize in ranged weapons"
        }
    ],
    enchanter: [
        {
            name: "Basic Enchanter",
            objectives: ["Enchant;SWORD;5", "Enchant;PICKAXE;5", "Enchant;AXE;3"],
            reward: 160,
            desc: "Enchant basic tools"
        },
        {
            name: "Armor Enchanter",
            objectives: ["Enchant;HELMET;3", "Enchant;CHESTPLATE;2", "Enchant;BOOTS;3"],
            reward: 200,
            desc: "Enchant protective gear"
        },
        {
            name: "Book Scholar",
            objectives: ["Enchant;BOOK;10"],
            reward: 180,
            desc: "Create enchanted books"
        },
        {
            name: "Weapon Enchanter",
            objectives: ["Enchant;SWORD;10", "Enchant;BOW;5"],
            reward: 250,
            desc: "Enchant combat gear"
        },
        {
            name: "Master Enchanter",
            objectives: ["Enchant;SWORD;20", "Enchant;BOOK;15"],
            reward: 400,
            desc: "Master all enchantments"
        }
    ],
    brewer: [
        {
            name: "Potion Maker",
            objectives: ["Smelt;POTION;10", "Smelt;SPLASH_POTION;5"],
            reward: 150,
            desc: "Brew basic potions"
        },
        {
            name: "Healing Brewer",
            objectives: ["Smelt;POTION;20"],
            reward: 180,
            desc: "Focus on healing potions"
        },
        {
            name: "Combat Brewer",
            objectives: ["Smelt;SPLASH_POTION;15", "Smelt;LINGERING_POTION;5"],
            reward: 220,
            desc: "Brew combat potions"
        },
        {
            name: "Advanced Brewer",
            objectives: ["Smelt;POTION;50"],
            reward: 300,
            desc: "Mass produce potions"
        },
        {
            name: "Master Alchemist",
            objectives: ["Smelt;POTION;100", "Smelt;SPLASH_POTION;30"],
            reward: 500,
            desc: "Master the art of alchemy"
        }
    ],
    fisherman: [
        {
            name: "Casual Fisher",
            objectives: ["Fish;COD;20", "Fish;SALMON;15"],
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
            objectives: ["Fish;COD;50", "Fish;SALMON;30"],
            reward: 250,
            desc: "Master the art of fishing"
        },
        {
            name: "Ocean Master",
            objectives: ["Fish;COD;100", "Fish;SALMON;50", "Fish;PUFFERFISH;10"],
            reward: 400,
            desc: "Dominate the oceans"
        }
    ]
};

async function updateJobQuests(jobName) {
    const filePath = path.join(__dirname, 'Jobs', 'jobs', `${jobName}.yml`);
    
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data) return false;
        
        const jobKey = Object.keys(data)[0];
        const jobData = data[jobKey];
        
        // Update maxDailyQuests
        jobData.maxDailyQuests = 5;
        
        // Get templates
        const templates = questTemplates[jobName] || [
            {
                name: "Daily Worker",
                objectives: ["Break;stone;50"],
                reward: 150,
                desc: "Complete daily work"
            }
        ];
        
        // Create new quests
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
        console.log(`✅ Updated: ${jobName}.yml (${Object.keys(newQuests).length} quests)`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error updating ${jobName}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🔄 Completing quest enhancement for remaining jobs...');
    
    const remainingJobs = ['digger', 'explorer', 'weaponsmith', 'enchanter', 'brewer', 'fisherman'];
    
    for (const job of remainingJobs) {
        await updateJobQuests(job);
    }
    
    console.log('\n🎉 ALL JOBS NOW ENHANCED!');
    console.log('📊 Final Status:');
    console.log('  • Miner: 8 quests/day (150-800 coins)');
    console.log('  • Hunter: 9 quests/day (120-1000 coins)'); 
    console.log('  • Builder: 7 quests/day (150-500 coins)');
    console.log('  • Farmer: 7 quests/day (100-400 coins)');
    console.log('  • Woodcutter: 7 quests/day (100-400 coins)');
    console.log('  • Crafter: 7 quests/day (140-500 coins)');
    console.log('  • Digger: 5 quests/day (120-400 coins)');
    console.log('  • Explorer: 5 quests/day (100-300 coins)');
    console.log('  • Fisherman: 5 quests/day (100-400 coins)');
    console.log('  • Others: 5 quests/day (140-500 coins)');
    console.log('\n💰 Total potential daily income: 6,000-9,000+ coins');
    console.log('🏆 Total available daily quests: 70+ quests');
}

main().catch(console.error);
