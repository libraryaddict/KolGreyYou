import {
  Monster,
  Familiar,
  familiarWeight,
  myAdventures,
  print,
  myLevel,
  haveSkill,
  Skill,
  myBasestat,
  Stat,
  myMp,
  Location,
  printHtml,
  haveEffect,
  Effect,
  toInt,
} from "kolmafia";
import {
  hasCombatSkillActive,
  hasNonCombatSkillActive,
} from "./GreyAdventurer";
import { QuestAdventure, QuestInfo, QuestStatus } from "./quests/Quests";
import {
  AdventureLocation,
  AbsorbsProvider,
  Absorb,
  Reabsorbed,
} from "./utils/GreyAbsorber";
import { GreySettings } from "./utils/GreySettings";
import { currentPredictions, doColor } from "./utils/GreyUtils";
import { QuestRegistry } from "./quests/QuestRegistry";
import { ResourceClaim, ResourceType } from "./utils/GreyResources";
import { canAdv } from "canadv.ash";

export interface FoundAdventure {
  quest?: QuestInfo;
  locationInfo?: AdventureLocation;
  adventure?: QuestAdventure;
}

export class AdventureFinder {
  defeated: Map<Monster, Reabsorbed>;
  viableQuests: QuestInfo[];
  quester: GreyQuester = new GreyQuester();
  absorbs: AbsorbsProvider = new AbsorbsProvider();
  goose: Familiar = Familiar.get("Grey Goose");
  goodAbsorbs: AdventureLocation[];
  questLocations: Location[];
  resources: ResourceClaim[];

  start() {
    this.setPreAbsorbs();
    this.doResourceClaims();
    this.viableQuests = this.quester.getDoableQuests();
    this.setAbsorbs();
    this.defeated = this.absorbs.getAbsorbedMonstersFromInstance();
    this.goodAbsorbs = this.absorbs.getExtraAdventures(this.defeated, true);
    this.setQuestLocations();
  }

  noteResourceClaims() {
    for (let resourceType of Object.keys(ResourceType)
      .filter((k) => k.length == 1)
      .map((k) => toInt(k))) {
      print("Now doing resource " + ResourceType[resourceType], "blue");
      let totalDesired = 0;

      for (let claim of this.resources) {
        if (claim.resource != resourceType) {
          continue;
        }

        print(
          claim.reason +
            " - Wants " +
            claim.amountDesired +
            " - saves " +
            claim.turnsSaved
        );

        totalDesired += claim.amountDesired;
      }

      if (totalDesired > ResourceClaim.getResourcesLeft(resourceType)) {
        print(
          "We want to use " +
            totalDesired +
            " but we only have " +
            ResourceClaim.getResourcesLeft(resourceType) +
            " left on " +
            ResourceType[resourceType],
          "red"
        );
      } else {
        print(
          "We want to use " +
            totalDesired +
            " / " +
            ResourceClaim.getResourcesLeft(resourceType),
          "gray"
        );
      }
    }
  }

  doResourceClaims() {
    this.resources = [];

    for (let quest of this.quester.getAllQuests()) {
      if (quest.level() < 1 || quest.getResourceClaims == null) {
        continue;
      }

      if (quest.status() == QuestStatus.COMPLETED) {
        continue;
      }

      this.resources.push(...quest.getResourceClaims());
    }
  }

  setPreAbsorbs() {
    let defeated = this.absorbs.getAbsorbedMonstersFromInstance();

    for (let quest of this.quester.getAllQuests()) {
      quest.toAbsorb = [];

      for (let loc of quest.getLocations()) {
        let result = this.absorbs.getAdventuresInLocation(defeated, loc);

        if (result == null) {
          continue;
        }

        quest.toAbsorb.push(...result.monsters);
      }
    }
  }

  setAbsorbs() {
    let defeated = this.absorbs.getAbsorbedMonstersFromInstance();

    for (let quest of this.quester.getAllQuests()) {
      if (
        quest.status() == QuestStatus.NOT_READY ||
        quest.status() == QuestStatus.COMPLETED
      ) {
        continue;
      }

      let run = quest.run();

      if (run.location == null) {
        continue;
      }

      let result = this.absorbs.getAdventuresInLocation(defeated, run.location);

      quest.toAbsorb = result == null ? [] : result.monsters;
    }
  }

  setQuestLocations() {
    this.questLocations = [];

    for (let quest of this.quester.getAllQuests()) {
      if (quest.status() == QuestStatus.COMPLETED) {
        continue;
      }

      this.questLocations.push(...quest.getLocations());
    }
  }

  hasEnoughGooseWeight(): boolean {
    return familiarWeight(this.goose) >= 6;
  }

