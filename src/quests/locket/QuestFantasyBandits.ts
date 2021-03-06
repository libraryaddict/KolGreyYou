import {
  Location,
  Familiar,
  toInt,
  getProperty,
  setProperty,
  Monster,
  Item,
  Skill,
  toMonster,
  visitUrl,
  Stat,
  bufferToFile,
  myAdventures,
  availableAmount,
} from "kolmafia";
import { AdventureSettings, greyAdv } from "../../utils/GreyLocations";
import { GreyOutfit } from "../../utils/GreyOutfitter";
import { ResourceClaim, ResourceType } from "../../utils/GreyResources";
import { GreySettings } from "../../utils/GreySettings";
import { canCombatLocket, doPocketWishFight } from "../../utils/GreyUtils";
import { Macro } from "../../utils/MacroBuilder";
import {
  getQuestStatus,
  QuestAdventure,
  QuestInfo,
  QuestStatus,
} from "../Quests";
import { QuestType } from "../QuestTypes";

export class QuestLocketFantasyBandit implements QuestInfo {
  fought: string = "_foughtFantasyRealm";
  monster: Monster = Monster.get("Fantasy Bandit");
  camera: Item = Item.get("Backup Camera");

  getResourceClaims(): ResourceClaim[] {
    return [
      new ResourceClaim(ResourceType.BACKUP_CAMERA, 4, "Backup Fantasy Realm"),
      new ResourceClaim(
        ResourceType.COMBAT_LOCKET,
        1,
        "Locket Fantasyrealm Bandit"
      ),
    ];
  }

  getFoughtToday(): number {
    let setting = getProperty(this.fought);

    if (setting == "") {
      return 0;
    }

    return toInt(setting);
  }

  addFought() {
    setProperty(this.fought, (this.getFoughtToday() + 1).toString());
  }

  getId(): QuestType {
    return "Council / Tower / Keys / FantasyBandit";
  }

  level(): number {
    return 11;
  }

  hasFoughtEnough(): boolean {
    return this.getFoughtToday() >= 5;
  }

  getBackupUsesRemaining() {
    return 11 - toInt(getProperty("_backUpUses"));
  }

  status(): QuestStatus {
    if (this.hasFoughtEnough() || availableAmount(this.camera) == 0) {
      return QuestStatus.COMPLETED;
    }

    // If we have the iotm, or used a day pass
    if (
      getProperty("frAlways") == "true" ||
      getProperty("_frToday") == "true"
    ) {
      return QuestStatus.COMPLETED;
    }

    if (
      this.getBackupUsesRemaining() <
      5 - Math.max(1, this.getFoughtToday())
    ) {
      return QuestStatus.COMPLETED;
    }

    if (!GreySettings.greyFantasyBandits) {
      if (
        GreySettings.shouldAvoidTowerRequirements() ||
        GreySettings.isHardcoreMode()
      ) {
        return QuestStatus.NOT_READY;
      }
    }

    if (getQuestStatus("questL08Trapper") <= 1) {
      return QuestStatus.NOT_READY;
    }

    if (this.lastMonster() == this.monster) {
      return QuestStatus.READY;
    }

    if (
      !canCombatLocket(this.monster) &&
      (availableAmount(Item.get("Genie Bottle")) == 0 ||
        availableAmount(Item.get("Pocket Wish")) == 0)
    ) {
      return QuestStatus.COMPLETED;
    }

    if (myAdventures() < 30) {
      return QuestStatus.FASTER_LATER;
    }

    return QuestStatus.READY;
  }

  run(): QuestAdventure {
    if (this.lastMonster() != this.monster) {
      return {
        location: null,
        run: () => {
          if (canCombatLocket(this.monster)) {
            let page1 = visitUrl("inventory.php?reminisce=1", false);
            let url =
              "choice.php?pwd=&whichchoice=1463&option=1&mid=" +
              toInt(this.monster);

            let page2 = visitUrl(url);

            greyAdv(url);
          } else {
            doPocketWishFight(this.monster);
            greyAdv("main.php");
          }

          this.addFought();
        },
      };
    }

    let outfit = new GreyOutfit().addItem(Item.get("Backup Camera"));
    let loc = Location.get("The Dire Warren");

    // TODO Backup and ruin other zones delay
    return {
      outfit: outfit,
      location: null,
      run: () => {
        greyAdv(
          loc,
          outfit,
          new AdventureSettings().setStartOfFightMacro(
            new Macro().if_(
              Monster.get("Fluffy Bunny"),
              Macro.skill(Skill.get("Back-Up to your Last Enemy"))
            )
          )
        );
        this.addFought();
      },
    };
  }

  lastMonster(): Monster {
    return toMonster(getProperty("lastCopyableMonster"));
  }

  getLocations(): Location[] {
    return [];
  }

  needAdventures?(): number {
    return 5;
  }

  mustBeDone(): boolean {
    // TODO Throw error if more than one quest reports this
    return this.getFoughtToday() > 0 && !this.hasFoughtEnough();
  }
}
