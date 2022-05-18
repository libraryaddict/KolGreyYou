import {
  myAdventures,
  mallPrice,
  getLocationMonsters,
  toMonster,
  getProperty,
  toInt,
  toItem,
  Location,
  availableAmount,
  canInteract,
  choiceFollowsFight,
  currentRound,
  fightFollowsChoice,
  handlingChoice,
  Item,
  Monster,
} from "kolmafia";

export function hasBanished(location: Location, banish: BanishType): boolean {
  let banished = getBanished().filter((b) => b.banisher.type == banish);

  if (banish.length == 0) {
    return false;
  }

  for (let mob of Object.keys(getLocationMonsters(location)).map((m) =>
    Monster.get(m)
  )) {
    if (banished.filter((b) => b.monster == mob).length == 0) {
      continue;
    }

    return true;
  }

  return false;
}

export enum BanishType {
  BALEFUL_HOWL = "baleful howl",
  BANISHING_SHOUT = "banishing shout",
  BATTER_UP = "batter up!",
  BEANCANNON = "beancannon",
  BE_A_MIND_MASTER = "Be a Mind Master",
  BLART_SPRAY_WIDE = "B. L. A. R. T. Spray (wide)",
  BOWL_A_CURVEBALL = "Bowl a Curveball",
  BREATHE_OUT = "breathe out",
  BUNDLE_OF_FRAGRANT_HERBS = "bundle of &quot;fragrant&quot; herbs",
  CHATTERBOXING = "chatterboxing",
  CLASSY_MONKEY = "classy monkey",
  COCKTAIL_NAPKIN = "cocktail napkin",
  CRYSTAL_SKULL = "crystal skull",
  CURSE_OF_VACATION = "curse of vacation",
  DEATHCHUCKS = "deathchucks",
  DIRTY_STINKBOMB = "dirty stinkbomb",
  DIVINE_CHAMPAGNE_POPPER = "divine champagne popper",
  FEEL_HATRED = "Feel Hatred",
  GINGERBREAD_RESTRAINING_ORDER = "gingerbread restraining order",
  HAROLDS_BELL = "harold's bell",
  HOWL_OF_THE_ALPHA = "howl of the alpha",
  HUMAN_MUSK = "human musk",
  ICE_HOTEL_BELL = "ice hotel bell",
  ICE_HOUSE = "ice house",
  KGB_TRANQUILIZER_DART = "KGB tranquilizer dart",
  LICORICE_ROPE = "licorice rope",
  LOUDER_THAN_BOMB = "louder than bomb",
  MAFIA_MIDDLEFINGER_RING = "mafia middle finger ring",
  NANORHINO = "nanorhino",
  PANTSGIVING = "pantsgiving",
  PEEL_OUT = "peel out",
  PULLED_INDIGO_TAFFY = "pulled indigo taffy",
  REFLEX_HAMMER = "Reflex Hammer",
  SABER_FORCE = "Saber Force",
  SHOW_YOUR_BORING_FAMILIAR_PICTURES = "Show your boring familiar pictures",
  SMOKE_GRENADE = "smoke grenade",
  SNOKEBOMB = "snokebomb",
  SPOOKY_MUSIC_BOX_MECHANISM = "spooky music box mechanism",
  SPRING_LOADED_FRONT_BUMPER = "Spring-Loaded Front Bumper",
  STAFF_OF_THE_STANDALONE_CHEESE = "staff of the standalone cheese",
  STINKY_CHEESE_EYE = "stinky cheese eye",
  SYSTEM_SWEEP = "System Sweep",
  TENNIS_BALL = "tennis ball",
  THROW_LATTE_ON_OPPONENT = "Throw Latte on Opponent",
  THUNDER_CLAP = "thunder clap",
  TRYPTOPHAN_DART = "tryptophan dart",
  ULTRA_HAMMER = "Ultra Hammer",
  V_FOR_VIVALA_MASK = "v for vivala mask",
  WALK_AWAY_FROM_EXPLOSION = "walk away from explosion",
}

