import {
  Location,
  Familiar,
  availableAmount,
  Item,
  Monster,
  useFamiliar,
} from "kolmafia";
import { PropertyManager } from "../../../utils/Properties";
import { AdventureSettings, greyAdv } from "../../../utils/GreyLocations";
import { GreyOutfit } from "../../../utils/GreyOutfitter";
import {
  getQuestStatus,
  QuestAdventure,
  QuestInfo,
  QuestStatus,
} from "../../Quests";
import { QuestType } from "../../QuestTypes";
import { DelayBurners } from "../../../iotms/delayburners/DelayBurners";

export class QuestL10GiantShip implements QuestInfo {
  modelShip: Item = Item.get("Model airship");
  amulet: Item = Item.get("Amulet of Extreme Plot Significance");
  umbrella: Item = Item.get("Titanium Assault Umbrella");
  wig: Item = Item.get("Mohawk Wig");
  loc: Location = Location.get("The Penultimate Fantasy Airship");
  wads: Item[] = [
    "Tissue Paper Immateria",
    "Tin Foil Immateria",
    "Gauze Immateria",
    "Plastic Wrap Immateria",
  ].map((s) => Item.get(s));
  protag: Monster = Monster.get("Protagonist");
  toAbsorb: Monster[];

  shouldRunNC(): boolean {
    if (availableAmount(this.modelShip) == 0 || this.loc.turnsSpent >= 25) {
      return true;
    }

    if (this.loc.turnsSpent < 5) {
      return false;
    }

    let wadExpected = this.wads[Math.floor(this.loc.turnsSpent - 5) / 5];

    // If we have this wad already, then we need to wait for the next wad to be available
    if (wadExpected != null && availableAmount(wadExpected) > 0) {
      return false;
    }

    return true;
  }

  run(): QuestAdventure {
    let outfit = new GreyOutfit();

    if (this.shouldRunNC()) {
      outfit.setNoCombat();
    }

    let wantDrops =
      availableAmount(this.amulet) == 0 ||
      availableAmount(this.umbrella) == 0 ||
      availableAmount(this.wig) == 0;

    if (wantDrops) {
      outfit.setItemDrops();
    }

    return {
      location: this.loc,
      outfit: outfit,
      run: () => {
        let props = new PropertyManager();
        props.setChoice(681, 1);

        if (!this.shouldRunNC()) {
          let ready = DelayBurners.getReadyDelayBurner();

          if (ready != null) {
            ready.doFightSetup();
          } else {
            DelayBurners.tryReplaceCombats();
          }
        }

        if (DelayBurners.isTryingForDupeableGoblin()) {
          useFamiliar(Familiar.get("Grey Goose"));
        }

        try {
          if (availableAmount(this.modelShip) == 0) {
            props.setChoice(182, 4);
          } else {
            props.setChoice(182, 1);
          }

          let settings = new AdventureSettings();
          settings.addBanish(this.protag);

          greyAdv(this.loc, outfit, settings);
        } finally {
          props.resetAll();
        }
      },
    };
  }

  getId(): QuestType {
    return "Council / Beanstalk / Ship";
  }

  level(): number {
    return 8;
  }

  status(): QuestStatus {
    let status = getQuestStatus("questL10Garbage");

    if (status < 1) {
      return QuestStatus.NOT_READY;
    }

    if (status > 6) {
      return QuestStatus.COMPLETED;
    }

    return QuestStatus.READY;
  }

  getLocations(): Location[] {
    return [this.loc];
  }
}
