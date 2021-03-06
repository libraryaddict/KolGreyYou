import {
  equippedAmount,
  Familiar,
  familiarWeight,
  Item,
  print,
  Slot,
} from "kolmafia";
import { DelayBurner } from "./DelayBurnerAbstract";
import { DelayBurningKramco } from "./DelayBurningKramco";
import { DelayBurningVoter } from "./DelayBurningVoter";
import { DelayBurningCursedMagnifyingGlass } from "./DelayCursedMagnifyingGlass";

export class DelayBurners {
  static delays: DelayBurner[];

  private static getDelays(): DelayBurner[] {
    if (this.delays != null) {
      return this.delays;
    }

    this.delays = [
      new DelayBurningKramco(),
      new DelayBurningVoter(),
      new DelayBurningCursedMagnifyingGlass(),
    ].filter((d) => d.isViable());

    for (let delay of this.delays) {
      delay.doSetup();
    }

    return this.delays;
  }

  private static getDelayBurners(): DelayBurner[] {
    return this.getDelays().filter((d) => d.isViable());
  }

  static isTryingForDupeableGoblin(): boolean {
    let fam = Familiar.get("Grey Goose");
    return (
      familiarWeight(fam) >= 6 &&
      familiarWeight(fam) < 9 &&
      equippedAmount(Item.get("Kramco Sausage-o-Matic")) > 0
    );
  }

  static getReadyDelayBurner(freeOnly: boolean = false): DelayBurner {
    let burner = this.getDelayBurner(freeOnly);

    if (burner == null || burner.readyIn() > 0) {
      return null;
    }

    return burner;
  }

  static isDelayBurnerReady(freeOnly: boolean = false): boolean {
    let burner = this.getDelayBurner(freeOnly);

    return burner != null && burner.readyIn() <= 0;
  }

  static tryReplaceCombats(maxTurnsWasted: number = 10): Slot[] {
    let delays = this.getDelays()
      .filter((d) => d.isViable() && d.isViableAsCombatReplacer())
      .sort((d1, d2) => d1.readyIn() - d2.readyIn());

    let toReturn = delays.find(
      (d) => d.isFree() && d.readyIn() <= maxTurnsWasted
    );

    if (toReturn == null) {
      toReturn = delays[0];
    }

    if (toReturn == null) {
      return;
    }

    return toReturn.doFightSetup();
  }

  static isDelayBurnerFeasible(): boolean {
    return this.getDelayBurners().find((d) => d.readyIn() < 7) != null;
  }

  private static getDelayBurner(freeOnly: boolean = false): DelayBurner {
    let delays = this.getDelays()
      .filter((d) => d.isViable() && (d.isFree() || freeOnly))
      .sort((d1, d2) => d1.readyIn() - d2.readyIn());

    let toReturn = delays.find((d) => d.isFree());

    if (toReturn == null) {
      toReturn = delays[0];
    }

    return toReturn;
  }
}
