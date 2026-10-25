/**
 * The words of the passphrases behind sharing by link (see share-phrase.ts): common
 * four-letter words, one list per language of the ControlFreak family. Chosen so they
 * can be said on the phone and typed on a mobile: no names, no swearing and nothing that
 * reads as demeaning.
 *
 * Two words in one list must not become the same when accents are removed ("bäck" and
 * "back"), since a passphrase is compared without them (`normalizePhraseWord`); the
 * tests check it. Words may be added: each one makes passphrases harder to guess. Words
 * may be removed without breaking old passphrases, which are compared as text, never
 * against the list. The values were taken over from ControlFreak on 2026-10-25.
 */

/** The family's five languages: Swedish, English, Norwegian bokmål, Finnish, Czech. */
export type ShareLang = "sv" | "en" | "no" | "fi" | "cs";

const WORDS: Record<ShareLang, string> = {
  // svenska, 335 ord
  sv:
    "alar alka anka aska bada baka bana band bark barn berg bild blad blöt bock boll bord " +
    "bred brev bris bror brun bröd burk buss byrå byxa bäck bänk bära böna dagg damm dans " +
    "dela dike dill disk djup dröm duva dyka däck dörr ekar etta falk fall fana fast fest " +
    "film filt fink fisk fjun flit fock folk fors fred fyra färg garn gata glad glas gles " +
    "glöd golv gran gren gris grov grus gräs grön gröt guld gäst gård göra hage halm hamn " +
    "hare hatt heta hink hopp hund hyra hytt häck hägg häll häst häxa hård höna höra höst " +
    "igel inne iver jaga jojo jord juli juni järn järv kaja kaka kalk kall kalv kamp kant " +
    "katt keps kjol klar klot kniv knut kock koka kopp kork korn korp kort korv kran krok " +
    "krus kula kung kurs kust kärr kåda kåpa köra lada laga lake lamm land lava leka lera " +
    "leta lila lina list ljud ljus lock loft lopp lova lugn luta luva lyra läsa lätt låna " +
    "lång lönn majs mapp mars mask mast mata matt mild mink mjuk mjöl moln mugg mule mynt " +
    "myra måla måne mård måse mörk mört möta namn natt nere noll norr nors nysa nära ofta " +
    "olja orre pall papp park peka plan port post puts pärm påse påsk regn resa ring ripa " +
    "rita rosa rova ruin rund ruta rutt rymd räls rätt rönn saft salt sand sann sida sill " +
    "sjal sjua sked skog skot skum skär skål skåp skön slät smal smed smör sned sork sova " +
    "spel spik spis spov spån spår stad stag stam stav sten stig stol stor stål sula sund " +
    "sval svan sylt säck säga sälg sång såpa takt tala tall tejp tenn text tofs topp torg " +
    "torn torp torr torv trea trut tråd trög tung tunn tupp tuva tvåa tvål tyst tält udde " +
    "uppe vada vagn vant varg varm vass vers veta vete vide vika vila vild vind viol vipa " +
    "visa vägg väst väva växa zink äkta älva ärta åker åtta ödla",
  // engelska, 617 ord
  en:
    "able acre aged also area aunt away axle baby back bake ball band bank bark base bath " +
    "bean bear beat beef beet bell belt bike bird blow blue boat bold bolt bone book boot " +
    "born both bowl brim brow bulk buoy bush busy cafe cake calf calm camp cape card care " +
    "cart case cash cask cast cave cell chat chef chin chip chop city clam claw clay clip " +
    "club clue coal coat code coin cold colt comb cone cook cool copy cord core corn cost " +
    "cove crab crew crib crop crow cube curl cusp cute dark dart dash data date dawn daze " +
    "deal dear deck deep deer dent desk dial dice dish dock door dove down draw drip drum " +
    "duck dune dusk dust duty each earn east easy echo edge exam face fact fair fall farm " +
    "fast fawn feet fern film find fine fire firm fish five fizz flag flat flax flea flip " +
    "flow foal foam fold folk font food foot fork form fort four fowl free frog fuel full " +
    "fund fuss gain gala gale game gate gaze gear gift gist glad glen glow glue gnat goal " +
    "goat gold golf gong good gown grab gray grid grin grip gulf gull hail hair half hall " +
    "halo hand hare harp hawk heap heat helm hemp herb hero hike hill hilt hint hive hold " +
    "home hood hoof hook hoop hope horn host hour howl huge hull hunt husk idea inch iris " +
    "iron isle item jade jazz join joke jolt jump june jury just kale keen keep kelp kiln " +
    "kind king kite kiwi knee knot know lace lake lamb lamp land lane lark last late lava " +
    "lawn lead leaf lean leek left lens life lift like lily limb lime line link lion list " +
    "live load loaf lock loft logo long look loom loop loud love luck lump lush lynx mail " +
    "main make mane many mare mark mask mast mate math maze meal melt memo menu mesa mice " +
    "mild milk mill mind mink mint mist moat mode mole mood moon moss most move much mule " +
    "must myth nail name navy near neat need nest news newt next nice nine node nook noon " +
    "norm note oaks oars oath oats oboe okra opal open orca oval oven over owls pace pack " +
    "page pail pair palm pane park part pass past path pave pawn peak pear peas peel pier " +
    "pine pink pipe plan play plot plow plum poem poet pole pond pony pool port pose post " +
    "pour pull puma pump pure push quay quiz race rack raft rail rain rake ramp rank rare " +
    "rate read real reed reef rent rest rice rich ride rind ring ripe rise road rock role " +
    "roll roof rook room root rope rose ruby rule rung rush rust safe sage sail salt same " +
    "sand sash save seal seam seat seed seek sell send shed shin ship shoe shop show side " +
    "sign silk silo sing site size skip slab sled slim slip slow slug smog snow snug soap " +
    "sock soda sofa soft soil song soon sort soup sour spin spot spud stag star stay stem " +
    "step stew stop stub suit sure swan swap swim tack tail tale talk tall tank tape tarn " +
    "task taxi teal team tell tent term test text thaw tick tide tidy tile time tiny toad " +
    "tofu toga tone tool tour town tram tray tree trim trip true tuba tube tuft tune turn " +
    "tusk twin type unit vale vase vast veil verb very vest view vine vote wade wait wake " +
    "walk wall want warm wash wasp wave wavy weed week weld well west wick wide wild wind " +
    "wing wire wise wish wolf wood wool word work wrap wren yard yarn yawn year yoga yoke " +
    "yolk zero zinc zone zoom",
  // norska (bokmål), 269 ord
  no:
    "aske baby bade bake ball bane bark barn bekk benk berg blad boks bord borg bred brev " +
    "bror brun brød bukk busk buss bånd bære dans dekk dele dikt drøm dugg dusj ekko ekte " +
    "elev ener eple eske falk fart fast fest film fink fiol fisk fjær fjøs flue folk fred " +
    "fugl furu garn gate gauk geit glad gran gren gris grov grus grøt gull gulv gutt gård " +
    "hage hagl hall halm hane hard hare hatt haug hauk havn hegg hekk hest hete hjem hjul " +
    "hund hval hvit høne høre høst inne jern jerv jord juli juni kaie kake kald kalk kalv " +
    "kano kant kart katt kjøl klar kniv koke kokk kopp kork korn kort kran krok krus kule " +
    "kull kurs kvae kyst lage laks land lang leie leke lese lete lett lind line list loft " +
    "lokk love lyng låne låve lønn løpe mais male mann mark mars mast mate matt maur meis " +
    "melk mild mink mose mygg myte måke måne mørk møte nabo natt navn nede nord null nyse " +
    "nøtt odde ofte olje oppe oter papp park peke plan port pose post pute pære rask regn " +
    "reke rett ring rogn rosa rose ruin rund rute rype røyk saft saga salt sand sang sann " +
    "seil sekk seng sild sink sjef skap skje skog skrå skål smal smed smør sofa sokk sopp " +
    "sove spor stav stol stor stue stål stær sund sunn søvn takt tale telt tett time tine " +
    "tinn tiur toer tone topp torg torv treg tråd tung tåke tårn tørr ugle vade vakt vann " +
    "varm vegg venn vert vest veve vier vike vill vise vite vott åker øgle",
  // finska, 179 ord
  fi:
    "aamu ahma aika airo aita aito ajaa akku alku alue asua aura auto ehto elää hame hana " +
    "havu hela hius hyvä ihme ilma ilta into itää jalo joki juna kala kana kari kasa katu " +
    "kehä keko kelo kesy kesä kide kisa kiva kivi koko kolo kone kori koru kota koti kova " +
    "kude kuha kuja kumi kuva kylä kynä käki käpy käsi köli laki lasi lato latu lepo levy " +
    "liha lila limu lohi loma loru luku lumi lupa made maja maku mato mehu mela meri muki " +
    "muna muta mäki naru nenä neva nide nimi noki ohra ohut oksa olki olla onni paju pala " +
    "papu pari pata pato peli pesä piha pino pipo pomo poro puro raha raja rapu rata reki " +
    "risu rivi ruis runo räme sade saha sali salo sana sara satu savi savu setä sika sivu " +
    "sola soma sopu sora suku sumu susi suvi syvä talo tapa tavi tavu tila tina tori tosi " +
    "tuli tupa täti uida ukko uoma usva uuni uusi vaha vaja vako valo vana vati veli vene " +
    "vesi vino vipu väri vävy yksi äiti ääni öljy",
  // tjeckiska, 211 ord
  cs:
    "anýz auto bobr bota brát bílý břeh celý cena cukr dbát deka dort dres druh dráp duch " +
    "duha dutý dvůr déšť díra dítě dýně děda džem film gauč guma hlas hluk hora host hrom " +
    "hrát hráz husa jaro jáma jíst kapr kaše kino kiwi klid klub kluk klíč kmen koks kolo " +
    "kopr kouř koza krab král kuna kurz květ káva kůra kůže lama lano lidé lupa lyže léto " +
    "lézt líný malý mapa maso milý mlha most moře mrak mráz máma máta mést nebe nora nota " +
    "nový nuda nula nést obec ocas ocel oheň okno olej orel otec ovce oves paní park pepř " +
    "pero peří pila plný plod plot plsť plyn plán pláž pole prut prát psát pták ptát pára " +
    "páže péct půda raft ropa rosa rudý rula ryba ráno rýže růst růže sbor sedm seno sklo " +
    "slib slon smát sníh sova spát srna srst srub stan stáj stát stůl svah sytý sáně síla " +
    "síra takt taxi tele teta tkát trať tupý tygr táta téct uhel uhlí umět uzel vana vlak " +
    "vlna vnuk voda vosa vosk vrch vtip vést víko víla víra vítr vůle země zima znát zrno " +
    "zrát zvon zvuk úhoř útes úzký čilý číst řada řeka říct šedý šerý šest šnek štít švec " +
    "šála žena žito živý žleb žula žába",
};

/** The words of a language, in alphabetical order. */
export function shareWords(lang: ShareLang): readonly string[] {
  return WORDS[lang].split(" ");
}
