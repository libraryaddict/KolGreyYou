import {
  availableAmount,
  cliExecute,
  getProperty,
  getZapWand,
  Item,
  myMeat,
  toInt,
} from "kolmafia";
import { Task } from "./Tasks";

export class TaskBoomboxSwitch implements Task {
  boombox: Item = Item.get("SongBoom&trade; BoomBox");
  canSkip: boolean = false;
  noneItem = Item.get("None");

  isForgedRequired(): boolean {
    return getProperty("questL11Black") != "finished";
  }

  isZapWandRequired(): boolean {
    return getZapWand() == this.noneItem;
  }

  getSongChangesLeft(): number {
    return toInt(getProperty("_boomBoxSongsLeft"));
  }

  isMeatSong(): boolean {
    return getProperty("boomBoxSong") == "Total Eclipse of Your Meat";
  }

  run(): void {
    if (this.canSkip) {
      return;
    }

    if (availableAmount(this.boombox) == 0 || this.getSongChangesLeft() < 10) {
      this.canSkip = true;
      return;
    }

    if (this.getSongChangesLeft() < 10 || !this.isMeatSong()) {
      this.canSkip = true;
      return;
    }

    if (
      getProperty("sidequestNunsCompleted") == "none" &&
      toInt(getProperty("hippiesDefeated")) >= 192
    ) {
      return;
    }

    let requiredMeat =
      1000 +
      (this.isForgedRequired() ? 6000 : 0) +
      (this.isZapWandRequired() ? 5000 : 0);

    // If we have enough meat, switch to seasoning.
    if (myMeat() < requiredMeat) {
      return;
    }

    cliExecute("boombox food");
    this.canSkip = true;
  }
}