class Banisher {
  item: Item;
  turnsBanish: number;
  type: BanishType;
}

export class Banish {
  monster: Monster;
  turnBanished: number;
  banisher: Banisher;
}

export function getBanished(): Banish[] {
  let prop: string[] = getProperty("banishedMonsters").split(":");
  let banishes: Banish[] = [];
  let banishers = getBanishers();

  for (let i = 0; i + 2 < prop.length; i += 3) {
    let monsterName = toMonster(prop[i]);
    let banisherName = prop[i + 1];
    let turnBanished = toInt(prop[i + 2]);

    let banisher = new Banish();
    banisher.monster = monsterName;
    let banishType =
      BanishType[getEnumKeyByEnumValue(BanishType, banisherName)];
    banisher.banisher = banishers.find((b) => b.type == banishType);
    banisher.turnBanished = turnBanished;

    if (banisher.banisher == null) {
      banisher.banisher = new Banisher();
      banisher.banisher.type = banishType;
    }

    banishes.push(banisher);
  }

  return banishes;
}

export function getEnumKeyByEnumValue(myEnum, enumValue: string) {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);

  return keys.length > 0 ? keys[0] : null;
}

export class BanishManager {
  getGoodBanishers(
    location: Location,
    turnsSpendingInZone: number = myAdventures()
  ): Banisher[] {
    let banishers: Banisher[] = getBanishers().filter(
      (b) => !this.isInUse(b, location)
    );

    if (
      choiceFollowsFight() ||
      currentRound() != 0 ||
      fightFollowsChoice() ||
      handlingChoice() ||
      !canInteract()
    ) {
      banishers = banishers.filter((b) => availableAmount(b.item) > 0);
    }

    banishers.sort((b1, b2) => {
      return (
        this.getTotalCost(b1, turnsSpendingInZone) -
        this.getTotalCost(b2, turnsSpendingInZone)
      );
    });

    return banishers;
  }

  getTotalCost(banisher: Banisher, turnsToSpend: number) {
    let cost = mallPrice(banisher.item);

    if (banisher.turnsBanish == -1) {
      return cost;
    }

    let itemsToBuy = Math.ceil(turnsToSpend / banisher.turnsBanish);

    return cost * itemsToBuy;
  }

  getMonsterLocations(monster: Monster): Location[] {
    let locations: Location[] = [];

    for (let location of Location.all()) {
      let monsters = this.getMonstersAtLocation(location);

      if (!monsters.includes(monster)) {
        continue;
      }

      locations.push(location);
    }

    return locations;
  }

  getMonstersAtLocation(location: Location): Monster[] {
    return Object.keys(getLocationMonsters(location)).map((s) => toMonster(s));
  }

  isInUse(banisher: Banisher, location: Location): boolean {
    return (
      getBanished().find(
        (b) =>
          b.banisher.type == banisher.type &&
          this.getMonsterLocations(b.monster).includes(location)
      ) != null
    );
  }
}

function getBanishers(): Banisher[] {
  let banishers: [BanishType, string, number][] = [
    [BanishType.HUMAN_MUSK, "Human Musk", -1],
    [BanishType.BE_A_MIND_MASTER, "Daily Affirmation: Be a Mind Master", 80],
    [BanishType.TENNIS_BALL, "Tennis Ball", 30],
    [BanishType.LOUDER_THAN_BOMB, "Louder Than Bomb", 20],
    [BanishType.CRYSTAL_SKULL, "Crystal Skull", 20],
    [BanishType.DIVINE_CHAMPAGNE_POPPER, "Divine Champagne Popper", 5],
    [BanishType.ICE_HOUSE, "Ice House", -1],
  ];

  return banishers.map((b) => {
    let banish = new Banisher();
    banish.item = toItem(b[1]);
    banish.turnsBanish = b[2];
    banish.type = b[0];

    return banish;
  });
}
