import {
  Familiar,
  getProperty,
  haveSkill,
  Item,
  Location,
  Monster,
  myFamiliar,
  Skill,
  toInt,
} from "kolmafia";
import { hasNonCombatSkillsReady } from "../../../GreyAdventurer";
import { greyKillingBlow } from "../../../utils/GreyCombat";
import { AdventureSettings, greyAdv } from "../../../utils/GreyLocations";
import { GreyOutfit } from "../../../utils/GreyOutfitter";
import { Macro } from "../../../utils/MacroBuilder";
import { QuestAdventure, QuestInfo, QuestStatus } from "../../Quests";
import { QuestType } from "../../QuestTypes";
import { CryptL7Template } from "./CryptTemplate";

export class CryptL7DirtyMan extends CryptL7Template {
  loc: Location = Location.get("The Defiled Niche");
  sniffer: Familiar = Familiar.get("Nosy Nose");
  dirty: Monster = Monster.get("dirty old lihc");
  sniff: Skill = Skill.get("Get a Good Whiff of This Guy");
  banisher: Skill = Skill.get("System Sweep");
  fire: Item = Item.get("industrial fire extinguisher");

  run(): QuestAdventure {
    let outfit = this.addRetroSword();

    if (this.canSprayDown()) {
      outfit.addItem(this.fire);
    }

    let fam = null;
    /*  toInt(getProperty(this.getProperty())) >
      (getProperty("nosyNoseMonster") != "dirty old lihc" ? 31 : 27)
        ? this.sniffer
        : null;*/

    return {
      familiar: fam,
      location: this.loc,
      outfit: outfit,
      run: () => {
        this.adjustRetroCape();

        let killing = greyKillingBlow(outfit);

        if (this.canSprayDown()) {
          killing = Macro.trySkill(
            Skill.get("Fire Extinguisher: Zone Specific")
          ).step(killing);
        }

        let start: Macro = null;

        if (
          myFamiliar() == fam &&
          getProperty("nosyNoseMonster") != "dirty old lihc"
        ) {
          start = Macro.step("if monsterid 1071;skill 7166;endif");
        }

        greyAdv(
          this.loc,
          outfit,
          new AdventureSettings()
            .addNoBanish(this.dirty)
            .setStartOfFightMacro(start)
            .setFinishingBlowMacro(killing)
        );
      },
    };
  }

  canSprayDown(): boolean {
    return (
      getProperty("fireExtinguisherCyrptUsed") != "true" &&
      toInt(getProperty("_fireExtinguisherCharge")) >= 20
    );
  }

  getProperty(): string {
    return "cyrptNicheEvilness";
  }

  cryptStatus(): QuestStatus {
    if (!haveSkill(this.banisher)) {
      return QuestStatus.FASTER_LATER;
    }

    return QuestStatus.READY;
  }

  getId(): QuestType {
    return "Council / Crypt / DirtyMan";
  }

  getLocations(): Location[] {
    return [this.loc];
  }
}