import {
  availableAmount,
  buyUsingStorage,
  cliExecute,
  Familiar,
  getProperty,
  getRelated,
  haveFamiliar,
  Item,
  mallPrice,
  outfitPieces,
  print,
  storageAmount,
  use,
} from "kolmafia";

export function getBanishers() {
  // Scrapbook
  // Bowl a curveball
  // Middle finger ring
  // Grey You banisher skill
}

export function getYellowRays() {
  // Yellow Rocket
  // 9 Volt battery
}

export function getSniffers() {
  // Nosy Nose fam
}

export function getCopiers() {
  // Backup Camera
  // Cloning Kit
  // Combat Locket
  // 4-D camera
}

export class GreyPulls {
  static pullFratWarOutfit() {
    for (let i of outfitPieces("Frat Warrior Fatigues")) {
      if (availableAmount(i) > 0) {
        continue;
      }

      GreyPulls.tryPull(i);
    }
  }

  static pullDeckOfLewdCards() {
    GreyPulls.tryPull(Item.get("deck of lewd playing cards"));
  }

  static pullLynrdProtesters() {
    for (let i of [
      "lynyrdskin breeches",
      "lynyrdskin cap",
      "lynyrdskin tunic",
    ].map((s) => Item.get(s))) {
      GreyPulls.tryPull(i);
    }
  }

  static pullBoxOfMatches() {
    GreyPulls.tryPull(Item.get("book of matches"));
  }

  static pullStartingGear() {
    GreyPulls.tryPull(Item.get("yule hatchet"));
    GreyPulls.tryPull(Item.get("mafia thumb ring"));

    if (storageAmount(Item.get("HOA regulation book")) > 0) {
      GreyPulls.tryPull(Item.get("HOA regulation book"));
    } else {
      GreyPulls.tryPull(Item.get("Space Trip safety headphones"));
    }

    GreyPulls.tryPull(Item.get("Hemlock Helm"));
    GreyPulls.tryPull(Item.get('"Remember the Trees" Shirt'));
  }

  static pullNinjaGear() {
    GreyPulls.tryPull(Item.get("ninja rope"));
    GreyPulls.tryPull(Item.get("ninja crampons"));
    GreyPulls.tryPull(Item.get("ninja carabiner"));
  }

  static pullScrip() {
    GreyPulls.tryPull(Item.get("Shore Inc. Ship Trip Scrip"));
  }

  static pullSmut() {
    GreyPulls.tryPull(Item.get("smut orc keepsake box"));
  }

  static pullEnchantedBean() {
    GreyPulls.tryPull(Item.get("enchanted bean"));
  }

  static pullMeatBuffers() {
    GreyPulls.tryPull(Item.get("Mick's IcyVapoHotness Inhaler"));
  }

  static pullOre() {
    if (getProperty("questL08Trapper") != "step1") {
      return;
    }

    let ore = Item.get(getProperty("trapperOre"));

    if (ore == Item.get("none") || availableAmount(ore) >= 3) {
      return;
    }

    this.tryPull(ore);
  }

  static pullZappableKey() {
    let items = getZappables(Item.get("Jarlsberg's key")).filter(
      (i) => !i.quest
    );

    for (let i of items) {
      if (storageAmount(i) <= 0) {
        continue;
      }

      this.tryPull(i);
      return;
    }

    items.sort((i1, i2) => mallPrice(i1) - mallPrice(i2));

    this.tryPull(items[0]);
  }

  static pullRatTangles() {
    GreyPulls.tryPull(Item.get("tangle of rats tails"));
  }

  static pullGiantsCastle() {
    for (let s of ["Mohawk Wig", "Amulet of Extreme Plot Significance"].map(
      (s) => Item.get(s)
    )) {
      if (availableAmount(s) > 0) {
        continue;
      }

      GreyPulls.tryPull(s);
    }
  }

  static pullRusty() {
    GreyPulls.tryPull(Item.get("rusty hedge trimmers"));
  }

  static pullStarChart() {
    GreyPulls.tryPull(Item.get("Star Chart"));
  }

  static tryPull(item: Item, maxCost: number = 30_000) {
    if (storageAmount(item) == 0) {
      buyUsingStorage(item, 1, maxCost);
    }

    if (storageAmount(item) == 0) {
      throw "Unable to pull " + item.name;
    }

    cliExecute("pull " + item.name);
  }
}

export class GreyClovers {
  static clover: Item = Item.get("11-leaf Clover");

  static doOres() {
    // 2
    use(this.clover);
  }

  static doWand() {
    // 1
    use(this.clover);
  }
}

export class GreyVortex {
  static doBatCave() {
    // 20
  }

  static doHarem() {
    // 20
  }

  static doHiddenTemple() {
    // 20
  }

  static doSmutOrcs() {
    // 20
  }

  static doCrypt() {
    // 20
  }
}

export class GreyCombatLocket {
  static doSystemSweep() {}

  static doInfiniteLoop() {}

  static doFantasyBandit() {}

  static doMountainMan() {}
}

