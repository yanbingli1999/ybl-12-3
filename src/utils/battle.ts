import type { 
  Ship, Enemy, Die, CabinType, DamageResult, BattleLogEntry,
  GameConfig, AllocationResult, EnemyIntent
} from '../types';

export function calculateDamage(
  baseDamage: number,
  attackerCritRate: number,
  defenderEvasion: number,
  defenderDefense: number,
  config: GameConfig,
  guaranteedCrit: boolean = false
): DamageResult {
  if (Math.random() < defenderEvasion) {
    return {
      damage: 0,
      shieldAbsorbed: 0,
      isCrit: false,
      isMiss: true,
    };
  }

  let damage = baseDamage;
  let isCrit = guaranteedCrit || Math.random() < attackerCritRate;

  if (isCrit) {
    damage *= config.critMultiplier;
  }

  damage *= (1 - defenderDefense);
  damage = Math.max(1, Math.floor(damage));

  return {
    damage,
    shieldAbsorbed: 0,
    isCrit,
    isMiss: false,
  };
}

export function applyShieldAbsorption(
  damageResult: DamageResult,
  currentShield: number,
  config: GameConfig
): { damage: number; shieldAbsorbed: number; remainingShield: number } {
  if (damageResult.isMiss || damageResult.damage <= 0) {
    return {
      damage: 0,
      shieldAbsorbed: 0,
      remainingShield: currentShield,
    };
  }

  const absorptionAmount = Math.min(
    damageResult.damage * config.shieldAbsorptionRate,
    currentShield
  );
  const remainingDamage = damageResult.damage - absorptionAmount;
  const remainingShield = currentShield - absorptionAmount;

  return {
    damage: Math.max(0, Math.floor(remainingDamage)),
    shieldAbsorbed: Math.floor(absorptionAmount),
    remainingShield: Math.max(0, remainingShield),
  };
}

export function calculateCabinEffect(
  cabinType: CabinType,
  totalPoints: number,
  ship: Ship,
  enemy: Enemy,
  config: GameConfig
): { 
  effect: string; 
  value: number; 
  type: 'damage' | 'heal' | 'shield' | 'effect';
  isOverheated: boolean;
} {
  const cabin = ship.cabins.find(c => c.type === cabinType);
  if (!cabin || cabin.damaged) {
    return { effect: '舱室已损坏，无法工作', value: 0, type: 'effect', isOverheated: false };
  }

  const isOverheated = totalPoints > config.overheatThreshold;
  const effectivePoints = isOverheated ? 0 : totalPoints;
  const levelMultiplier = 1 + (cabin.level - 1) * 0.2;

  let result: { effect: string; value: number; type: 'damage' | 'heal' | 'shield' | 'effect' };

  switch (cabinType) {
    case 'weapon': {
      const baseDamage = ship.attack + effectivePoints * 3;
      const damage = Math.floor(baseDamage * levelMultiplier);
      result = {
        effect: isOverheated ? '武器舱过热！无法开火' : `武器系统造成 ${damage} 点伤害`,
        value: damage,
        type: 'damage',
      };
      break;
    }
    case 'shield': {
      const shieldGain = Math.floor(effectivePoints * 3 * levelMultiplier);
      result = {
        effect: isOverheated ? '护盾舱过热！无法充能' : `护盾充能 +${shieldGain}`,
        value: shieldGain,
        type: 'shield',
      };
      break;
    }
    case 'repair': {
      const healAmount = Math.floor(effectivePoints * 2 * levelMultiplier);
      result = {
        effect: isOverheated ? '维修舱过热！无法工作' : `船体修复 +${healAmount} HP`,
        value: healAmount,
        type: 'heal',
      };
      break;
    }
    case 'engine': {
      const evasionBonus = effectivePoints * config.engineEvasionBonus * levelMultiplier;
      result = {
        effect: isOverheated ? '引擎舱过热！无法机动' : `引擎推进，闪避率 +${(evasionBonus * 100).toFixed(0)}%`,
        value: evasionBonus,
        type: 'effect',
      };
      break;
    }
    case 'scanner': {
      const evasionReduction = effectivePoints * config.scanEvasionReduction * levelMultiplier;
      result = {
        effect: isOverheated ? '扫描舱过热！无法扫描' : `扫描完成，敌方闪避 -${(evasionReduction * 100).toFixed(0)}%`,
        value: evasionReduction,
        type: 'effect',
      };
      break;
    }
    default:
      result = { effect: '未知舱位', value: 0, type: 'effect' };
  }

  return { ...result, isOverheated };
}

