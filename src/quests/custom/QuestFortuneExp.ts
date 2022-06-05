import {
  Location,
  Familiar,
  getProperty,
  familiarWeight,
  cliExecute,
  familiarEquipment,
  Item,
  availableAmount,
} from "kolmafia";
import { GreyOutfit } from "../../utils/GreyOutfitter";
import { QuestAdventure, QuestInfo, QuestStatus } from "../Quests";
import { QuestType } from "../QuestTypes";

export class QuestFortuneExp implements QuestInfo {
  fam: Familiar = Familiar.get("Grey Goose");
  equip: Item = familiarEquipment(this.fam);

  getId(): QuestType {
    return "Misc / FortuneExp";
  }

  level(): number {
    return 6;
  }

  status(): QuestStatus {
    if (getProperty("_clanFortuneBuffUsed") == "true") {
      return QuestStatus.COMPLETED;
    }

    if (familiarWeight(this.fam) > 2 || availableAmount(this.equip) == 0) {
      return QuestStatus.NOT_READY;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    return {
      location: null,
      outfit: new GreyOutfit("-tie"),
      run: () => {
        cliExecute("fortune buff familiar");
      },
    };
  }

  getLocations(): Location[] {
    return [];
  }

  needAdventures(): number {
    return 0;
  }
}