  getNumberOfQuestsWithAdventures(): number {
    let count = 0;

    loop: for (let quest of this.quester.getAllQuests()) {
      if (quest.level() < 1 || quest.status() == QuestStatus.COMPLETED) {
        continue;
      }

      for (let loc of quest.getLocations()) {
        let advs = this.absorbs.getAdventuresInLocation(this.defeated, loc);

        if (advs == null || advs.turnsToGain == 0) {
          continue;
        }

        count++;
        continue loop;
      }
    }

    return count;
  }

  getQuestsWithAdventures(): [QuestInfo, AdventureLocation][] {
    // We want to generate our adventues

    let toReturn: [QuestInfo, AdventureLocation][] = [];

    this.viableQuests.forEach((q) => {
      let run = q.run();

      if (run.location == null && q.getAbsorbs == null) {
        return;
      }

      let outfit = run.outfit;

      if (
        outfit != null &&
        ((outfit.minusCombatWeight > 0 && hasCombatSkillActive()) ||
          (outfit.plusCombatWeight > 0 && hasNonCombatSkillActive()))
      ) {
        return;
      }

      let advs;

      if (q.getAbsorbs != null) {
        advs = this.absorbs.getAdventuresByAbsorbs(
          this.defeated,
          q.getAbsorbs()
        );
      } else {
        advs = this.absorbs.getAdventuresInLocation(
          this.defeated,
          run.location
        );
      }

      if (advs == null || advs.turnsToGain == 0) {
        return;
      }

      toReturn.push([q, advs]);
    });

    toReturn.sort((q1, q2) => {
      if (q1[0].status() != q2[0].status()) {
        return 0;
      }

      return q1[1].turnsToGain - q2[1].turnsToGain;
    });

    return toReturn;
  }

  getQuestsWithoutAdventures(): [QuestInfo, AdventureLocation][] {
    // We want to level up our goose here

    let toReturn: [QuestInfo, AdventureLocation][] = [];

    this.viableQuests.forEach((q) => {
      let run = q.run();

      let outfit = run.outfit;

      if (
        outfit != null &&
        ((outfit.minusCombatWeight > 0 && hasCombatSkillActive()) ||
          (outfit.plusCombatWeight > 0 && hasNonCombatSkillActive()))
      ) {
        return;
      }

      if (run.location == null) {
        toReturn.push([q, null]);
        return;
      }

      let advs = this.absorbs.getAdventuresInLocation(
        this.defeated,
        run.location,
        true
      );

      if (advs != null && advs.turnsToGain > 0) {
        return;
      }

      toReturn.push([q, advs]);
    });

    return toReturn;
  }

  getNonQuestsWithSkills(): [AdventureLocation, number][] {
    let toReturn: [AdventureLocation, number][] = this.goodAbsorbs
      .filter(
        (a) =>
          a.skills.size > 0 &&
          canAdv(a.location) &&
          !this.questLocations.includes(a.location)
      )
      .map((a) => {
        return [a, a.expectedTurnsProfit + this.generateWeights(a.skills) / 10];
      });

    return toReturn.filter((a) => a[1] > 0);
  }

  getNonQuestsWithAdventures(): [AdventureLocation, number][] {
    // We want to generate our adventues
    // Returns a location and the adventures generated, with helpful skills given a weight / 10

    let toReturn: [AdventureLocation, number][] = this.goodAbsorbs
      .filter(
        (a) =>
          a.turnsToGain > 0 &&
          canAdv(a.location) &&
          !this.questLocations.includes(a.location)
      )
      .map((a) => {
        return [a, a.expectedTurnsProfit + this.generateWeights(a.skills) / 10];
      });

    return toReturn.filter((a) => a[1] > 0);
  }

  getNonQuestsWithoutAdventures(): [AdventureLocation, number][] {
    // We want to level up our goose here, and grab w/e required skills
    // Returns locations and the weight, where helpful skills are weight of 1, required are weight of 2

    let toReturn: [AdventureLocation, number][] = this.goodAbsorbs
      .filter(
        (a) =>
          a.turnsToGain == 0 &&
          canAdv(a.location) &&
          !this.questLocations.includes(a.location)
      )
      .map((a) => {
        return [a, this.generateWeights(a.skills)];
      });

    return toReturn.filter((a) => a[1] > 0);
  }

