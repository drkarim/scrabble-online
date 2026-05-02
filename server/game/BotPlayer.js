const WordValidator = require('./WordValidator');

const BOARD_SIZE = 15;

// Common short words the bot will attempt to play
const BOT_WORD_LIST = [
  'AA','AB','AD','AE','AG','AH','AI','AL','AM','AN','AR','AS','AT','AW','AX','AY',
  'BA','BE','BI','BO','BY','DA','DE','DI','DO','EA','ED','EF','EH','EL','EM','EN',
  'ER','ES','ET','EX','FA','FE','GI','GO','HA','HE','HI','HO','ID','IF','IN','IS',
  'IT','JO','KA','KI','LA','LI','LO','MA','ME','MI','MO','MU','MY','NA','NE','NO',
  'NU','OD','OE','OF','OH','OI','OM','ON','OO','OP','OR','OS','OW','OX','OY','PA',
  'PE','PI','PO','QI','RE','SI','SO','TA','TE','TI','TO','UH','UM','UN','UP','US',
  'UT','WE','WO','XI','XU','YA','YE','YO','ZA',
  'ACE','ACT','ADD','AGE','AID','AIM','AIR','ALL','AMP','AND','ANE','ANI','ANT','ANY',
  'APE','ARC','ARE','ARK','ARM','ART','ASH','ASK','ATE','AXE','AYE',
  'BAD','BAG','BAN','BAR','BAT','BAY','BED','BIG','BIN','BIT','BOA','BOG','BOO','BOW',
  'BOX','BOY','BRA','BUD','BUG','BUM','BUN','BUS','BUT','BUY',
  'CAB','CAN','CAP','CAR','CAT','CEE','COD','COG','CON','COO','COP','COT','COW','CUB',
  'CUD','CUP','CUR','CUT',
  'DAB','DAD','DAM','DAY','DEB','DIM','DIN','DIP','DOC','DOE','DOG','DUG','DUN',
  'EAR','EAT','EGO','ELF','ELK','ELM','EMU','END','EON','ERA','ERN',
  'FAD','FAN','FAR','FAT','FAX','FED','FIG','FIN','FIT','FLU','FLY',
  'GAG','GEL','GEM','GET','GIG','GIN','GOD','GOO',
  'HAD','HAM','HAS','HAT','HAW','HEP','HER','HEM','HEW','HID','HIM','HIT',
  'ICE','ILL','IMP','INK','ION','IRE','IRK',
  'JAB','JAM','JAR','JAW','JET','JIG','JOB','JOG','JOY','JUG',
  'KID','KIN','KIT',
  'LAD','LAP','LAW','LAX','LAY','LEG','LET','LID','LIP','LIT','LOB','LOG','LOT','LOW',
  'MAD','MAN','MAP','MAR','MAT','MAW','MEN','MET','MID','MIX','MOB','MOO','MOP','MUD',
  'MUG','MUM',
  'NAB','NAP','NET','NIL','NIP','NIT','NOB','NOR','NOT','NOW','NUN',
  'OAF','OAK','OAR','OAT','ODD','OWL','OWN',
  'PAD','PAL','PAN','PAP','PAR','PAT','PAW','PEA','PEE','PEG','PEN','PET','PIG','PIN',
  'PIT','PLY','POD','POP','POT','PRO',
  'RAD','RAG','RAM','RAN','RAP','RAT','RAY','REC','RED','REF','REP','RES','REV','RIB',
  'RID','RIG','RIM','RIP','ROB','ROD','ROE','ROT','ROW','RUG','RUM','RUN',
  'SAC','SAG','SAP','SAT','SAW','SAY','SEA','SET','SEW','SIP','SIR','SIT','SOB','SOD',
  'SON','SOP','SOT','SOW','SOY','SPA','SUB','SUM',
  'TAB','TAD','TAP','TAR','TAX','TEA','TED','TEN','TIE','TIN','TIP','TOE','TON','TOO',
  'TOR','TOT','TOW','TOY','TUB','TUG','TUN',
  'USE','UTE',
  'VAN','VAT','VET','VEX','VIA','VIE','VOW',
  'WAD','WAG','WAR','WAS','WAX','WAY','WEB','WED','WEE','WET','WIT','WIZ','WON','WOO',
  'YAK','YAM','YAP','YEA','YEN','YES','YET','YEW',
  'ZAP','ZAX','ZED','ZIP',
  'ABLE','ACED','ACHE','ACID','ACRE','ACTS','ADDS','AGED','AIDE','AIMS','AIRS','ALOE',
  'ALSO','ALTO','AMEN','AMID','AMPS','ANDS','ANEW','ANTS','APES','APEX','AQUA',
  'AREA','ARKS','ARMY','ARTS','ASKS','ATOP','AUKS','AURA','AUTO','AVID','AVOW','AWAY',
  'AWES','AWLS','AWRY','AXES','AXIS','AXLE',
  'BABE','BACK','BADE','BAGS','BAIL','BAIT','BAKE','BALE','BALL','BALM','BAND','BANE',
  'BANG','BARD','BARE','BARN','BARS','BASH','BASS','BATH','BATS','BAWL','BAYS','BEAD',
  'BEAM','BEAN','BEAR','BEAT','BECK','BEER','BEES','BEET','BELL','BELT','BEST','BIAS',
  'BILE','BILL','BINS','BITE','BITS','BLOW','BLUE','BLUR','BOAR','BODE','BOIL','BOLD',
  'BOLT','BORE','BORN','BOSS','BRAT','BRAY','BRED','BRIM','BROW','BUCK','BUFF','BULL',
  'BUNG','BURP','BURR','BUSY','BYTE',
  'CAGE','CAKE','CALL','CALM','CAME','CANS','CAPE','CAPS','CARE','CARS','CASE','CASH',
  'CAST','CATS','CAVE','CENT','CHAR','CHAT','CHEF','CHEW','CHIP','CHOP','CLAM','CLAN',
  'CLAP','CLAW','CLAY','CLIP','CLOD','CLOT','CLUE','COAL','COAT','COCK','CODE','COIL',
  'COIN','COLA','COLD','COMB','COME','CONE','CONS','CORD','CORE','CORK','CORN','COWL',
  'CRAB','CREW','CROP','CROW','CUBE','CUPS','CURE','CURL',
  'DAMP','DARK','DART','DASH','DATA','DATE','DAYS','DAZE','DEAD','DEAF','DEAL','DEBT',
  'DECK','DEER','DEFT','DENS','DENY','DESK','DIAL','DIKE','DILL','DINE','DISK','DIVE',
  'DOCK','DOSE','DOTE','DOVE','DOWN','DRAG','DRAW','DRIP','DROP','DULL','DUMP','DUNE',
  'DUNG','DUPE','DUST',
  'EACH','EARL','EARN','EASE','EDIT','EMIT','ENVY','EPIC','ETCH','EVEN','EVIL','EXAM',
  'FACE','FACT','FADE','FAKE','FALL','FAME','FANG','FEAR','FEAT','FELL','FERN','FILM',
  'FIND','FIRE','FISH','FLAG','FLAP','FLAW','FLAY','FLEA','FLEX','FLEW','FLIP','FLOG',
  'FLOP','FLOW','FOAM','FOND','FORD','FORE','FORK','FORM','FORT','FOUL','FOWL','FRAY',
  'FREE','FUME','FURL',
  'GALE','GALL','GAPE','GASH','GATE','GAZE','GEAR','GIBE','GIVE','GLOB','GORE','GRAB',
  'GRIN','GRIP','GRIT','GROW','GUSH','GUST',
  'HALE','HALF','HALT','HANG','HANK','HARD','HARE','HARM','HARP','HAUL','HAVE','HAWK',
  'HAZE','HEAL','HEAP','HEAT','HEEL','HELM','HELP','HEMP','HERB','HERD','HIGH','HILL',
  'HILT','HIVE','HOCK','HOLE','HOLY','HOME','HOOK','HOSE','HULL','HUMP',
  'ICON','IDLE','IDOL','ILLS','INCH','IRIS','IRON','ITCH',
  'JADE','JAIL','JEST','JOIN','JOKE','JOTS','JOWL','JUMP',
  'KEEN','KEEL','KEEP','KIND','KING','KNOB','KNOT',
  'LAKE','LAME','LAMP','LAND','LARD','LARK','LAST','LATE','LAUD','LAWN','LAZY','LEAD',
  'LEAF','LEAK','LEAN','LEAP','LEER','LEFT','LEND','LEVY','LICK','LILY','LIME','LIST',
  'LOBE','LODE','LOFT','LONE','LOOP','LORE','LOUT','LOVE','LURE','LURK',
  'MAKE','MANE','MANY','MARE','MARK','MASH','MASS','MAST','MATE','MAUL','MEAN','MEET',
  'MELT','MERE','MIRE','MOAN','MOCK','MOLD','MOLE','MOOD','MOON','MORE','MOTH','MUCK',
  'MUSE','MUSK','MYTH',
  'NAIL','NAME','NAPE','NECK','NEED','NICK','NONE','NORM','NOSE','NOTE','NUMB',
  'OATH','ODDS','OGLE','OMEN','OMIT','ONLY','OPEN','OPUS','ORAL','ORBS',
  'PAID','PAIL','PALM','PANT','PARK','PART','PASS','PATH','PAVE','PEAK','PEAR','PEEL',
  'PELT','PEST','PILE','PILL','PINE','PINT','PIPE','PITY','PLAN','PLAY','PLOW','PLUM',
  'PORK','POST','POUR','PREY','PROD','PULL','PUMP','PURE','PUSH',
  'RAIL','RAIN','RAKE','RAMP','RANK','RASP','RATE','RAZE','READ','REAL','REEL','REND',
  'RENT','RICE','RICH','RIDE','RILE','RING','RIOT','RISE','RISK','ROAM','ROAR','ROBE',
  'ROCK','RODE','ROLE','ROLL','ROOF','ROOT','ROPE','ROSE','ROUT','RUDE','RUIN','RULE',
  'RUSH','RUST',
  'SACK','SAFE','SAGE','SAIL','SAKE','SALT','SAND','SANE','SASH','SAVE','SEAL','SEAM',
  'SEAR','SECT','SEED','SEEK','SEEN','SELF','SELL','SEND','SERE','SEWN','SHED','SHIN',
  'SHIP','SHOE','SHOT','SHOW','SHUT','SILK','SILT','SING','SINK','SIRE','SITE','SIZE',
  'SLAB','SLAP','SLEW','SLIM','SLIP','SLIT','SLOB','SLOT','SLUM','SNAG','SNAP','SNIP',
  'SNOB','SNOT','SOAK','SODA','SOFA','SOLD','SOLE','SOOT','SORT','SOUR','SPAN','SPAR',
  'SPIN','SPIT','SPOT','SPUR','STAB','STAR','STAY','STEM','STEP','STEW','STIR','STOP',
  'STOW','STUB','SUIT','SUNK','SURE','SWAM','SWAN','SWAP','SWAY','SWIM',
  'TACK','TAIL','TALE','TALL','TAME','TANK','TAPE','TASK','TEAM','TEAR','TEEN','TELL',
  'TEST','TICK','TIDE','TILL','TILE','TILT','TIRE','TOLL','TOMB','TONE','TOWN','TRAP',
  'TRAY','TREE','TRIM','TRIP','TROD','TUNA','TUNE','TURN','TWIN','TWIG',
  'VAIN','VALE','VARY','VAST','VEIN','VEST','VINE','VOID','VOTE',
  'WAIL','WAKE','WALK','WALL','WAND','WANE','WARD','WASH','WEAK','WELD','WELL','WEND',
  'WIDE','WILL','WILT','WIND','WINE','WING','WISH','WOLF','WOMB','WRIT','WREN',
  'YAWN','YEAR','YELL',
  'ZEAL','ZERO','ZEST','ZONE','ZOOM',
  'ABOUT','ABOVE','ABUSE','ADDED','ADMIT','ADOPT','ADULT','AFTER','AGAIN','AGREE',
  'AHEAD','ALARM','ALBUM','ALERT','ALIKE','ALIVE','ALLEY','ALLOW','ALONE','ALONG',
  'ALOUD','ANGEL','ANGRY','ANKLE','ANNEX','APPLY','ARENA','ARGUE','ARISE','ARSON',
  'ASKED','ASSET','ATONE','ATTIC','AWFUL','AWASH',
  'BADLY','BADGE','BANAL','BANJO','BASIN','BATCH','BATHE','BATON','BEADY','BEARD',
  'BEAST','BELLY','BENCH','BERRY','BIRCH','BLACK','BLAND','BLAST','BLAZE','BLEAT',
  'BLOOM','BLOWN','BLUFF','BLUNT','BRAID','BRASH','BRAWN','BOOST','BOTCH','BOUND',
  'BRIDE','BRISK','BROKE','BROOD','BROTH','BUILD','BURNS','BUTCH',
  'CEDAR','CHAFE','CHAIN','CHAIR','CHANT','CHAOS','CLING','CLOAK','CLONE','CLOSE',
  'CLOTH','CLOUD','COBRA','COMET','COMIC','CONCH','CORAL','COUCH','COVET','CRAZY',
  'CREEP','CRISP','CROSS','CRUEL','CRUMB','CURLY','CYCLE',
  'DAISY','DANCE','DEATH','DEPTH','DIZZY','DODGE','DOUGH','DOUSE','DRAFT','DRAPE',
  'DRAWN','DRIFT','DROVE','DROWN','DRUNK','DWARF','DWELL',
  'EAGLE','EARLY','EARTH','EIGHT','ELECT','ELITE','EMBER','EMPTY','ENACT','EXILE',
  'EXIST',
  'FABLE','FAUNA','FEAST','FERAL','FETCH','FIGHT','FIXED','FLARE','FLEET','FLESH',
  'FLIER','FLOCK','FLOOR','FORCE','FORGE','FORTH','FOUND','FRANK','FRAUD','FREAK',
  'FROST','FROTH','FROWN','FULLY','FUNGI',
  'GAUZE','GECKO','GLARE','GLASS','GLAZE','GLEAM','GLOOM','GLOSS','GLOVE','GNASH',
  'GORGE','GRANT','GRASP','GRATE','GRAZE','GREAT','GREEN','GREET','GRIEF','GRILL',
  'GROAN','GROOM','GROSS','GROVE','GROWN','GRUEL','GRUFF',
  'HEAVY','HEIST','HELLO','HENCE',
  'IMAGE','IMPLY','INNER','IRONY',
  'JAUNT','JAZZY','JERKY','JEWEL','JUDGE','JUICY','JUMPY',
  'KAYAK','KNIFE','KNOWN',
  'LATHE','LAYER','LEAFY','LEAKY','LEAVE','LEDGE','LEVEL','LIVER','LIVID','LODGE',
  'LUSTY',
  'MAGIC','MAJOR','MANLY','MAPLE','MATCH','MAYBE','MEDIC','MOODY','MUDDY','MUSTY',
  'NAVAL','NOBLE','NOISY',
  'OFTEN','OZONE',
  'PERCH','PERKY','PIXEL','PLAID','PLUMB','PLUME','POACH','POWER',
  'QUALM','QUACK','QUAFF','QUAKE','QUERY','QUEUE','QUILL','QUIRK','QUOTA','QUOTE',
  'RALLY','REALM','REBEL','REFER','RELAX','REIGN','REPEL','RIGID','RISKY','RIVAL',
  'RIVET','ROCKY','ROWDY','RUSTY',
  'SCALD','SCARY','SCOFF','SCOLD','SCOPE','SCORN','SCOUT','SCRAP','SCREW','SCRUB',
  'SEIZE','SEVEN','SHACK','SHADY','SHAKY','SHAFT','SHALE','SHEEN','SHEER','SHINY',
  'SHOAL','SHRUB','SIGHT','SINCE','SIXTH','SIXTY','SKULL','SLANG','SLATE','SLICK',
  'SLIDE','SNARE','SNIFF','SNORE','SNOUT','SNOWY','SOLID','SONIC','SORRY','SOUND',
  'SOUTH','SPACE','SPADE','SPEAR','SPEED','SPICE','SPIRE','SPOKE','SPORT','SPRAY',
  'SPUNK','SQUAD','STALE','STAMP','STARK','START','STEAK','STEAM','STERN','STICK',
  'STOOD','STORE','STOVE','STRAP','STRAY','STRIP','STUDY','STYLE','SUAVE','SUPER',
  'SURGE','SWAMP','SWEAR','SWEAT','SWIRL',
  'TANGY','TEMPO','TEPID','TESTY','THICK','THINK','THORN','THREE','THREW','THROW',
  'TIGER','TIGHT','TIPSY','TORCH','TOUGH','TRACK','TRADE','TRAIL','TRAIN','TRASH',
  'TRAWL','TREAD','TREND','TRIAL','TRICK','TROUT','TRUCK','TRUSS','TULIP','TWANG',
  'TWIRL','TWINE',
  'VAGUE','VALID','VAULT','VENOM','VIGOR','VIVID','VOICE','VOTER',
  'WACKY','WAVER','WEARY','WEIGH','WEIRD','WHEAT','WHILE','WIELD','WITCH','WONKY',
  'WORDY','WRATH','WRITE','YACHT',
  'ZESTY','ZIPPY',
];

