import {
  availableAmount,
  cliExecute,
  Effect,
  Familiar,
  familiarWeight,
  getProperty,
  haveEffect,
  haveSkill,
  Item,
  itemAmount,
  Location,
  maximize,
  Monster,
  myMp,
  print,
  printHtml,
  putCloset,
  setLocation,
  Skill,
  toInt,
  useFamiliar,
  useSkill,
} from "kolmafia";
import { AdventureFinder, FoundAdventure } from "./GreyChooser";
import { QuestAdventure } from "./quests/Quests";
import { TaskCouncil } from "./tasks/TaskCouncil";
import { TaskEater } from "./tasks/TaskEater";
import { Task } from "./tasks/Tasks";
import { TaskSellCrap } from "./tasks/TaskSellCrap";
import { TaskWorkshed } from "./tasks/TaskWorkshed";
import { AdventureLocation } from "./utils/GreyAbsorber";
import { AdventureSettings, greyAdv } from "./utils/GreyLocations";
import { GreyOutfit } from "./utils/GreyOutfitter";
import { doColor, setUmbrella } from "./utils/GreyUtils";

export class GreyAdventurer {
  goose: Familiar = Familiar.get("Grey Goose");
  adventureFinder: AdventureFinder = new AdventureFinder();
  goTime: boolean;
  tasks: Task[] = [
    new TaskEater(),
    new TaskSellCrap(),
    new TaskWorkshed(),
    new TaskCouncil(),
  ];

  runTurn(goTime: boolean): boolean {
    this.goTime = goTime;

    if (goTime) {
      for (let task of this.tasks) {
        task.run();
      }
    }

    this.adventureFinder.start();
    let goodAdventure: FoundAdventure = this.adventureFinder.findGoodVisit();

    this.adventureFinder.printStatus();

    if (goodAdventure == null) {
      print("Failed, should have printed an error..", "gray");
      return false;
    }

    let adv: FoundAdventure;
    let plan: string[] = [];

    if (goodAdventure.quest != null) {
      plan.push("Quest");
    }

    if (goodAdventure.locationInfo != null) {
      if (goodAdventure.locationInfo.turnsToGain > 0) {
        plan.push(
          "Absorb Adventures (Expect " +
            goodAdventure.locationInfo.expectedTurnsProfit +
            " profit of total " +
            goodAdventure.locationInfo.turnsToGain +
            " possible)"
        );
      }

      if (goodAdventure.locationInfo.skills.size > 0) {
        let skills: string[] = [];

        goodAdventure.locationInfo.skills.forEach((v, k) => {
          skills.push(k.skill.name + " (" + v + ")");
        });

        plan.push("Grab Skills: " + skills.join(", "));
      }

      if (goodAdventure.locationInfo.monsters != null) {
        plan.push(
          "Fight: " +
            goodAdventure.locationInfo.monsters.map((m) => m.name).join(", ")
        );
      }
    }

    adv = goodAdventure;
    let prefix: string;

    if (goodAdventure.quest != null) {
      adv.adventure = adv.quest.run();

      prefix = goodAdventure.quest.getId() + " @ " + adv.adventure.location;
    } else {
      adv.adventure = this.getNonQuest(goodAdventure.locationInfo);

      prefix = "Non-Quest @ " + adv.adventure.location;
    }

    printHtml(
      "<u>" +
        doColor(prefix, "blue") +
        ", Goals:</u> " +
        doColor(plan.map((s) => "<u>" + s + "</u>").join(", "), "gray")
    );

    this.runAdventure(adv);
    return true;
  }

  getNonQuest(adv: AdventureLocation): QuestAdventure {
    let outfit = new GreyOutfit();

    if (adv.location.combatPercent < 100) {
      outfit.setPlusCombat();
    }

    let settings = new AdventureSettings();
    adv.monsters.forEach((m) => settings.addNoBanish(m));

    return {
      outfit: outfit,
      location: adv.location,
      run: () => {
        // We don't want it casting +combat skills
        greyAdv(adv.location, null, settings);
      },
    };
  }

