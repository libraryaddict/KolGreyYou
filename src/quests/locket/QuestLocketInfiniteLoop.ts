import {
  Location,
  Familiar,
  Monster,
  Skill,
  myMeat,
  myLevel,
  retrieveItem,
  Item,
  itemAmount,
  visitUrl,
  handlingChoice,
  currentRound,
  toInt,
  Effect,
  haveEffect,
  haveSkill,
  print,
  cliExecute,
} from "kolmafia";
import { GreyOutfit } from "../../utils/GreyOutfitter";
import {
  ResourceClaim,
  ResourceType,
  ResourceYRClaim,
} from "../../utils/GreyResources";
import { canCombatLocket } from "../../utils/GreyUtils";
import { Macro } from "../../utils/MacroBuilder";
import { QuestAdventure, QuestInfo, QuestStatus } from "../Quests";
import { QuestType } from "../QuestTypes";

export class QuestLocketInfiniteLoop implements QuestInfo {
  monster: Monster = Monster.get("Pygmy witch lawyer");
  skill: Skill = Skill.get("Infinite Loop");
  rocket: Item = Item.get("Yellow Rocket");
  effect: Effect = Effect.get("Everything Looks Yellow");

  level(): number {
    return 1;
  }

  getResourceClaims(): ResourceClaim[] {
    return [
      new ResourceClaim(
        ResourceType.COMBAT_LOCKET,
        1,
        "Combat Locket for Infinite Loop",
        50
      ),
      new ResourceYRClaim("YR for Infinite Loop", 10),
    ];
  }

  status(): QuestStatus {
    if (!canCombatLocket(this.monster) || haveSkill(this.skill)) {
      return QuestStatus.COMPLETED;
    }

    if (haveEffect(this.effect) > 0) {
      return QuestStatus.NOT_READY;
    }

    if (myMeat() < 350 || myLevel() < 4) {
      return QuestStatus.NOT_READY;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    let outfit = new GreyOutfit();
    outfit.addBonus("+init");
    outfit.addBonus("-ml");
    outfit.hpRegenWeight = 1;
    outfit.mpRegenWeight = 1;

    return {
      location: null,
      outfit: outfit,
      run: () => {
        retrieveItem(this.rocket);

        if (itemAmount(this.rocket) == 0) {
          throw "Supposed to have a yellow rocket on hand!";
        }

        let page1 = visitUrl("inventory.php?reminisce=1", false);
        let url =
          "choice.php?pwd=&whichchoice=1463&option=1&mid=" +
          toInt(this.monster);

        visitUrl(url);
        Macro.item(this.rocket).submit();

        if (handlingChoice() || currentRound() != 0) {
          throw "We're supposed to be done with this locket fight!";
        }
      },
    };
  }

  getId(): QuestType {
    return "CombatLocket / InfiniteLoop";
  }

  getLocations(): Location[] {
    return [];
  }
}
