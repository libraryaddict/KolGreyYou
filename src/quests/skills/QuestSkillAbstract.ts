import { canAdv } from "canadv.ash";
import { Location, Familiar, Monster, Skill, haveSkill, print } from "kolmafia";
import { AdventureSettings, greyAdv } from "../../utils/GreyLocations";
import { GreyOutfit } from "../../utils/GreyOutfitter";
import { QuestAdventure, QuestInfo, QuestStatus } from "../Quests";
import { QuestType } from "../QuestTypes";

export class QuestSkillAbstract implements QuestInfo {
  requiredLevel: number;
  location: Location;
  monster: Monster;
  skill: Skill;
  questName: QuestType;

  constructor(
    level: number,
    location: Location,
    monster: Monster,
    skill: Skill,
    questName: QuestType
  ) {
    this.requiredLevel = level;
    this.location = location;
    this.monster = monster;
    this.skill = skill;
    this.questName = questName;
  }

  getId(): QuestType {
    return this.questName;
  }

  level(): number {
    return this.requiredLevel;
  }

  status(): QuestStatus {
    if (haveSkill(this.skill)) {
      return QuestStatus.COMPLETED;
    }

    if (!canAdv(this.location)) {
      return QuestStatus.NOT_READY;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    let outfit = new GreyOutfit();

    if (this.location.combatPercent < 100) {
      outfit.setPlusCombat();
    }

    return {
      location: this.location,
      outfit: outfit,
      run: () => {
        let settings = new AdventureSettings();
        settings.addNoBanish(this.monster);

        greyAdv(this.location, outfit, settings);
      },
    };
  }

  getLocations(): Location[] {
    return [this.location];
  }
}
