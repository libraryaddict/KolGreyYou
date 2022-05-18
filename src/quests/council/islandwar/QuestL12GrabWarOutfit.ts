import {
  Location,
  Familiar,
  haveOutfit,
  Effect,
  getProperty,
  haveEffect,
  Item,
  myAscensions,
  myLevel,
  myMeat,
  toInt,
  itemAmount,
  retrieveItem,
  outfitPieces,
} from "kolmafia";
import { PropertyManager } from "../../../utils/Properties";
import { greyAdv, AdventureSettings } from "../../../utils/GreyLocations";
import { GreyOutfit } from "../../../utils/GreyOutfitter";
import { GreyPulls } from "../../../utils/GreyResources";
import { GreySettings } from "../../../utils/GreySettings";
import { Macro } from "../../../utils/MacroBuilder";
import { QuestInfo, QuestStatus, QuestAdventure } from "../../Quests";
import { QuestType } from "../../QuestTypes";

export class QuestL12GrabWarOutfit implements QuestInfo {
  location: Location = Location.get("Frat House");
  rocket: Item = Item.get("Yellow Rocket");
  effect: Effect = Effect.get("Everything Looks Yellow");

  getId(): QuestType {
    return "Council / War / FratOutfit";
  }

  hasBoat(): boolean {
    return toInt(getProperty("lastIslandUnlock")) == myAscensions();
  }

  level(): number {
    return 12;
  }

  status(): QuestStatus {
    if (haveOutfit("Frat Warrior Fatigues")) {
      return QuestStatus.COMPLETED;
    }

    if (GreySettings.isHardcoreMode() && !haveOutfit("Filthy Hippy Disguise")) {
      return QuestStatus.NOT_READY;
    }

    if (!this.hasBoat() || myLevel() < 12) {
      return QuestStatus.NOT_READY;
    }

    if (haveEffect(this.effect) > 0) {
      return QuestStatus.NOT_READY;
    }

    if (myMeat() < 350 || myLevel() < 5) {
      return QuestStatus.NOT_READY;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    if (!GreySettings.isHardcoreMode()) {
      return {
        location: null,
        run: () => {
          GreyPulls.pullFratWarOutfit();
        },
      };
    }

    let outfit = new GreyOutfit().setPlusCombat();

    for (let item of outfitPieces("Filthy Hippy Disguise")) {
      outfit.addItem(item);
    }

    return {
      location: this.location,
      outfit: outfit,
      run: () => {
        retrieveItem(this.rocket);

        if (itemAmount(this.rocket) == 0) {
          throw "Supposed to have a yellow rocket on hand!";
        }

        let props = new PropertyManager();
        props.setChoice(143, 3);
        props.setChoice(144, 3);
        props.setChoice(145, 2);
        props.setChoice(146, 2);

        try {
          greyAdv(
            this.location,
            outfit,
            new AdventureSettings().setStartOfFightMacro(
              Macro.item(this.rocket)
            )
          );
        } finally {
          props.resetAll();
        }
      },
    };
  }

  getLocations(): Location[] {
    if (GreySettings.isHardcoreMode()) {
      return [this.location];
    }

    return [];
  }
}
