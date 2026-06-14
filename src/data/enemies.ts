import type { Enemy, EnemyIntent } from '../types';

interface EnemyTemplate {
  id: string;
  name: string;
  type: string;
  hp: number;
  shield: number;
  attack: number;
  defense: number;
  evasion: number;
  description: string;
  sprite: string;
  abilities: Array<{
    id: string;
    name: string;
    description: string;
    cooldown: number;
    damage?: number;
    effect?: string;
  }>;
  intentWeights: Record<string, number>;
}

export const enemyTemplates: EnemyTemplate[] = [
  {
    id: 'scout_drone',
    name: '侦察无人机',
    type: 'drone',
    hp: 30,
    shield: 10,
    attack: 8,
    defense: 0,
    evasion: 0.2,
    description: '轻型侦察单位，速度快但装甲薄弱',
    sprite: '🛸',
    abilities: [],
    intentWeights: {
      attack: 0.7,
      defend: 0.2,
      charge: 0.1,
    },
  },
  {
    id: 'fighter',
    name: '星际战斗机',
    type: 'fighter',
    hp: 50,
    shield: 20,
    attack: 12,
    defense: 0.1,
    evasion: 0.15,
    description: '标准战斗单位，攻防平衡',
    sprite: '🚀',
    abilities: [
      {
        id: 'missile_volley',
        name: '导弹齐射',
        description: '发射多枚导弹造成高额伤害',
        cooldown: 3,
        damage: 20,
      },
    ],
    intentWeights: {
      attack: 0.5,
      defend: 0.2,
      charge: 0.15,
      special: 0.15,
    },
  },
  {
    id: 'cruiser',
    name: '重型巡洋舰',
    type: 'cruiser',
    hp: 100,
    shield: 50,
    attack: 18,
    defense: 0.2,
    evasion: 0.05,
    description: '装甲厚重的主力战舰，火力强大',
    sprite: '🛳️',
    abilities: [
      {
        id: 'main_cannon',
        name: '主炮轰击',
        description: '主炮充能后发射，造成毁灭性伤害',
        cooldown: 4,
        damage: 35,
      },
      {
        id: 'shield_recharge',
        name: '护盾充能',
        description: '紧急充能恢复护盾',
        cooldown: 3,
        effect: 'heal_shield',
      },
    ],
    intentWeights: {
      attack: 0.4,
      defend: 0.3,
      charge: 0.15,
      special: 0.1,
      repair: 0.05,
    },
  },
  {
    id: 'pirate_raider',
    name: '海盗突袭者',
    type: 'raider',
    hp: 40,
    shield: 15,
    attack: 15,
    defense: 0.05,
    evasion: 0.25,
    description: '神出鬼没的海盗船，擅长暴击',
    sprite: '🏴‍☠️',
    abilities: [
      {
        id: 'plunder',
        name: '掠夺攻击',
        description: '偷袭造成暴击伤害',
        cooldown: 2,
        damage: 25,
        effect: 'crit_guaranteed',
      },
    ],
    intentWeights: {
      attack: 0.6,
      charge: 0.25,
      special: 0.15,
    },
  },
  {
    id: 'alien_mothership',
    name: '异形母舰',
    type: 'boss',
    hp: 200,
    shield: 100,
    attack: 25,
    defense: 0.3,
    evasion: 0.1,
    description: '来自深空的神秘战舰，拥有未知的科技',
    sprite: '👾',
    abilities: [
      {
        id: 'plasma_burst',
        name: '等离子爆发',
        description: '释放等离子能量波，伤害并削弱目标',
        cooldown: 3,
        damage: 30,
        effect: 'reduce_evasion',
      },
      {
        id: 'hull_regeneration',
        name: '船体再生',
        description: '纳米机器人修复船体损伤',
        cooldown: 4,
        effect: 'heal_hp',
      },
      {
        id: 'graviton_pulse',
        name: '引力脉冲',
        description: '扰乱敌方系统，损坏随机舱室',
        cooldown: 5,
        effect: 'damage_cabin',
      },
    ],
    intentWeights: {
      attack: 0.35,
      defend: 0.2,
      charge: 0.15,
      special: 0.2,
      repair: 0.1,
    },
  },
];

export function createEnemy(templateId: string): Enemy {
  const template = enemyTemplates.find(t => t.id === templateId) || enemyTemplates[0];
  
  const enemy: Enemy = {
    id: `${template.id}_${Date.now()}`,
    name: template.name,
    type: template.type,
    hp: template.hp,
    maxHp: template.hp,
    shield: template.shield,
    maxShield: template.shield,
    attack: template.attack,
    defense: template.defense,
    evasion: template.evasion,
    description: template.description,
    sprite: template.sprite,
    intent: {
      type: 'attack',
      value: template.attack,
      description: '准备攻击',
      icon: '⚔️',
    },
    abilities: template.abilities.map(a => ({
      ...a,
      currentCooldown: 0,
    })),
  };
  
  return generateEnemyIntent(enemy, template.intentWeights);
}

