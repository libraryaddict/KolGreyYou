import {
  Location,
  Familiar,
  Monster,
  Item,
  availableAmount,
  toInt,
  getProperty,
  equip,
  equippedAmount,
  maximize,
  turnsPlayed,
} from "kolmafia";
import { greyAdv } from "../../utils/GreyLocations";
import { GreyOutfit } from "../../utils/GreyOutfitter";
import { ResourceClaim } from "../../utils/GreyResources";
import { QuestAdventure, QuestInfo, QuestStatus } from "../Quests";
import { QuestType } from "../QuestTypes";

export class QuestJuneCleaver implements QuestInfo {
  warren: Location = Location.get("The Dire Warren");
  cleaver: Item = Item.get("June Cleaver");

  getId(): QuestType {
    return "Misc / JuneCleaver";
  }

  level(): number {
    return 3;
  }

  mustBeDone(): boolean {
    return true;
  }

  needAdventures(): number {
    return 0;
  }

  status(): QuestStatus {
    if (availableAmount(this.cleaver) == 0) {
      return QuestStatus.COMPLETED;
    }

    let fightsLeft = toInt(getProperty("_juneCleaverFightsLeft"));

    if (fightsLeft > 0) {
      return QuestStatus.NOT_READY;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    return {
      location: this.warren,
      outfit: new GreyOutfit("-tie"),
      run: () => {
        maximize("+equip " + this.cleaver.name + " -tie", false);

        if (equippedAmount(this.cleaver) == 0) {
          throw "Something went wrong. Expected to be holding the june cleaver";
        }

        let turn = turnsPlayed();

        greyAdv(this.warren);

        if (turn != turnsPlayed()) {
          throw "Something went wrong, expected to hit a june cleaver NC but instead spent a turn.";
        }
      },
    };
  }

  getLocations(): Location[] {
    return [];
  }
}
