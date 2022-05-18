import { availableAmount, Item, Location } from "kolmafia";
import { PropertyManager } from "../../../utils/Properties";
import {
  hasNonCombatSkillActive,
  hasNonCombatSkillsReady,
} from "../../../GreyAdventurer";
import { greyAdv } from "../../../utils/GreyLocations";
import { GreyOutfit } from "../../../utils/GreyOutfitter";
import {
  getQuestStatus,
  QuestAdventure,
  QuestInfo,
  QuestStatus,
} from "../../Quests";
import { QuestType } from "../../QuestTypes";

export class ManorGallery implements QuestInfo {
  location: Location = Location.get("The Haunted Gallery");
  item: Item = Item.get("Lady Spookyraven's dancing shoes");
  sword: Item = Item.get("serpentine sword");

  level(): number {
    return 5;
  }

  status(): QuestStatus {
    let status = getQuestStatus("questM21Dance");

    if (status < 1) {
      return QuestStatus.NOT_READY;
    }

    if (status > 1 || availableAmount(this.item) > 0) {
      return QuestStatus.COMPLETED;
    }

    if (!hasNonCombatSkillsReady()) {
      return QuestStatus.FASTER_LATER;
    }

    if (this.hasDelay()) {
      return QuestStatus.READY;
    }

    return QuestStatus.READY;
  }

  hasDelay(): boolean {
    return this.location.turnsSpent < 5;
  }

  run(): QuestAdventure {
    let outfit = new GreyOutfit().setNoCombat();

    return {
      location: this.location,
      outfit: outfit,
      run: () => {
        // TODO Handle NCs
        let props = new PropertyManager();

        /* if (availableAmount(this.sword) == 0) {
          props.setChoice(89, 2);
        } else*/ {
          props.setChoice(89, 4);
        }

        props.setChoice(914, 1);

        try {
          greyAdv(this.location, outfit);
        } finally {
          props.resetAll();
        }
      },
    };
  }

  getId(): QuestType {
    return "Manor / Gallery";
  }

  getLocations(): Location[] {
    return [this.location];
  }
}