export function checkOverheat(
  dice: Die[],
  cabinType: CabinType,
  config: GameConfig
): boolean {
  const totalPoints = dice
    .filter(d => d.assignedTo === cabinType)
    .reduce((sum, d) => sum + d.value, 0);
  return totalPoints > config.overheatThreshold;
}

export function getAllocations(dice: Die[]): AllocationResult[] {
  const cabinTypes: CabinType[] = ['engine', 'shield', 'weapon', 'repair', 'scanner'];
  
  return cabinTypes.map(type => {
    const assignedDice = dice.filter(d => d.assignedTo === type);
    const totalPoints = assignedDice.reduce((sum, d) => sum + d.value, 0);
    
    return {
      cabinType: type,
      totalPoints,
      diceIds: assignedDice.map(d => d.id),
      isOverheated: false,
    };
  }).filter(a => a.totalPoints > 0);
}

export function executeEnemyIntent(
  enemy: Enemy,
  player: Ship,
  config: GameConfig
): { 
  damageResult: DamageResult; 
  shieldResult: { damage: number; shieldAbsorbed: number; remainingShield: number };
  logs: BattleLogEntry[];
  newPlayerHp: number;
  newPlayerShield: number;
  effect?: string;
} {
  const logs: BattleLogEntry[] = [];
  const intent = enemy.intent;
  
  let baseDamage = 0;
  let guaranteedCrit = false;
  let specialEffect: string | undefined;

  switch (intent.type) {
    case 'attack':
      baseDamage = intent.value;
      logs.push(createLog('enemy', 'damage', `${enemy.name} 发动攻击！`, intent.value, 1));
      break;
    case 'charge':
      baseDamage = intent.value;
      logs.push(createLog('enemy', 'damage', `${enemy.name} 释放蓄力攻击！`, intent.value, 1));
      break;
    case 'defend':
      logs.push(createLog('enemy', 'effect', `${enemy.name} 进入防御姿态，护甲提升`, undefined, 1));
      break;
    case 'special': {
      const expectedAbilityName = intent.description.replace('准备释放 ', '');
      const specialAbility = enemy.abilities.find(
        a => a.name === expectedAbilityName && a.currentCooldown === 0
      );
      if (specialAbility) {
        baseDamage = specialAbility.damage || 0;
        guaranteedCrit = specialAbility.effect === 'crit_guaranteed';
        specialEffect = specialAbility.effect;
        logs.push(createLog('enemy', 'effect', `${enemy.name} 释放 ${specialAbility.name}！`, specialAbility.damage, 1));
      } else {
        logs.push(createLog('enemy', 'effect', `${enemy.name} 蓄力失败：${expectedAbilityName} 冷却中`, undefined, 1));
      }
      break;
    }
    case 'repair':
      logs.push(createLog('enemy', 'heal', `${enemy.name} 进行维修，恢复 ${intent.value} HP`, intent.value, 1));
      break;
  }

  const damageResult = calculateDamage(
    baseDamage,
    0.1,
    player.evasion,
    player.defense,
    config,
    guaranteedCrit
  );

  if (damageResult.isMiss) {
    logs.push(createLog('player', 'miss', '成功闪避！', undefined, 1));
  }

  const shieldResult = applyShieldAbsorption(damageResult, player.shield, config);
  
  if (shieldResult.shieldAbsorbed > 0) {
    logs.push(createLog('player', 'shield', `护盾吸收了 ${shieldResult.shieldAbsorbed} 点伤害`, shieldResult.shieldAbsorbed, 1));
  }

  if (damageResult.isCrit && !damageResult.isMiss) {
    logs.push(createLog('enemy', 'crit', '暴击！', damageResult.damage, 1));
  }

  const newPlayerHp = Math.max(0, player.hp - shieldResult.damage);
  const newPlayerShield = shieldResult.remainingShield;

  if (shieldResult.damage > 0) {
    logs.push(createLog('player', 'damage', `受到 ${shieldResult.damage} 点伤害`, shieldResult.damage, 1));
  }

  return {
    damageResult,
    shieldResult,
    logs,
    newPlayerHp,
    newPlayerShield,
    effect: specialEffect,
  };
}

