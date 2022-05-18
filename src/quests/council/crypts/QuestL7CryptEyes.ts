import {
  availableAmount,
  cliExecute,
  Item,
  Location,
  Monster,
  use,
} from "kolmafia";
import { hasNonCombatSkillsReady } from "../../../GreyAdventurer";
import { AdventureSettings, greyAdv } from "../../../utils/GreyLocations";
import { GreyOutfit } from "../../../utils/GreyOutfitter";
import { QuestAdventure, QuestInfo, QuestStatus } from "../../Quests";
import { QuestType } from "../../QuestTypes";
import { CryptL7Template } from "./CryptTemplate";

export class CryptL7Eyes extends CryptL7Template {
  loc: Location = Location.get("The Defiled Nook");

  run(): QuestAdventure {
    let outfit = new GreyOutfit().setItemDrops();
    this.addRetroSword(outfit);

    return {
      location: this.loc,
      outfit: outfit,
      run: () => {
        this.adjustRetroCape();
        greyAdv(
          this.loc,
          outfit,
          new AdventureSettings().addBanish(Monster.get("party skelteon"))
        );

        cliExecute("refresh inventory");

        let item = Item.get("Evil Eye");

        if (availableAmount(item) > 0) {
          use(item, availableAmount(item));
        }
      },
    };
  }

  getProperty(): string {
    return "cyrptNookEvilness";
  }

  cryptStatus(): QuestStatus {
    return QuestStatus.READY;
  }

  getId(): QuestType {
    return "Council / Crypt / Eyes";
  }

  getLocations(): Location[] {
    return [this.loc];
  }
}