  getModifiedStatus(
    status: QuestStatus,
    runned: QuestAdventure,
    hasBlessing: boolean
  ) {
    if (status != QuestStatus.READY) {
      return status;
    }

    let outfit = runned.outfit;

    if (outfit != null) {
      if (outfit.minusCombatWeight > 0 && hasBlessing) {
        status = QuestStatus.FASTER_LATER;
      } else if (myMp() < 50) {
        if (outfit.minusCombatWeight > 0 && !hasNonCombatSkillActive()) {
          status = QuestStatus.FASTER_LATER;
        } else if (
          outfit.plusCombatWeight > 0 &&
          haveSkill(Skill.get("Piezoelectric Honk")) &&
          !hasCombatSkillActive()
        ) {
          status = QuestStatus.FASTER_LATER;
        }
      }
    }

    return status;
  }

  generateWeights(skills: Map<Absorb, string>): number {
    let weight = 0;
    let handy = this.absorbs.getUsefulSkills();
    let mustHave = this.absorbs.getMustHaveSkills();

    for (let k of skills.keys()) {
      let w = 0;

      if (!GreySettings.speedRunMode && handy.has(k.skill)) {
        //   w = GreySettings.handySkillsWeight;
      } else if (mustHave.has(k.skill)) {
        w = GreySettings.usefulSkillsWeight;
      } else {
        continue;
      }

      weight += w;
    }

    return weight;
  }

  getRecommendedFamiliars(): Familiar[] {
    return this.quester
      .getAllQuests()
      .map((q) => {
        if (q.hasFamiliarRecommendation == null) {
          return null;
        }

        let fam = q.hasFamiliarRecommendation();

        if (fam == null) {
          return null;
        }

        let status = q.status();

        if (status == QuestStatus.COMPLETED) {
          return null;
        }

        return fam;
      })
      .filter((f) => f != null);
  }

  getQuestColor(status: QuestStatus): string {
    switch (status) {
      case QuestStatus.COMPLETED:
        return "green";
      case QuestStatus.FASTER_LATER:
        return "gray";
      case QuestStatus.NOT_READY:
        return "red";
      case QuestStatus.READY:
        return "green";
    }
  }

  printStatus() {
    let hasBlessing =
      haveEffect(Effect.get("Brother Corsican's Blessing")) +
        haveEffect(Effect.get("A Girl Named Sue")) >
      0;

    for (let quest of this.viableQuests) {
      let status = quest.status();
      status = this.getModifiedStatus(status, quest.run(), hasBlessing);

      let line =
        "<u>" +
        quest.getId() +
        "</u>: " +
        doColor(QuestStatus[status], this.getQuestColor(status));

      printHtml(line);
    }
  }