export function executePlayerActions(
  dice: Die[],
  player: Ship,
  enemy: Enemy,
  config: GameConfig
): {
  logs: BattleLogEntry[];
  newPlayer: Ship;
  newEnemy: Enemy;
  totalDamageDealt: number;
  totalHealDone: number;
  totalShieldGained: number;
  damagedCabins: CabinType[];
  energyUsed: number;
} {
  const logs: BattleLogEntry[] = [];
  let newPlayer = { ...player };
  let newEnemy = { ...enemy };
  let totalDamageDealt = 0;
  let totalHealDone = 0;
  let totalShieldGained = 0;
  const damagedCabins: CabinType[] = [];
  let playerEvasionBonus = 0;
  let enemyEvasionReduction = 0;

  const totalDicePoints = dice.reduce((sum, d) => sum + d.value, 0);
  const energyCost = Math.floor(totalDicePoints * config.energyCostPerPoint);
  const actualEnergyCost = Math.min(newPlayer.energy, energyCost);
  const energyBefore = newPlayer.energy;
  newPlayer.energy = Math.max(0, newPlayer.energy - actualEnergyCost);

  // #region debug-point H1:energy-cost
  fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"battle-mechanics-bugs",runId:"pre-fix",hypothesisId:"H1",location:"battle.ts:282",msg:"[DEBUG] Energy cost calculation",data:{totalDicePoints,energyCostPerPoint:config.energyCostPerPoint,energyCost,actualEnergyCost,energyBefore,energyAfter:newPlayer.energy},ts:Date.now()})}).catch(()=>{});
  // #endregion

  if (actualEnergyCost > 0) {
    logs.push(createLog('player', 'effect', `消耗 ${actualEnergyCost} 能量`, actualEnergyCost, 1));
  }

  const energyShortage = energyCost > player.energy;
  const efficiencyPenalty = energyShortage ? 0.5 : 1;

  const allocations = getAllocations(dice);

  for (const allocation of allocations) {
    const cabin = player.cabins.find(c => c.type === allocation.cabinType);
    if (!cabin) continue;

    if (cabin.damaged) {
      logs.push(createLog('system', 'effect', `${cabin.name} 已损坏，无法工作`, undefined, 1));
      continue;
    }

    const isOverheated = allocation.totalPoints > config.overheatThreshold;
    if (isOverheated) {
      damagedCabins.push(allocation.cabinType);
      logs.push(createLog('system', 'effect', `${cabin.name} 过热损坏！需要 ${config.repairCooldown} 回合冷却`, undefined, 1));
    }

    const effect = calculateCabinEffect(
      allocation.cabinType,
      allocation.totalPoints * efficiencyPenalty,
      newPlayer,
      newEnemy,
      config
    );

    logs.push(createLog('player', effect.type, effect.effect, effect.value, 1));

    switch (allocation.cabinType) {
      case 'weapon': {
        if (!isOverheated) {
          const weaponDice = dice.filter(d => d.assignedTo === 'weapon');
          const sixCount = weaponDice.filter(d => d.value === 6).length;
          const bonusCritRate = sixCount * config.critBonusRate;
          const guaranteedCrit = sixCount >= 2;
          const totalCritRate = Math.min(0.9, player.critRate + bonusCritRate);

          // #region debug-point H2:six-crit-calc
          fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"battle-mechanics-bugs",runId:"pre-fix",hypothesisId:"H2",location:"battle.ts:324",msg:"[DEBUG] Six-dice crit rate calculation",data:{weaponDice:weaponDice.map(d=>({id:d.id,value:d.value})),sixCount,bonusCritRate,baseCritRate:player.critRate,totalCritRate,critBonusRate:config.critBonusRate},ts:Date.now()})}).catch(()=>{});
          // #endregion

          const damageResult = calculateDamage(
            effect.value,
            totalCritRate,
            Math.max(0, newEnemy.evasion - enemyEvasionReduction),
            newEnemy.defense,
            config,
            guaranteedCrit
          );

          if (damageResult.isMiss) {
            logs.push(createLog('enemy', 'miss', '敌方闪避了攻击！', undefined, 1));
          } else {
            const shieldAbsorption = applyShieldAbsorption(damageResult, newEnemy.shield, config);
            
            if (shieldAbsorption.shieldAbsorbed > 0) {
              logs.push(createLog('enemy', 'shield', `敌方护盾吸收 ${shieldAbsorption.shieldAbsorbed} 伤害`, shieldAbsorption.shieldAbsorbed, 1));
            }
            
            if (damageResult.isCrit) {
              logs.push(createLog('player', 'crit', '暴击！', damageResult.damage, 1));
            }

            // #region debug-point H2:crit-result
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"battle-mechanics-bugs",runId:"pre-fix",hypothesisId:"H2",location:"battle.ts:346",msg:"[DEBUG] Crit result",data:{damage:damageResult.damage,isCrit:damageResult.isCrit,isMiss:damageResult.isMiss,shieldAbsorbed:0},ts:Date.now()})}).catch(()=>{});
            // #endregion

            newEnemy.shield = shieldAbsorption.remainingShield;
            newEnemy.hp = Math.max(0, newEnemy.hp - shieldAbsorption.damage);
            totalDamageDealt += shieldAbsorption.damage;
            
            if (shieldAbsorption.damage > 0) {
              logs.push(createLog('enemy', 'damage', `敌方受到 ${shieldAbsorption.damage} 点伤害`, shieldAbsorption.damage, 1));
            }
          }
        }
        break;
      }
      case 'shield': {
        if (!isOverheated) {
          const shieldGain = Math.min(effect.value, newPlayer.maxShield - newPlayer.shield);
          newPlayer.shield = Math.min(newPlayer.maxShield, newPlayer.shield + effect.value);
          totalShieldGained += shieldGain;
        }
        break;
      }
      case 'repair': {
        if (!isOverheated) {
          const healAmount = Math.min(effect.value, newPlayer.maxHp - newPlayer.hp);
          newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + effect.value);
          totalHealDone += healAmount;
          
          newPlayer.cabins = newPlayer.cabins.map(c => {
            if (c.damaged && c.cooldown > 0) {
              return { ...c, cooldown: c.cooldown - 1, damaged: c.cooldown - 1 > 0 };
            }
            return c;
          });
        }
        break;
      }
      case 'engine': {
        if (!isOverheated) {
          playerEvasionBonus += effect.value;
        }
        break;
      }
      case 'scanner': {
        if (!isOverheated) {
          enemyEvasionReduction += effect.value;
        }
        break;
      }
    }
  }

  newPlayer.evasion = Math.min(0.8, player.evasion + playerEvasionBonus);
  newEnemy.evasion = Math.max(0, enemy.evasion - enemyEvasionReduction);

  newPlayer.cabins = newPlayer.cabins.map(c => {
    if (damagedCabins.includes(c.type)) {
      return { ...c, damaged: true, cooldown: config.repairCooldown };
    }
    if (c.cooldown > 0 && c.damaged) {
      const newCooldown = c.cooldown - 1;
      return { ...c, cooldown: newCooldown, damaged: newCooldown > 0 };
    }
    return c;
  });

  newEnemy.abilities = newEnemy.abilities.map(a => ({
    ...a,
    currentCooldown: Math.max(0, a.currentCooldown - 1),
  }));

  return {
    logs,
    newPlayer,
    newEnemy,
    totalDamageDealt,
    totalHealDone,
    totalShieldGained,
    damagedCabins,
    energyUsed: actualEnergyCost,
  };
}