  doPrep(adventure: FoundAdventure) {
    let toRun: QuestAdventure = adventure.adventure;
    let outfit = toRun.outfit;

    if (toRun.location == Location.get("Inside the Palindome")) {
      outfit.addItem(Item.get("Talisman o' Namsilat"));
    }

    let familiar: Familiar = this.goose;
    let wantToAbsorb: boolean =
      adventure.locationInfo != null && adventure.locationInfo.turnsToGain > 0;
    let gooseReplaceable =
      !wantToAbsorb && this.adventureFinder.hasEnoughGooseWeight();
    let canDoMagGlass: boolean =
      this.adventureFinder.hasEnoughGooseWeight() &&
      outfit.minusCombatWeight == 0 &&
      outfit.itemDropWeight < 1 &&
      toInt(getProperty("cursedMagnifyingGlassCount")) < 13 &&
      getProperty("sidequestLighthouseCompleted") == "none" &&
      availableAmount(Item.get("barrel of gunpowder")) == 0;

    if (canDoMagGlass) {
      outfit.addBonus("+100 bonus cursed magnifying glass");
    }

    if (
      toRun.familiar != null &&
      (toRun.disableFamOverride == true || gooseReplaceable)
    ) {
      familiar = toRun.familiar;
    } else if (gooseReplaceable) {
      let replaceWith = this.adventureFinder.getRecommendedFamiliars();
      replaceWith.push(Familiar.get("Jumpsuited Hound Dog"));

      familiar = replaceWith[0];
    }

    let doOrb: boolean = false;

    if (adventure.locationInfo != null && adventure.locationInfo.shouldRunOrb) {
      doOrb = true;
    }

    let locationToSet = toRun.location;

    if (locationToSet == null) {
      locationToSet = Location.get("Noob Cave");
    }

    setLocation(locationToSet);

    setUmbrella(outfit.getUmbrella());

    useFamiliar(familiar);

    if (familiar == this.goose && familiarWeight(this.goose) >= 6) {
      outfit.famExpWeight = 0.1;
    }

    maximize(
      outfit.createString() +
        " " +
        (doOrb ? "+" : "-") +
        "equip miniature crystal ball",
      false
    );

    let closet = Item.get("Funky junk key");

    if (itemAmount(closet) > 0) {
      putCloset(closet, itemAmount(closet));
    }

    /* if (
      adventure.locationInfo != null &&
      adventure.locationInfo.monsters.includes(Monster.get("Oil Baron"))
    ) {
      // Dumb code to try force an oil baron
      maximize(
        new GreyOutfit().addItem(Item.get("Backup Camera")).createString(),
        false
      );
      cliExecute("backupcamera ml");
    }*/
  }

  runAdventure(adventure: FoundAdventure) {
    let toRun: QuestAdventure = adventure.adventure;
    let outfit = toRun.outfit;

    if (outfit == null) {
      toRun.outfit = outfit = new GreyOutfit();
    }

    this.doPrep(adventure);

    if (this.goTime) {
      toRun.run();
    } else {
      print("Sim run()!");
    }
  }
}

export function castNoCombatSkills() {
  if (
    haveSkill(Skill.get("Phase Shift")) &&
    haveEffect(Effect.get("Shifted Phase")) == 0 &&
    myMp() >= 50
  ) {
    useSkill(Skill.get("Phase Shift"));
  }

  if (
    haveSkill(Skill.get("Photonic Shroud")) &&
    haveEffect(Effect.get("Darkened Photons")) == 0 &&
    myMp() >= 50
  ) {
    useSkill(Skill.get("Photonic Shroud"));
  }
}

export function castCombatSkill() {
  if (
    haveSkill(Skill.get("Piezoelectric Honk")) &&
    haveEffect(Effect.get("Hooooooooonk!")) == 0 &&
    myMp() >= 50
  ) {
    useSkill(Skill.get("Piezoelectric Honk"));
  }
}

export function hasNonCombatSkillsReady(wantBoth: boolean = true): boolean {
  let s1 = haveSkill(Skill.get("Phase Shift"));
  let s2 = haveSkill(Skill.get("Photonic Shroud"));

  let s1e = haveEffect(Effect.get("Shifted Phase")) > 0;
  let s2e = haveEffect(Effect.get("Darkened Photons")) > 0;

  if (wantBoth) {
    return s1 && s2 && (s1e ? 0 : 50) + (s2e ? 0 : 50) + 20 <= myMp();
  }

  return s1e || s2e || ((s1 || s2) && myMp() >= 70);
}

export function hasCombatSkillReady(): boolean {
  return (
    hasCombatSkillActive() ||
    (haveSkill(Skill.get("Piezoelectric Honk")) && myMp() >= 70)
  );
}

export function hasBanisherSkill(): boolean {
  return haveSkill(Skill.get("System Sweep"));
}

export function hasCombatSkillActive(): boolean {
  return haveEffect(Effect.get("Hooooooooonk!")) > 0;
}

export function hasNonCombatSkillActive(): boolean {
  return (
    haveEffect(Effect.get("Shifted Phase")) > 0 ||
    haveEffect(Effect.get("Darkened Photons")) > 0
  );
}