  findGoodVisit(): FoundAdventure {
    let abortNotEnoughAdventures =
      myAdventures() <= GreySettings.adventuresBeforeAbort;
    let generateAdventuresOrAbort: boolean =
      myAdventures() <= GreySettings.adventuresGenerateIfPossibleOrAbort;

    if (abortNotEnoughAdventures) {
      print(
        "We don't have enough adventures to feel comfortable, aborting..",
        "red"
      );
      return;
    }

    let mustBeDone = this.viableQuests.filter(
      (q) => q.mustBeDone != null && q.mustBeDone()
    );

    if (
      mustBeDone.length > 1 &&
      mustBeDone.filter(
        (m) => m.needAdventures == null || m.needAdventures() > 0
      ).length <= 1
    ) {
      mustBeDone = mustBeDone.filter(
        (m) => m.needAdventures != null && m.needAdventures() <= 0
      );

      if (mustBeDone.length > 1) {
        mustBeDone = mustBeDone.splice(1);
      }
    }

    if (mustBeDone.length > 1) {
      print(
        "Multiple quests demand to be done! " +
          mustBeDone.map((q) => q.getId()).join(", "),
        "red"
      );
      print("This is not a real error, but not that great either.", "red");
    }

    if (mustBeDone.length > 0) {
      return {
        quest: mustBeDone[0],
        locationInfo: this.absorbs.getAdventuresInLocation(
          this.defeated,
          mustBeDone[0].run().location,
          true
        ),
      };
    }

    if (generateAdventuresOrAbort && !this.hasEnoughGooseWeight()) {
      print(
        "We need more adventures but we're not ready for a reabsorb..",
        "red"
      );
      return;
    }

    let getPredicts = () => {
      if (predicts == null) {
        predicts = currentPredictions();
      }

      return predicts;
    };
    let hasBlessing =
      haveEffect(Effect.get("Brother Corsican's Blessing")) +
        haveEffect(Effect.get("A Girl Named Sue")) >
      0;

    let quests: [QuestInfo, AdventureLocation][] = [];
    let nonQuests: [AdventureLocation, number][] = [];

    if (this.hasEnoughGooseWeight() && myLevel() >= 5) {
      quests = this.getQuestsWithAdventures();
      nonQuests = this.getNonQuestsWithAdventures();

      nonQuests = nonQuests.filter(([loc, num]) => {
        let mon = getPredicts().get(loc.location);

        loc.shouldRunOrb = mon == null || loc.monsters.includes(mon);
        loc.ensuredOrb = mon != null && loc.monsters.includes(mon);

        return loc.shouldRunOrb;
      });
    } else {
      // It doesn't have enough goose weight to absorb adventures, so lets try do non-quests without adventures
      // This is mostly skills
      nonQuests = this.getNonQuestsWithoutAdventures();
    }

    if (quests.length + nonQuests.length == 0) {
      quests = this.getQuestsWithoutAdventures();

      if (quests.length == 0 && nonQuests.length == 0) {
        quests = this.getQuestsWithAdventures();
      }
    }

    // Now we see if we can find quests that are ready to run.
    // If we can't, then we see if we can find non-quests that are ready to run
    // If we can't, then we see if we can find quests that don't want to run
    // If we can't, then we abort.

    let bestQuest: [QuestInfo, AdventureLocation];
    let bestStatus: QuestStatus;
    let bestWantsResetOrb: boolean;
    let bestWantsToRunOrb: boolean;
    let predicts: Map<Location, Monster>;

    for (let quest of quests) {
      let status = quest[0].status();
      let runned: QuestAdventure;
      let wantToResetOrb: boolean = false;
      let wantsToRunOrb: boolean = false;

      if (
        this.hasEnoughGooseWeight() &&
        quest[1] != null &&
        quest[1].monsters.length > 0
      ) {
        let a = quest[1];
        runned = quest[0].run();

        let current = getPredicts().get(a.location);

        if (current == null || a.monsters.includes(current)) {
          wantsToRunOrb = true;
          a.shouldRunOrb = true;
          a.ensuredOrb = current != null && a.monsters.includes(current);

          if (
            current != null &&
            this.hasEnoughGooseWeight() &&
            a.turnsToGain > 0
          ) {
            a.expectedTurnsProfit = a.turnsToGain - 1;
          }
        } else {
          wantToResetOrb = true;
        }
      }

      if (status == QuestStatus.READY) {
        if (runned == null) {
          runned = quest[0].run();
        }

        status = this.getModifiedStatus(status, runned, hasBlessing);
      }

      if (bestQuest != null) {
        if (bestWantsToRunOrb) {
          if (status >= bestStatus) {
            continue;
          }
        } else if (!bestWantsResetOrb && wantToResetOrb) {
          continue;
        } else if (!wantsToRunOrb) {
          if (status >= bestStatus) {
            continue;
          }
        }
      }

      bestQuest = quest;
      bestStatus = quest[0].status();
      bestWantsResetOrb = wantToResetOrb;
      bestWantsToRunOrb = wantsToRunOrb;
    }

    if (bestQuest != null && bestWantsToRunOrb) {
      return {
        quest: bestQuest[0],
        locationInfo: bestQuest[1],
      };
    }

    nonQuests.sort((v1, v2) => v2[1] - v1[1]);

    if (nonQuests.length > 0) {
      let best: AdventureLocation;

      for (let non of nonQuests) {
        let mon = getPredicts().get(non[0].location);

        non[0].shouldRunOrb =
          this.hasEnoughGooseWeight() &&
          (mon == null || non[0].monsters.includes(mon));

        // If we already have a best, and the would-be doesn't want to run orb
        if (best != null && !non[0].shouldRunOrb) {
          continue;
        }

        best = non[0];

        if (best.shouldRunOrb) {
          break;
        }
      }

      if (best != null && (bestQuest == null || best.shouldRunOrb)) {
        return {
          quest: null,
          locationInfo: best,
        };
      }
    }

    if (bestQuest != null) {
      return {
        quest: bestQuest[0],
        locationInfo: bestQuest[1],
      };
    }

    print(
      "Failed to find any quests that are willing to run, and failed to find any non-quest locations willing to run.",
      "red"
    );
    return null;
  }
}

class GreyQuester {
  registry: QuestRegistry = new QuestRegistry();

  getAllQuests(): QuestInfo[] {
    return this.registry.getQuestsInOrder();
  }

  getDoableQuests(): QuestInfo[] {
    let quests: QuestInfo[] = [];

    let tryAdd = (q: QuestInfo) => {
      if (q.level() > myLevel()) {
        return;
      }

      if (
        q.level() * (haveSkill(Skill.get("Infinite Loop")) ? 1 : 6) >
        myBasestat(Stat.get("Muscle"))
      ) {
        return;
      }

      let status = q.status();

      if (status == QuestStatus.NOT_READY || status == QuestStatus.COMPLETED) {
        return;
      }

      quests.push(q);
    };

    this.getAllQuests().forEach((q) => {
      tryAdd(q);
    });

    return quests;
  }
}