export function generateEnemyIntent(
  enemy: Enemy,
  weights?: Record<string, number>
): Enemy {
  const defaultWeights: Record<string, number> = {
    attack: 0.5,
    defend: 0.25,
    charge: 0.15,
    special: 0.1,
  };
  
  const useWeights = weights || defaultWeights;
  const totalWeight = Object.values(useWeights).reduce((sum, w) => sum + w, 0);
  
  let random = Math.random() * totalWeight;
  let selectedType = 'attack';
  
  for (const [type, weight] of Object.entries(useWeights)) {
    random -= weight;
    if (random <= 0) {
      selectedType = type;
      break;
    }
  }
  
  let availableSpecial = enemy.abilities.filter(a => a.currentCooldown === 0);
  if (selectedType === 'special' && availableSpecial.length === 0) {
    selectedType = 'attack';
  }
  
  const hpPercent = enemy.hp / enemy.maxHp;
  if (hpPercent < 0.3 && Math.random() < 0.3) {
    selectedType = 'defend';
  }
  
  let forcedSpecial: typeof availableSpecial[0] | undefined;
  
  if (enemy.shield < enemy.maxShield * 0.2 && Math.random() < 0.2) {
    const repairAbility = enemy.abilities.find(a => a.effect === 'heal_shield' && a.currentCooldown === 0);
    if (repairAbility) {
      selectedType = 'special';
      forcedSpecial = repairAbility;
    }
  }
  
  if (hpPercent < 0.25 && !forcedSpecial && Math.random() < 0.25) {
    const healAbility = enemy.abilities.find(a => a.effect === 'heal_hp' && a.currentCooldown === 0);
    if (healAbility) {
      selectedType = 'special';
      forcedSpecial = healAbility;
    }
  }
  
  availableSpecial = enemy.abilities.filter(a => a.currentCooldown === 0);
  if (selectedType === 'special' && availableSpecial.length === 0) {
    selectedType = 'attack';
    forcedSpecial = undefined;
  }
  
  let intent: EnemyIntent;
  
  switch (selectedType) {
    case 'attack':
      intent = {
        type: 'attack',
        value: Math.floor(enemy.attack * (0.8 + Math.random() * 0.4)),
        description: '准备攻击',
        icon: '⚔️',
      };
      break;
    case 'defend':
      intent = {
        type: 'defend',
        value: Math.floor(enemy.attack * 0.5),
        description: '进入防御姿态',
        icon: '🛡️',
      };
      break;
    case 'charge':
      intent = {
        type: 'charge',
        value: Math.floor(enemy.attack * 1.5),
        description: '蓄力中...',
        icon: '⚡',
      };
      break;
    case 'special':
      const special = forcedSpecial || availableSpecial[Math.floor(Math.random() * availableSpecial.length)];
      intent = {
        type: 'special',
        value: special.damage || 0,
        description: `准备释放 ${special.name}`,
        icon: '💥',
      };
      break;
    case 'repair':
      intent = {
        type: 'repair',
        value: Math.floor(enemy.maxHp * 0.1),
        description: '进行维修',
        icon: '🔧',
      };
      break;
    default:
      intent = {
        type: 'attack',
        value: enemy.attack,
        description: '准备攻击',
        icon: '⚔️',
      };
  }
  
  return {
    ...enemy,
    intent,
  };
}

export function getRandomEnemy(difficulty: number = 1): Enemy {
  const availableEnemies = enemyTemplates.filter(e => {
    if (difficulty <= 1) return ['scout_drone', 'fighter'].includes(e.id);
    if (difficulty <= 2) return ['scout_drone', 'fighter', 'pirate_raider'].includes(e.id);
    if (difficulty <= 3) return ['fighter', 'pirate_raider', 'cruiser'].includes(e.id);
    return true;
  });
  
  const template = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
  const enemy = createEnemy(template.id);
  
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2;
  enemy.hp = Math.floor(enemy.hp * difficultyMultiplier);
  enemy.maxHp = enemy.hp;
  enemy.shield = Math.floor(enemy.shield * difficultyMultiplier);
  enemy.maxShield = enemy.shield;
  enemy.attack = Math.floor(enemy.attack * difficultyMultiplier);
  
  return enemy;
}
