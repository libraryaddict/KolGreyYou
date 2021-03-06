import { Location, Familiar } from "kolmafia";
import { QuestInitialStart } from "./custom/QuestInitialStart";
import { QuestAdventure, QuestInfo, QuestStatus } from "./Quests";
import { QuestDungeonsOfDoom } from "./custom/QuestDungeonsOfDoom";
import { QuestGetZapWand } from "./custom/QuestGetZapWand";
import { QuestLocketFantasyBandit } from "./locket/QuestFantasyBandits";
import { QuestNPCStuff } from "./custom/QuestNpcStuff";
import { QuestCustomPurchases } from "./custom/QuestCustomPurchases";
import { QuestGoblinTortureHarem } from "./custom/goblin/QuestGoblinTortureHarem";
import { QuestGoblinTortureLab } from "./custom/goblin/QuestGoblinTortureLab";
import { QuestLocketInfiniteLoop } from "./locket/QuestLocketInfiniteLoop";
import { QuestLocketSystemSweep } from "./locket/QuestLocketSystemSweep";
import { QuestType } from "./QuestTypes";
import { QuestSkillRegistry } from "./skills/QuestSkillRegistry";
import { QuestGrabHippyOutfit } from "./custom/QuestGrabNormalHippyOutfit";
import { QuestGrabBoatVacation } from "./custom/QuestGrabBoatVacation";
import { QuestGrabBoatJunkyard } from "./custom/QuestGrabBoatJunkyard";
import { QuestMirrorDupe } from "./custom/QuestMirrorDupe";
import { QuestPullZappableKey } from "./custom/QuestPullZappableKey";
import { QuestZapKeys } from "./custom/QuestZapKeys";
import { QuestMonsterBait } from "./custom/QuestMonsterBait";
import { QuestFamiliarEquip } from "./custom/QuestFamiliarEquip";
import { QuestFortuneExp } from "./custom/QuestFortuneExp";
import { QuestPowerLeveling } from "./custom/QuestPowerLeveling";
import { QuestBugbearBakery } from "./custom/QuestBugbearBakery";
import { QuestMoonSign } from "./custom/QuestMoonSign";
import { QuestAbsorbCanadiaMonster } from "./absorbs/QuestAbsorbCanadiaMonster";
import { QuestAbsorbStarMonster } from "./absorbs/QuestAbsorbStarMonster";
import { QuestFantasyRealm } from "./council/tower/keys/QuestFantasyRealm";
import { QuestBugbearAbsorb } from "./absorbs/QuestBugbearAbsorb";
import { QuestJuneCleaver } from "./custom/QuestJuneCleaver";

export class QuestsCustom implements QuestInfo {
  // This is a wrapper class around some of our custom routing goals. Like combat locket or so.

  quests: QuestInfo[] = [];

  constructor() {
    this.quests.push(new QuestInitialStart());
    this.quests.push(new QuestLocketInfiniteLoop());
    this.quests.push(new QuestLocketFantasyBandit());
    this.quests.push(new QuestLocketSystemSweep());
    this.quests.push(new QuestGoblinTortureHarem());
    this.quests.push(new QuestGoblinTortureLab());
    this.quests.push(new QuestDungeonsOfDoom());
    this.quests.push(new QuestGetZapWand());
    this.quests.push(new QuestNPCStuff());
    this.quests.push(new QuestCustomPurchases());
    this.quests.push(new QuestGrabHippyOutfit());
    this.quests.push(new QuestGrabBoatVacation());
    this.quests.push(new QuestGrabBoatJunkyard());
    this.quests.push(new QuestMirrorDupe());
    this.quests.push(new QuestPullZappableKey());
    this.quests.push(new QuestZapKeys());
    this.quests.push(new QuestSkillRegistry());
    this.quests.push(new QuestMonsterBait());
    this.quests.push(new QuestFamiliarEquip());
    this.quests.push(new QuestFortuneExp());
    this.quests.push(new QuestPowerLeveling(4));
    this.quests.push(new QuestBugbearBakery());
    this.quests.push(new QuestMoonSign());
    this.quests.push(new QuestAbsorbCanadiaMonster());
    this.quests.push(new QuestAbsorbStarMonster());
    this.quests.push(new QuestBugbearAbsorb());
    this.quests.push(new QuestFantasyRealm());
    this.quests.push(new QuestJuneCleaver());
  }

  level(): number {
    return -1;
  }

  status(): QuestStatus {
    return QuestStatus.COMPLETED;
  }

  run(): QuestAdventure {
    throw new Error("Method not implemented.");
  }

  getId(): QuestType {
    return "Misc / Custom";
  }

  getLocations(): Location[] {
    return [];
  }

  getChildren(): QuestInfo[] {
    return this.quests;
  }
}