export function getZappables(item: Item): Item[] {
  let items: Item[] = [];

  Object.keys(getRelated(item, "zap")).forEach((s) => {
    let i = Item.get(s);

    if (items.includes(i)) {
      return;
    }

    items.push(i);
  });

  return items;
}

enum Required {
  MUST = "You must have this",
  VERY_USEFUL = "I'd prefer if you had this",
  USEFUL = "Very useful, but can skip",
  MINOR = "Minor, can skip",
  NOTE = "",
}

export class GreyRequirements {
  hasRequired() {
    let dontHave: [string, Required][] = [];

    if (!haveFamiliar(Familiar.get("Grey Goose"))) {
      dontHave.push([
        "Grey Goose, why even play this path without it",
        Required.MUST,
      ]);
    }

    if (availableAmount(Item.get("Combat Lover's Locket")) == 0) {
      dontHave.push([
        "Combat Lovers Locket, currently hardcoded",
        Required.MUST,
      ]);
    } else {
      dontHave.push([
        "Combat Lovers Locket - Make sure you have 'Pygmy witch lawyer' & 'Fantasy Bandit' in it!",
        Required.NOTE,
      ]);
    }

    if (availableAmount(Item.get("industrial fire extinguisher")) == 0) {
      dontHave.push([
        "industrial fire extinguisher, minor, but hardcoded so a must",
        Required.MUST,
      ]);
    }

    if (availableAmount(Item.get("backup camera")) == 0) {
      dontHave.push(["Backup Camera", Required.MUST]);
    }

    if (
      availableAmount(Item.get("unwrapped knock-off retro superhero cape")) == 0
    ) {
      dontHave.push([
        "unwrapped knock-off retro superhero cape, currently hardcoded",
        Required.MUST,
      ]);
    }

    dontHave.push([
      "Can't see if you own the mayday supply, but..",
      Required.USEFUL,
    ]);

    if (availableAmount(Item.get("Unbreakable Umbrella")) == 0) {
      dontHave.push([
        "Unbreakable Umbrella - Current hardcoded, so a must",
        Required.MUST,
      ]);
    }

    if (
      availableAmount(Item.get("Cosmic Bowling Ball")) == 0 &&
      getProperty("cosmicBowlingBallReturnCombats") == "-1"
    ) {
      dontHave.push(["Cosmic Bowling Ball", Required.VERY_USEFUL]);
    }

    if (availableAmount(Item.get("miniature crystal ball")) == 0) {
      dontHave.push(["miniature crystal ball", Required.MUST]);
    }

    if (!haveFamiliar(Familiar.get("Short Order Cook"))) {
      dontHave.push([
        "Short Order Cook - Only useful for the first 10 or so turns though",
        Required.USEFUL,
      ]);
    }

    if (availableAmount(Item.get("Clan VIP Lounge key")) == 0) {
      dontHave.push(["Clan VIP Invitation", Required.MUST]);
    }

    if (availableAmount(Item.get("Familiar Scrapbook")) == 0) {
      dontHave.push(["Familiar Scrapbook", Required.USEFUL]);
    }

    if (availableAmount(Item.get("Powerful Glove")) == 0) {
      dontHave.push(["Powerful Glove", Required.VERY_USEFUL]);
    }

    if (availableAmount(Item.get("Cursed Magnifying Glass")) == 0) {
      dontHave.push([
        "Cursed Magnifying Glass, only really used for lobsters currently",
        Required.MINOR,
      ]);
    }

    if (availableAmount(Item.get("Cargo Cultist Shorts")) == 0) {
      dontHave.push([
        "Cargo Cultist Shorts, does save 5? turns",
        Required.MINOR,
      ]);
    }

    if (
      availableAmount(Item.get("HOA regulation book")) +
        availableAmount(Item.get("Space Trip safety headphones")) ==
      0
    ) {
      dontHave.push([
        "Need one of: HOA regulation book || Space Trip safety headphones, they save you 10+ turns",
        Required.VERY_USEFUL,
      ]);
    }

    if (availableAmount(Item.get("Mafia Thumb Ring")) == 0) {
      dontHave.push(["Mafia Thumb Ring", Required.MUST]);
    }

    if (availableAmount(Item.get("Yule Hatchet")) == 0) {
      dontHave.push(["Yule Hatchet (Come on, its cheap)", Required.MUST]);
    }

    if (availableAmount(Item.get("Deck of lewd playing cards")) == 0) {
      dontHave.push(["Deck of lewd playing cards", Required.USEFUL]);
    }

    if (availableAmount(Item.get("SongBoom™ BoomBox")) == 0) {
      dontHave.push(["SongBoom™ BoomBox", Required.MINOR]);
    }

    for (let [name, required] of dontHave) {
      let color: string = "green";

      if (required == Required.MUST) {
        color = "red";
      } else if (required == Required.VERY_USEFUL) {
        color = "orange";
      } else if (required == Required.USEFUL) {
        color = "blue";
      } else if (required == Required.MINOR) {
        color = "gray";
      }

      print(name + (required.length > 0 ? " = " + required : ""), color);
    }

    print("End Requirements.");
    // TODO Camelcalf?
  }
}