class BotPlayer {
  constructor() {
    this._wordList = null;
  }

  _getWordList() {
    if (!this._wordList) {
      this._wordList = BOT_WORD_LIST.filter(w => WordValidator.isValid(w));
    }
    return this._wordList;
  }

  findBestMove(board, rack) {
    const rackLetters = rack.map(t => t.isBlank ? '?' : t.letter);
    const candidates = [];
    const anchors = this._getAnchors(board);

    for (const { row, col } of anchors) {
      for (const dir of ['H', 'V']) {
        const moves = this._findMovesAt(board, rack, rackLetters, row, col, dir);
        candidates.push(...moves);
      }
    }

    if (candidates.length === 0) return null;

    // Sort by score descending, pick from top 5 randomly (easy difficulty)
    candidates.sort((a, b) => b.score - a.score);
    const top = candidates.slice(0, 5);
    return top[Math.floor(Math.random() * top.length)]?.placements || null;
  }

  _getAnchors(board) {
    const anchors = [];
    if (board.isEmpty) {
      return [{ row: 7, col: 7 }];
    }
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (!board.isOccupied(r, c) && this._hasAdjacentTile(board, r, c)) {
          anchors.push({ row: r, col: c });
        }
      }
    }
    return anchors;
  }

  _hasAdjacentTile(board, row, col) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return dirs.some(([dr, dc]) => {
      const nr = row + dr, nc = col + dc;
      return nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && board.isOccupied(nr, nc);
    });
  }

  _findMovesAt(board, rack, rackLetters, anchorRow, anchorCol, dir) {
    const moves = [];
    const wordList = this._getWordList();

    for (const word of wordList) {
      const wordLen = word.length;

      for (let offset = 0; offset < wordLen; offset++) {
        const startRow = dir === 'V' ? anchorRow - offset : anchorRow;
        const startCol = dir === 'H' ? anchorCol - offset : anchorCol;

        if (startRow < 0 || startCol < 0) continue;
        if (dir === 'H' && startCol + wordLen > 15) continue;
        if (dir === 'V' && startRow + wordLen > 15) continue;

        const placements = this._tryPlaceWord(board, rack, rackLetters, word, startRow, startCol, dir);
        if (placements) {
          const wordsFormed = board.getWordsFormed(placements);
          if (wordsFormed.length > 0) {
            const allWords = wordsFormed.map(w => w.word);
            const validation = WordValidator.validateWords(allWords);
            if (validation.valid) {
              const score = board.calculateScore(placements, wordsFormed);
              moves.push({ placements, score, words: allWords });
            }
          }
        }
      }
    }

    return moves;
  }

  _tryPlaceWord(board, rack, rackLetters, word, startRow, startCol, dir) {
    const placements = [];
    const usedRackIndices = new Set();
    const availableRack = rack.map((t, i) => ({ ...t, idx: i }));

    for (let i = 0; i < word.length; i++) {
      const row = dir === 'V' ? startRow + i : startRow;
      const col = dir === 'H' ? startCol + i : startCol;
      const letter = word[i];

      if (row >= 15 || col >= 15) return null;

      if (board.isOccupied(row, col)) {
        const boardLetter = board.getTile(row, col)?.letter;
        if (boardLetter !== letter) return null;
      } else {
        const tileIdx = availableRack.findIndex((t, i) =>
          !usedRackIndices.has(i) &&
          ((t.isBlank) || t.letter === letter)
        );
        if (tileIdx === -1) return null;
        usedRackIndices.add(tileIdx);
        const tile = availableRack[tileIdx];
        placements.push({
          row, col,
          tileId: tile.id,
          letter: tile.letter,
          value: tile.value,
          isBlank: tile.isBlank,
          blankLetter: tile.isBlank ? letter : undefined,
        });
      }
    }

    if (placements.length === 0) return null;

    const validation = board.validatePlacement(placements);
    if (!validation.valid) return null;

    return placements;
  }
}

module.exports = new BotPlayer();
