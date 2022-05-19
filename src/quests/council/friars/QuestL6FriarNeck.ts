import {
  availableAmount,
  getProperty,
  Item,
  Location,
  Monster,
} from "kolmafia";
import { hasNonCombatSkillsReady } from "../../../GreyAdventurer";
import { DelayBurners } from "../../../iotms/delayburners/DelayBurners";
import { AbsorbsProvider } from "../../../utils/GreyAbsorber";
import { greyAdv } from "../../../utils/GreyLocations";
import { GreyOutfit } from "../../../utils/GreyOutfitter";
import { QuestAdventure, QuestInfo, QuestStatus } from "../../Quests";
import { QuestType } from "../../QuestTypes";

export class QuestL6FriarNeck implements QuestInfo {
  item: Item = Item.get("dodecagram");
  location: Location = Location.get("Dark Neck of the Woods");
  absorbs: Monster[] = [Monster.get("P imp"), Monster.get("W imp")];

  level(): number {
    return 6;
  }

  isAllAbsorbed(): boolean {
    let absorbed = AbsorbsProvider.getReabsorbedMonsters();

    return this.absorbs.find((a) => !absorbed.includes(a)) == null;
  }

  getLocations(): Location[] {
    return [this.location];
  }

  status(): QuestStatus {
    if (getProperty("questL06Friar") == "unstarted") {
      return QuestStatus.NOT_READY;
    }

    if (
      getProperty("questL06Friar") == "finished" ||
      availableAmount(this.item) > 0
    ) {
      return QuestStatus.COMPLETED;
    }

    if (!hasNonCombatSkillsReady()) {
      return QuestStatus.FASTER_LATER;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    let outfit = new GreyOutfit().setNoCombat();

    return {
      location: this.location,
      outfit: outfit,
      run: () => {
        if (this.isAllAbsorbed()) {
          DelayBurners.tryReplaceCombats();
        }

        greyAdv(this.location, outfit);
      },
    };
  }

  getId(): QuestType {
    return "Council / Friars / Neck";
  }
}