import {
  availableAmount,
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
import { AbsorbsProvider } from "../../../utils/GreyAbsorber";
import { greyKillingBlow } from "../../../utils/GreyCombat";
import { AdventureSettings, greyAdv } from "../../../utils/GreyLocations";
import { GreyOutfit } from "../../../utils/GreyOutfitter";
import { ResourceClaim, ResourceType } from "../../../utils/GreyResources";
import { Macro } from "../../../utils/MacroBuilder";
import { PropertyManager } from "../../../utils/Properties";
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
  resourceClaim: ResourceClaim = new ResourceClaim(
    ResourceType.FIRE_EXTINGUSHER,
    20,
    "Spray down Dirty Old Man",
    availableAmount(this.cape) > 0 ? 4 : 9
  );
  advsAbsorb: Monster = Monster.get("basic lihc");

  getResourceClaims(): ResourceClaim[] {
    if (getProperty("fireExtinguisherCyrptUsed") == "true") {
      return [];
    }

    return [this.resourceClaim];
  }

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

        let avoid: Macro;

        if (this.canSprayDown()) {
          // If its a dirty lich, don't spray down
          avoid = Macro.ifNot_(
            this.dirty,
            Macro.trySkill(Skill.get("Fire Extinguisher: Zone Specific"))
          );

          if (
            !AbsorbsProvider.getReabsorbedMonsters().includes(this.advsAbsorb)
          ) {
            avoid = Macro.ifNot_(this.advsAbsorb, avoid);
          }
        }

        let start: Macro;

        if (
          myFamiliar() == fam &&
          getProperty("nosyNoseMonster") != "dirty old lihc"
        ) {
          start = Macro.step("if monsterid 1071;skill 7166;endif");

          if (avoid != null) {
            start = start.step(avoid);
          }
        } else if (avoid != null) {
          start = avoid;
        }

        let props = new PropertyManager();
        props.setChoice(157, 4);

        try {
          greyAdv(
            this.loc,
            outfit,
            new AdventureSettings()
              .addNoBanish(this.dirty)
              .setStartOfFightMacro(start)
          );
        } finally {
          props.resetAll();
        }
      },
    };
  }

  canSprayDown(): boolean {
    return (
      availableAmount(this.fire) > 0 &&
      getProperty("fireExtinguisherCyrptUsed") != "true" &&
      toInt(getProperty("_fireExtinguisherCharge")) >= 20
    );
  }

  getProperty(): string {
    return "cyrptNicheEvilness";
  }

  cryptStatus(): QuestStatus {
    if (!haveSkill(this.banisher)) {
      // return QuestStatus.FASTER_LATER;
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
