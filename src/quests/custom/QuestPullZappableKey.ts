import {
  Location,
  Familiar,
  getRelated,
  Item,
  availableAmount,
  print,
} from "kolmafia";
import { GreyPulls } from "../../utils/GreyResources";
import { GreySettings } from "../../utils/GreySettings";
import {
  getQuestStatus,
  QuestAdventure,
  QuestInfo,
  QuestStatus,
} from "../Quests";
import { QuestType } from "../QuestTypes";
import { QuestKeyStuffAbstract } from "./QuestKeyStuffAbstract";

export class QuestPullZappableKey
  extends QuestKeyStuffAbstract
  implements QuestInfo
{
  getId(): QuestType {
    return "Council / Tower / Keys / PullZappableKey";
  }

  level(): number {
    return 8;
  }

  status(): QuestStatus {
    if (GreySettings.isHardcoreMode()) {
      return QuestStatus.COMPLETED;
    }

    let status = getQuestStatus("questL13Final");

    if (status < 5) {
      return QuestStatus.NOT_READY;
    }

    if (status > 5) {
      return QuestStatus.COMPLETED;
    }

    if (this.getViableKeyCount() >= 3) {
      return QuestStatus.COMPLETED;
    }

    if (this.getOwnedZappables().length > 0) {
      return QuestStatus.COMPLETED;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    return {
      location: null,
      run: () => {
        GreyPulls.pullZappableKey();
      },
    };
  }

  getLocations(): Location[] {
    return [];
  }
}