function createLog(
  source: 'player' | 'enemy' | 'system',
  type: BattleLogEntry['type'],
  message: string,
  value?: number,
  turn: number = 1
): BattleLogEntry {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    turn,
    type,
    source,
    message,
    value,
    timestamp: Date.now(),
  };
}

export function checkBattleEnd(player: Ship, enemy: Enemy): 'ongoing' | 'victory' | 'defeat' {
  if (player.hp <= 0) return 'defeat';
  if (enemy.hp <= 0) return 'victory';
  return 'ongoing';
}

export function calculateReward(result: 'victory' | 'defeat' | 'fled', turns: number, difficulty: number): number {
  if (result === 'defeat') return 0;
  if (result === 'fled') return 0;
  
  const baseReward = 10 * difficulty;
  const turnBonus = Math.max(0, 10 - turns) * difficulty;
  return baseReward + turnBonus;
}

export function getIntentIcon(intent: EnemyIntent): string {
  return intent.icon;
}

export function getIntentColor(intent: EnemyIntent): string {
  switch (intent.type) {
    case 'attack': return 'text-neon-red';
    case 'defend': return 'text-neon-blue';
    case 'charge': return 'text-neon-yellow';
    case 'special': return 'text-neon-purple';
    case 'repair': return 'text-neon-green';
    default: return 'text-gray-400';
  }
}
