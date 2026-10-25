import type { RoomId } from '@/domain/rooms';
import type { IconName } from '@/design/icons/names';
import type { L } from './types';
import type { ItemStoreTips, RoomStorageGuide, StorageRule } from './storageTypes';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const t = (en: string, tl: string): L => ({ en, tl });

function rule(icon: IconName, title: L, body: L): StorageRule {
  return { icon, title, body };
}

const SRC = {
  doh: { label: 'DOH', url: 'https://doh.gov.ph' },
  fda: { label: 'FDA Philippines', url: 'https://www.fda.gov.ph' },
  prc: { label: 'Philippine Red Cross', url: 'https://redcross.org.ph' },
  ndrrmc: { label: 'NDRRMC', url: 'https://ndrrmc.gov.ph' },
  pagasa: { label: 'PAGASA', url: 'https://www.pagasa.dost.gov.ph' },
  phivolcs: { label: 'PHIVOLCS', url: 'https://www.phivolcs.dost.gov.ph' },
  who: { label: 'WHO', url: 'https://www.who.int' },
  cdc: { label: 'US CDC', url: 'https://www.cdc.gov' },
  ready: { label: 'Ready.gov', url: 'https://www.ready.gov' },
} as const;

/* ------------------------------------------------------------------ */
/* ROOM GUIDES                                                         */
/* ------------------------------------------------------------------ */

const kitchen: RoomStorageGuide = {
  room: 'kitchen',
  purpose: t(
    'Food, cooking fuel and preserving supplies, kept cool, dry and dark.',
    'Pagkain, gas pangluto at gamit sa pag-preserve, nakatago sa malamig, tuyo at madilim.',
  ),
  climate: t(
    'Cool, dry, dark and off the floor; ideally below 24 °C and away from the stove.',
    'Malamig, tuyo, madilim at hindi sa sahig; mas mabuti kung mababa sa 24 °C at malayo sa kalan.',
  ),
  rules: [
    rule('cat-food',
      t('First in, first out', 'Una pasok, una gamit'),
      t('Put new stock at the back and use the oldest first. Write the month you bought it on the can or pack.',
        'Ilagay sa likod ang bagong bili at gamitin muna ang pinakaluma. Isulat sa lata o pack ang buwan ng pagbili.')),
    rule('sun',
      t('Away from the stove and sun', 'Malayo sa kalan at araw'),
      t('Heat shortens the shelf life of canned and dry food. Keep the shelf away from the stove, the oven and sunny windows.',
        'Pinapabilis ng init ang pagkasira ng de-lata at tuyong pagkain. Ilayo ang istante sa kalan, oven at bintanang naaarawan.')),
    rule('warning',
      t('Check the can, not just date', 'Tingnan ang lata, hindi lang petsa'),
      t('Dented, rusty, bulging or leaking cans go in the trash even if the date is fine. A sound can lasts past its best-before date.',
        'Itapon ang yupi, kalawangin, umbok o tumatagas na lata kahit okay pa ang petsa. Ang buong lata ay tumatagal lampas sa best-before.')),
    rule('lock',
      t('Airtight against pests', 'Selyado laban sa peste'),
      t('Rice, noodles and biscuits go in sealed containers or thick bags. Weevils, ants and rats get through paper and thin plastic.',
        'Ilagay ang bigas, noodles at biskwit sa selyadong lalagyan o makapal na bag. Nakakapasok ang bukbok, langgam at daga sa papel at manipis na plastik.')),
    rule('fire',
      t('Butane upright and ventilated', 'Butane nakatayo at may hangin'),
      t('Store butane canisters upright in a ventilated spot, away from the stove and the sun. Never in a hot, closed cabinet.',
        'Itago ang lata ng butane nang nakatayo sa lugar na may hangin, malayo sa kalan at araw. Huwag sa mainit at saradong cabinet.')),
    rule('cat-canning',
      t('Preserving supplies stay dry', 'Tuyo ang gamit sa pag-preserve'),
      t('Salt, sugar and vinegar keep for years if sealed and dry. Oil goes rancid faster in heat and light, so keep it in a dark cupboard.',
        'Tumatagal ng taon ang asin, asukal at suka kung selyado at tuyo. Mabilis mag-anta ang mantika sa init at liwanag, kaya sa madilim na cupboard.')),
  ],
  never: [
    t('Never store food on the floor. Moisture, ants and floodwater reach it first.',
      'Huwag maglagay ng pagkain sa sahig. Unang naabot ng basa, langgam at baha.'),
    t('Never eat from a bulging, leaking or badly dented can.',
      'Huwag kumain mula sa umbok, tumatagas o malubhang yupi na lata.'),
    t('Never store butane or LPG next to the stove or in a hot, closed space.',
      'Huwag ilagay ang butane o LPG sa tabi ng kalan o sa mainit at saradong lugar.'),
    t('Never cook on a butane stove in a closed room with no open window.',
      'Huwag magluto sa butane stove sa saradong kuwarto na walang bukas na bintana.'),
  ],
  cadence: t(
    'Check dates and cans every 3 months; rotate rice, noodles and biscuits every 6 months.',
    'Suriin ang petsa at lata tuwing 3 buwan; palitan ang bigas, noodles at biskwit tuwing 6 na buwan.',
  ),
  sources: [SRC.fda, SRC.doh, SRC.ready],
};

const water: RoomStorageGuide = {
  room: 'water',
  purpose: t(
    'Drinking water and flush water, kept apart, covered and in the shade.',
    'Inuming tubig at tubig pang-flush, magkahiwalay, may takip at nasa lilim.',
  ),
  climate: t(
    'Shaded, cool, covered and off the concrete floor; never in direct sun.',
    'Nasa lilim, malamig, may takip at hindi sa sementong sahig; huwag sa direktang araw.',
  ),
  rules: [
    rule('drop',
      t('4 liters per person per day', '4 litro kada tao kada araw'),
      t('3 L to drink and cook, 1 L to wash. A family of 4 for 3 days needs 48 L.',
        '3 L pang-inom at pangluto, 1 L panghugas. Pamilyang 4 sa 3 araw, kailangan ng 48 L.')),
    rule('sun',
      t('Out of the sun', 'Ilayo sa araw'),
      t('Sunlight warms the water and lets algae grow in clear containers. Keep bottles and gallons in the shade and cover drums.',
        'Pinapainit ng araw ang tubig at tumutubo ang lumot sa malinaw na lalagyan. Ilagay sa lilim ang bote at galon, takpan ang drum.')),
    rule('cat-water',
      t('Off the concrete', 'Hindi sa semento'),
      t('Put bottles and gallons on a shelf, pallet or board, not directly on concrete. The floor is where floodwater, spills and pests arrive first.',
        'Ilagay ang bote at galon sa istante, pallet o tabla, hindi direkta sa semento. Sa sahig unang dumadating ang baha, tumapon at peste.')),
    rule('lock',
      t('Drinking is separate from flushing', 'Hiwalay ang inumin sa pang-flush'),
      t('Sealed bottles and covered containers with a tap are for drinking. Drums and pails are for washing and flushing. Label them.',
        'Selyadong bote at lalagyang may takip at gripo ang pang-inom. Drum at timba ang panghugas at pang-flush. Lagyan ng label.')),
    rule('refresh',
      t('Rotate every 6 months', 'Palitan tuwing 6 na buwan'),
      t('Write the date on caps and drums. Drink the oldest bottles first; drain, scrub and refill stored tap water every 6 months.',
        'Isulat ang petsa sa takip at drum. Inumin muna ang pinakalumang bote; ubusin, kuskusin at punuin muli ang nakatabing tubig tuwing 6 na buwan.')),
    rule('warning',
      t('Emergency treatment: boil or bleach', 'Pang-emergency: pakuluan o bleach'),
      t('Boiling is the first choice. If you cannot boil, use unscented household bleach, about 2 drops per liter of clear water, stir and wait 30 minutes.',
        'Pagpapakulo ang unang pagpipilian. Kung hindi makapagpakulo, gumamit ng unscented na bleach, mga 2 patak kada litro ng malinaw na tubig, haluin at maghintay ng 30 minuto.')),
  ],
  never: [
    t('Never dip a cup or hand into stored drinking water. Pour, or use a tap.',
      'Huwag sumalok ng baso o kamay sa nakatabing inuming tubig. Ibuhos, o gumamit ng gripo.'),
    t('Never reuse chemical, detergent or bleach containers for drinking water.',
      'Huwag gamitin ang lalagyan ng kemikal, sabon o bleach para sa inuming tubig.'),
    t('Never store water next to gasoline, pesticides or bleach. Fumes pass through plastic.',
      'Huwag ilagay ang tubig sa tabi ng gasolina, pestisidyo o bleach. Tumatagos ang amoy sa plastik.'),
    t('Never leave a drum uncovered. Mosquitoes breed in it within a week.',
      'Huwag iwanang walang takip ang drum. Nagpaparami ng lamok sa loob ng isang linggo.'),
  ],
  cadence: t(
    'Rotate bottles and gallons every 6 months; drain, scrub and refill drums every 6 months.',
    'Palitan ang bote at galon tuwing 6 na buwan; ubusin, kuskusin at punuin muli ang drum tuwing 6 na buwan.',
  ),
  sources: [SRC.doh, SRC.cdc, SRC.ready],
};

const bedroom: RoomStorageGuide = {
  room: 'bedroom',
  purpose: t(
    'Medicine and baby supplies, high up, locked, and never in the bathroom.',
    'Gamot at gamit ng sanggol, nakataas, naka-lock, at hindi kailanman sa banyo.',
  ),
  climate: t(
    'Cool, dry and dark, away from sun and steam, on a high shelf or in a locked box.',
    'Malamig, tuyo at madilim, malayo sa araw at singaw, sa mataas na istante o naka-lock na kahon.',
  ),
  rules: [
    rule('cat-medicine',
      t('Not the bathroom', 'Hindi sa banyo'),
      t('Heat and steam from showers break down tablets and syrups. A high bedroom shelf or drawer is cooler and drier.',
        'Sinisira ng init at singaw ng shower ang tableta at syrup. Mas malamig at tuyo ang mataas na istante o drawer sa kuwarto.')),
    rule('lock',
      t('High and locked from kids', 'Mataas at naka-lock sa bata'),
      t('Keep meds in a locked box or a shelf kids cannot reach. Child-proof caps slow kids down; they do not stop them.',
        'Ilagay ang gamot sa naka-lock na kahon o istanteng hindi maabot ng bata. Pinapabagal lang ng child-proof cap ang bata; hindi pinipigilan.')),
    rule('book',
      t('Keep the box and leaflet', 'Itago ang kahon at leaflet'),
      t('The original box has the expiry date and instructions. Loose tablets lose both.',
        'Nasa orihinal na kahon ang expiry at instructions. Nawawala pareho sa nakakalat na tableta.')),
    rule('calendar',
      t('Check expiry every 3 months', 'Suriin ang expiry tuwing 3 buwan'),
      t('Pull out what expires before the next check and replace it. Do not flush expired meds or leave them where kids can find them.',
        'Alisin ang mag-e-expire bago ang susunod na check at palitan. Huwag i-flush ang expired na gamot o iwan kung saan makikita ng bata.')),
    rule('baby',
      t('Formula: sealed, cool, dated', 'Formula: selyado, malamig, may petsa'),
      t('Unopened cans keep in a cool, dry spot until the printed date. Once opened, use within 1 month and keep the scoop dry.',
        'Tumatagal ang hindi pa bukas na lata sa malamig at tuyong lugar hanggang sa nakalimbag na petsa. Kapag nabuksan, ubusin sa loob ng 1 buwan at panatilihing tuyo ang scoop.')),
    rule('bandage',
      t('First aid kit stays packed', 'Laging kumpleto ang first aid kit'),
      t('Replace anything you use the same week. Check gloves, tape and antiseptic every 3 months.',
        'Palitan ang anumang nagamit sa parehong linggo. Suriin ang gloves, tape at antiseptic tuwing 3 buwan.')),
  ],
  never: [
    t('Never store medicine in the bathroom, by a window, or in a hot car.',
      'Huwag mag-imbak ng gamot sa banyo, sa tabi ng bintana, o sa mainit na sasakyan.'),
    t('Never move tablets to an unlabeled container.',
      'Huwag ilipat ang tableta sa lalagyang walang label.'),
    t('Never give adult medicine to a child without asking a pharmacist or doctor.',
      'Huwag magbigay ng gamot pang-adult sa bata nang hindi nagtatanong sa parmasyutiko o doktor.'),
    t('Never keep medicine in the fridge unless the label says so.',
      'Huwag ilagay ang gamot sa ref maliban kung nakasaad sa label.'),
  ],
  cadence: t(
    'Check expiry dates and the first aid kit every 3 months.',
    'Suriin ang expiry at ang first aid kit tuwing 3 buwan.',
  ),
  sources: [SRC.fda, SRC.doh, SRC.who],
};

const bathroom: RoomStorageGuide = {
  room: 'bathroom',
  purpose: t(
    'Soap, tissue, bleach and the bucket: the hygiene and sanitation station.',
    'Sabon, tissue, bleach at timba: ang istasyon ng kalinisan.',
  ),
  climate: t(
    'Humid is fine for most items, but keep paper goods in sealed bags and bleach out of heat and sun.',
    'Okay ang mahalumigmig sa karamihan, pero ilagay sa selyadong bag ang papel at ilayo ang bleach sa init at araw.',
  ),
  rules: [
    rule('cat-hygiene',
      t('Paper in sealed bags', 'Papel sa selyadong bag'),
      t('Tissue and pads soak up bathroom moisture and go soft or moldy. Keep them in a zip bag or a plastic box with a lid.',
        'Sumisipsip ng halumigmig ang tissue at napkin at lumalambot o inaamag. Ilagay sa zip bag o plastik na kahon na may takip.')),
    rule('warning',
      t('Bleach: cool, dark, capped', 'Bleach: malamig, madilim, may takip'),
      t('Bleach loses strength in heat and sunlight, usually within about a year. Keep it in the original bottle, capped, out of reach of kids.',
        'Humihina ang bleach sa init at araw, kadalasan sa loob ng isang taon. Itago sa orihinal na bote, may takip, hindi maabot ng bata.')),
    rule('lock',
      t('Never mix cleaners', 'Huwag paghaluin ang panlinis'),
      t('Bleach with vinegar, alcohol or ammonia makes toxic gas. Store them apart and use one at a time with the window open.',
        'Nakakalason na gas ang bleach na hinaluan ng suka, alcohol o ammonia. Ihiwalay sila at isa-isa lang gamitin, bukas ang bintana.')),
    rule('cat-water',
      t('Bucket and dipper ready', 'Handa ang timba at tabo'),
      t('Keep the timba clean, dry and upside down so it does not breed mosquitoes. Fill it only when a storm or water cut is announced.',
        'Panatilihing malinis, tuyo at nakataob ang timba para hindi mag-lamok. Punuin lang kapag may anunsyo ng bagyo o water interruption.')),
    rule('trash',
      t('Trash bags = emergency toilet', 'Trash bag = emergency toilet'),
      t('If water stops, line the bowl or a bucket with a heavy-duty trash bag. Tie it off and keep it covered until collection.',
        'Kung mawalan ng tubig, lagyan ng makapal na trash bag ang inidoro o timba. Itali at takpan hanggang sa koleksyon.')),
    rule('hand',
      t('Soap first, sanitizer second', 'Sabon muna, saka sanitizer'),
      t('Soap and water beat sanitizer when hands are dirty. Keep bars in a dry soap dish so they do not melt away.',
        'Mas mabisa ang sabon at tubig kaysa sanitizer kung madumi ang kamay. Ilagay ang sabon sa tuyong soap dish para hindi matunaw.')),
  ],
  never: [
    t('Never store medicine here. Heat and steam ruin it.',
      'Huwag mag-imbak ng gamot dito. Sinisira ito ng init at singaw.'),
    t('Never mix bleach with other cleaners.',
      'Huwag paghaluin ang bleach sa ibang panlinis.'),
    t('Never leave the bucket full and uncovered between uses. Mosquitoes breed in about a week.',
      'Huwag iwanang puno at walang takip ang timba. Nagpaparami ng lamok sa loob ng isang linggo.'),
    t('Never store bleach above food or drinking water.',
      'Huwag ilagay ang bleach sa itaas ng pagkain o inuming tubig.'),
  ],
  cadence: t(
    'Check the bleach date and sanitizer level every 6 months; restock tissue and pads monthly.',
    'Suriin ang petsa ng bleach at laman ng sanitizer tuwing 6 na buwan; mag-restock ng tissue at napkin buwan-buwan.',
  ),
  sources: [SRC.doh, SRC.who, SRC.cdc],
};

const sala: RoomStorageGuide = {
  room: 'sala',
  purpose: t(
    'Power and light: flashlights, batteries, power banks, the fan and the solar panel.',
    'Kuryente at ilaw: flashlight, baterya, power bank, bentilador at solar panel.',
  ),
  climate: t(
    'Room temperature, dry, out of direct sun, away from windows that heat up.',
    'Normal na temperatura, tuyo, hindi direktang naaarawan, malayo sa bintanang umiinit.',
  ),
  rules: [
    rule('bolt',
      t('Batteries stay in the pack', 'Baterya nasa pack'),
      t('Keep batteries in their packaging at room temperature. Loose batteries touching coins, keys or each other can short and heat up.',
        'Itago ang baterya sa pack sa normal na temperatura. Ang nakakalat na baterya na dumidikit sa barya, susi o sa isa\'t isa ay puwedeng mag-short at uminit.')),
    rule('cat-power',
      t('Power banks at partial charge', 'Power bank, hindi puno'),
      t('Lithium cells age fastest when stored full or empty. Store at 50 to 80% and top up monthly.',
        'Pinakamabilis tumanda ang lithium kung nakatabing puno o ubos. Itabi sa 50 hanggang 80% at mag-top up buwan-buwan.')),
    rule('sun',
      t('Heat drains charge', 'Nauubos ang charge sa init'),
      t('Batteries self-discharge faster in heat. A hot car or a sunny window shelf shortens their life.',
        'Mas mabilis maubos ang baterya sa init. Pinapaikli ng mainit na sasakyan o naaarawang istante ang buhay nito.')),
    rule('warning',
      t('Swollen? Stop using it', 'Namamaga? Itigil ang paggamit'),
      t('A puffy power bank or phone battery is a fire risk. Do not charge it; bring it to an e-waste collection point.',
        'Panganib sa sunog ang namamagang power bank o baterya ng phone. Huwag i-charge; dalhin sa e-waste collection.')),
    rule('bulb',
      t('Lights where you can find them', 'Ilaw na madaling makita'),
      t('Hang a flashlight by the main switch and keep one by the bed. Take batteries out of lights you will not use for months so leaks do not ruin them.',
        'Isabit ang flashlight sa tabi ng main switch at maglagay ng isa sa tabi ng kama. Tanggalin ang baterya sa ilaw na hindi gagamitin sa loob ng ilang buwan para hindi masira sa tagas.')),
    rule('refresh',
      t('Charge when the warning comes', 'Mag-charge kapag may babala'),
      t('When PAGASA raises a signal or a brownout is announced, charge everything: phones, power banks, lamps, the fan.',
        'Kapag nagtaas ng signal ang PAGASA o may anunsyo ng brownout, i-charge ang lahat: phone, power bank, lamp, bentilador.')),
  ],
  never: [
    t('Never mix old and new batteries, or different brands, in one device.',
      'Huwag paghaluin ang luma at bagong baterya, o magkaibang brand, sa isang gamit.'),
    t('Never leave a power bank charging on the bed or sofa overnight.',
      'Huwag iwanang naka-charge ang power bank sa kama o sofa magdamag.'),
    t('Never charge a swollen or wet device.',
      'Huwag i-charge ang namamaga o basang gamit.'),
    t('Never use candles near kids, curtains, or when you smell gas.',
      'Huwag gumamit ng kandila malapit sa bata, kurtina, o kung may amoy ng gas.'),
  ],
  cadence: t(
    'Top up power banks and test every light monthly; replace batteries by the date on the pack.',
    'Mag-top up ng power bank at subukan ang bawat ilaw buwan-buwan; palitan ang baterya ayon sa petsa sa pack.',
  ),
  sources: [SRC.ready, SRC.ndrrmc, SRC.prc],
};

const study: RoomStorageGuide = {
  room: 'study',
  purpose: t(
    'Documents, cash, the radio and the family plan, kept dry and secure.',
    'Dokumento, cash, radyo at plano ng pamilya, tuyo at ligtas.',
  ),
  climate: t(
    'Dry, locked, off the floor, with a copy of everything online.',
    'Tuyo, naka-lock, hindi sa sahig, at may kopya ng lahat online.',
  ),
  rules: [
    rule('card',
      t('Documents in a waterproof pouch', 'Dokumento sa waterproof pouch'),
      t('IDs, birth certificates, titles, insurance, vaccination cards. One pouch goes in the go-bag; photos go on your phone and in email.',
        'ID, birth certificate, titulo, insurance, vaccination card. Isang pouch sa go-bag; litrato sa phone at sa email.')),
    rule('lock',
      t('Cash in small bills, split', 'Cash na maliit, hati-hati'),
      t('ATMs and e-wallets fail with the power. Keep small bills and coins, half in the go-bag and half hidden at home.',
        'Hindi gumagana ang ATM at e-wallet kung walang kuryente. Maglagay ng maliit na papel at barya, kalahati sa go-bag at kalahati nakatago sa bahay.')),
    rule('radio',
      t('Radio with batteries beside it', 'Radyo, baterya sa tabi'),
      t('Keep the radio next to its batteries, not with them inside, so a leak does not ruin it. Give a hand-crank radio a test turn monthly.',
        'Ilagay ang baterya sa tabi ng radyo, hindi sa loob, para hindi masira sa tagas. Subukang ikutin ang hand-crank radio buwan-buwan.')),
    rule('phone',
      t('Printed contacts and meeting point', 'Nakalimbag na contacts at tagpuan'),
      t('Phones die and numbers get forgotten. Print the family contacts, hotlines and the meeting point: one per bag, one on the fridge.',
        'Namamatay ang phone at nakakalimutan ang numero. I-print ang contacts, hotline at tagpuan: isa kada bag, isa sa ref.')),
    rule('cloud',
      t('Digital copies too', 'May digital na kopya rin'),
      t('Scan or photograph documents and save them in email or cloud storage. A soaked pouch is survivable if the copy is online.',
        'I-scan o kuhanan ng litrato ang dokumento at i-save sa email o cloud. Kaya ang nabasang pouch kung may kopya online.')),
    rule('cat-comms',
      t('Spare phone and SIM alive', 'Buhay ang ekstrang phone at SIM'),
      t('Keep a spare phone at 50 to 80% charge with a SIM from a different network. Load it now and then so it stays active.',
        'Itabi ang ekstrang phone sa 50 hanggang 80% charge na may SIM ng ibang network. Lagyan ng load paminsan-minsan para manatiling aktibo.')),
  ],
  never: [
    t('Never keep the only copy of a document on a flood-prone ground floor.',
      'Huwag itago ang nag-iisang kopya ng dokumento sa binabahang ground floor.'),
    t('Never keep all your cash in one place.',
      'Huwag ilagay ang lahat ng cash sa isang lugar.'),
    t('Never leave batteries inside the radio for months. They leak.',
      'Huwag iwanan ang baterya sa loob ng radyo ng ilang buwan. Tumatagas ito.'),
    t('Never tell people outside the family where the cash and documents are.',
      'Huwag sabihin sa hindi kapamilya kung saan ang cash at dokumento.'),
  ],
  cadence: t(
    'Update documents and contacts yearly or after a big life change; test the radio and top up the spare phone monthly.',
    'I-update ang dokumento at contacts taon-taon o pagkatapos ng malaking pagbabago; subukan ang radyo at i-top up ang ekstrang phone buwan-buwan.',
  ),
  sources: [SRC.ndrrmc, SRC.prc, SRC.ready],
};

const entry: RoomStorageGuide = {
  room: 'entry',
  purpose: t(
    'Go-bags, rain gear and the headlamp, ready to grab on the way out.',
    'Go-bag, kapote at headlamp, handang damputin palabas.',
  ),
  climate: t(
    'By the exit, dry, off the floor, where everyone can reach it in the dark.',
    'Sa tabi ng labasan, tuyo, hindi sa sahig, maabot ng lahat kahit madilim.',
  ),
  rules: [
    rule('bag',
      t('One bag per person', 'Isang bag kada tao'),
      t('Each person has their own bag: water, snacks, a light, meds, a copy of the contact card. Kids carry a light bag they can manage.',
        'May sariling bag ang bawat isa: tubig, meryenda, ilaw, gamot, kopya ng contact card. Magaan lang ang bag ng bata.')),
    rule('door',
      t('By the door, not behind it', 'Sa tabi ng pinto, hindi sa likod'),
      t('Hang bags on a hook or shelf right by the exit where the door still opens fully. In a flood zone, keep them above the usual high-water line.',
        'Isabit ang bag sa hook o istante sa tabi ng labasan na hindi hadlang sa pinto. Sa binabahang lugar, ilagay sa itaas ng karaniwang taas ng baha.')),
    rule('bulb',
      t('Headlamp with fresh batteries', 'Headlamp na may bagong baterya'),
      t('Hands-free light matters when you carry a kid or a bag. Test the headlamp every 3 months and keep spare batteries in the bag.',
        'Mahalaga ang ilaw na hindi hawak kung may bitbit na bata o bag. Subukan ang headlamp tuwing 3 buwan at maglagay ng ekstrang baterya sa bag.')),
    rule('cat-edc',
      t('Rain gear with the bag', 'Kapote kasama ng bag'),
      t('Raincoat and boots live with the go-bag so you do not hunt for them in the rain. Dry them before storing or they mold.',
        'Kasama ng go-bag ang kapote at bota para hindi mo hanapin sa ulan. Patuyuin bago itabi para hindi amagin.')),
    rule('fire',
      t('Matches sealed, lighters shaded', 'Posporo selyado, lighter sa lilim'),
      t('Keep matches in a waterproof container or zip bag. Lighters go out of the sun and away from kids.',
        'Ilagay ang posporo sa waterproof na lalagyan o zip bag. Ilayo ang lighter sa araw at sa bata.')),
    rule('refresh',
      t('Repack twice a year', 'Mag-repack dalawang beses kada taon'),
      t('Swap the water, snacks and meds in the bag every 6 months. Check that kids\' clothes still fit.',
        'Palitan ang tubig, meryenda at gamot sa bag tuwing 6 na buwan. Tingnan kung kasya pa ang damit ng bata.')),
  ],
  never: [
    t('Never let the go-bag become the family snack drawer.',
      'Huwag gawing snack drawer ng pamilya ang go-bag.'),
    t('Never block the exit with bags, shoes or boxes.',
      'Huwag harangan ang labasan ng bag, sapatos o kahon.'),
    t('Never pack a bag so heavy that a child or senior cannot carry it.',
      'Huwag gawing sobrang bigat ang bag na hindi mabuhat ng bata o matanda.'),
    t('Never leave the go-bag on the floor of a flood-prone ground floor.',
      'Huwag iwanan ang go-bag sa sahig ng binabahang ground floor.'),
  ],
  cadence: t(
    'Repack every 6 months; test the headlamp every 3 months.',
    'Mag-repack tuwing 6 na buwan; subukan ang headlamp tuwing 3 buwan.',
  ),
  sources: [SRC.ndrrmc, SRC.prc, SRC.ready],
};

const bodega: RoomStorageGuide = {
  room: 'bodega',
  purpose: t(
    'Tools, tarp, rope, plywood and pet supplies, ventilated and off the damp floor.',
    'Mga gamit, trapal, lubid, plywood at gamit ng alaga, may hangin at hindi sa basang sahig.',
  ),
  climate: t(
    'Ventilated, dry and shaded, with everything off the concrete floor.',
    'May hangin, tuyo at nasa lilim, lahat nakaangat sa sementong sahig.',
  ),
  rules: [
    rule('tool',
      t('Tools together, in one box', 'Mga gamit sa isang kahon'),
      t('Hammer, pliers, nails, duct tape and rope in one labeled box you can grab in the dark. Wipe tools dry after use; rust comes fast in humid air.',
        'Martilyo, plais, pako, duct tape at lubid sa isang kahon na may label na madaling dakmain sa dilim. Punasang tuyo ang gamit; mabilis kalawangin sa mahalumigmig na hangin.')),
    rule('cat-shelter',
      t('Tarp and plywood ready to fit', 'Trapal at plywood handang ikabit'),
      t('Pre-cut plywood to your window sizes and label each piece. Fold the tarp only when dry; mold grows on a wet one in days.',
        'Putulin na ang plywood ayon sa sukat ng bintana at lagyan ng label. Itupi ang trapal kapag tuyo lang; inaamag ang basa sa ilang araw.')),
    rule('cat-pets',
      t('Pet food sealed and dated', 'Pagkain ng alaga, selyado at may petsa'),
      t('Dry food goes in an airtight bin, cool and off the floor. Use an opened bag within about 6 weeks and rotate it like your own food.',
        'Ilagay ang dry food sa airtight na lalagyan, malamig at hindi sa sahig. Ubusin ang nabukas na bag sa loob ng mga 6 na linggo at i-rotate tulad ng sarili mong pagkain.')),
    rule('pet',
      t('Carrier where you can grab it', 'Carrier na madaling dakmain'),
      t('Leash and carrier by the bodega door, with a photo of your pet and a copy of its vaccination record in the go-bag.',
        'Tali at carrier sa tabi ng pinto ng bodega, may litrato ng alaga at kopya ng vaccination record sa go-bag.')),
    rule('earthquake',
      t('Heavy things low', 'Mabigat sa baba'),
      t('Store heavy tools, boards and bins on low shelves, never above head height. Strap tall shelves to the wall.',
        'Ilagay ang mabibigat na gamit, tabla at lalagyan sa mababang istante, hindi sa itaas ng ulo. Itali ang matataas na istante sa pader.')),
    rule('warning',
      t('Fuel and chemicals apart', 'Hiwalay ang gasolina at kemikal'),
      t('Gasoline, thinner, pesticides and LPG stay in a ventilated spot outside the living space, away from the stove, the water and the pet food.',
        'Gasolina, thinner, pestisidyo at LPG sa lugar na may hangin sa labas ng tirahan, malayo sa kalan, tubig at pagkain ng alaga.')),
  ],
  never: [
    t('Never store LPG, gasoline or butane indoors near heat or in a closed room.',
      'Huwag mag-imbak ng LPG, gasolina o butane sa loob ng bahay malapit sa init o sa saradong kuwarto.'),
    t('Never stack heavy things above head height or over where people sleep.',
      'Huwag magpatong ng mabigat sa itaas ng ulo o sa itaas ng tulugan.'),
    t('Never leave pet food in the open sack. Rats and ants find it first.',
      'Huwag iwanan ang pagkain ng alaga sa bukas na sako. Unang nahahanap ng daga at langgam.'),
    t('Never run a generator inside the house, garage or bodega. The fumes kill.',
      'Huwag paandarin ang generator sa loob ng bahay, garahe o bodega. Nakamamatay ang usok.'),
  ],
  cadence: t(
    'Check tools for rust and the tarp for mold every 6 months; rotate pet food with your groceries.',
    'Suriin ang kalawang sa gamit at amag sa trapal tuwing 6 na buwan; i-rotate ang pagkain ng alaga kasabay ng grocery.',
  ),
  sources: [SRC.phivolcs, SRC.ndrrmc, SRC.ready],
};

const saferoom: RoomStorageGuide = {
  room: 'saferoom',
  purpose: t(
    'The upper or inner room where the family shelters in place: locks, alarms, mats, hidden lights.',
    'Ang itaas o panloob na kuwarto kung saan nagkukubli ang pamilya: kandado, alarm, banig, tagong ilaw.',
  ),
  climate: t(
    'Upper floor, dry, with a door that locks from inside and a window you can open.',
    'Itaas na palapag, tuyo, may pintong naka-lock mula sa loob at bintanang mabubuksan.',
  ),
  rules: [
    rule('flood',
      t('Upstairs before the water rises', 'Umakyat bago tumaas ang tubig'),
      t('When a flood warning is raised, move food, water, meds and documents to the upper floor before water enters. Do not wait to wade.',
        'Kapag may babala ng baha, iakyat ang pagkain, tubig, gamot at dokumento bago pumasok ang tubig. Huwag hintaying lumusong.')),
    rule('fire',
      t('Extinguisher by the exit', 'Extinguisher sa tabi ng labasan'),
      t('Mount it by an exit or the kitchen door at about chest height, gauge in the green. Remember PASS: Pull, Aim, Squeeze, Sweep.',
        'Ikabit sa tabi ng labasan o pinto ng kusina sa taas ng dibdib, gauge sa green. Tandaan ang PASS: Pull, Aim, Squeeze, Sweep.')),
    rule('bell',
      t('Smoke alarm: test monthly', 'Smoke alarm: subukan buwan-buwan'),
      t('Press the test button monthly and change the battery yearly. Mount it on the ceiling outside sleeping areas, away from kitchen steam.',
        'Pindutin ang test button buwan-buwan at palitan ang baterya taon-taon. Ikabit sa kisame sa labas ng tulugan, malayo sa singaw ng kusina.')),
    rule('earthquake',
      t('Nothing heavy above beds', 'Walang mabigat sa itaas ng kama'),
      t('Keep shelves, mirrors and aircon units off the wall above where people sleep. Heavy items go low; strap tall cabinets to the wall.',
        'Huwag maglagay ng istante, salamin at aircon sa pader sa itaas ng tulugan. Mabigat sa baba; itali ang matataas na cabinet sa pader.')),
    rule('lock',
      t('Lock and bar at hand', 'Kandado at trangka sa abot-kamay'),
      t('Keep the extra lock or bar fitted or hanging by the door, not in a box. Everyone should know how to open it from inside in the dark.',
        'Ikabit o isabit ang ekstrang kandado o trangka sa tabi ng pinto, hindi sa kahon. Dapat alam ng lahat kung paano buksan mula sa loob kahit madilim.')),
    rule('eye',
      t('Blackout curtains ready', 'Handa ang makapal na kurtina'),
      t('Thick curtains hide your lights during unrest or a long brownout and keep the room cooler by day. Keep one window openable for air and escape.',
        'Tinatago ng makapal na kurtina ang ilaw sa gulo o matagal na brownout at pinapalamig ang kuwarto sa umaga. Panatilihing mabubuksan ang isang bintana para sa hangin at labasan.')),
  ],
  never: [
    t('Never lock yourself in a room with no second way out. A fire needs another exit.',
      'Huwag mag-lock sa kuwartong walang ikalawang labasan. Kailangan ng ibang daan sa sunog.'),
    t('Never hang heavy things above a bed.',
      'Huwag magsabit ng mabigat sa itaas ng kama.'),
    t('Never store the fire extinguisher inside a cabinet or behind boxes.',
      'Huwag itago ang fire extinguisher sa loob ng cabinet o sa likod ng kahon.'),
    t('Never shelter on the ground floor once a flood warning is raised.',
      'Huwag magkubli sa ground floor kapag may babala na ng baha.'),
  ],
  cadence: t(
    'Test the smoke alarm and check the extinguisher gauge monthly; walk the family through the plan every 6 months.',
    'Subukan ang smoke alarm at tingnan ang gauge ng extinguisher buwan-buwan; i-rehearse ang plano kasama ang pamilya tuwing 6 na buwan.',
  ),
  sources: [SRC.phivolcs, SRC.ndrrmc, SRC.prc],
};

export const STORAGE_GUIDES: Record<RoomId, RoomStorageGuide> = {
  kitchen, water, bedroom, bathroom, sala, study, entry, bodega, saferoom,
};

/* ------------------------------------------------------------------ */
/* PER-ITEM TIPS (one per catalog id)                                  */
/* ------------------------------------------------------------------ */

export const ITEM_STORE_TIPS: ItemStoreTips = {
  // ---- WATER ----
  'water-bottle-1l': t(
    'Out of sunlight, off concrete, rotate every 6 months. Write the date on the cap.',
    'Ilayo sa araw, hindi sa semento, palitan tuwing 6 na buwan. Isulat ang petsa sa takip.'),
  'water-gallon-5': t(
    'Sealed, in the shade, on a shelf or pallet. Refill at the station every 6 months or when a storm is announced.',
    'Selyado, sa lilim, sa istante o pallet. Mag-refill sa station tuwing 6 na buwan o kapag may anunsyo ng bagyo.'),
  'water-drum': t(
    'Tight lid, in the shade, labeled WASH / FLUSH so no one drinks it. Drain, scrub and refill every 6 months.',
    'Mahigpit na takip, sa lilim, may label na PANGHUGAS / PANG-FLUSH para walang uminom. Ubusin, kuskusin at punuin muli tuwing 6 na buwan.'),
  'water-purifier-tabs': t(
    'Sealed in the original pack, cool and dry. Check the date yearly; follow the pack for amount and wait time.',
    'Selyado sa orihinal na pack, malamig at tuyo. Suriin ang petsa taon-taon; sundin ang pack sa dami at oras ng paghintay.'),
  'water-filter': t(
    'Dry it fully, cap both ends, keep it in its pouch in the go-bag. Replace the cartridge as the maker says.',
    'Patuyuin nang buo, takpan ang dalawang dulo, ilagay sa pouch sa go-bag. Palitan ang cartridge ayon sa gumawa.'),

  // ---- FOOD ----
  'rice-kg': t(
    'Airtight container, bay leaf against weevils, use the oldest first.',
    'Airtight na lalagyan, dahon ng laurel laban sa bukbok, gamitin muna ang pinakaluma.'),
  'canned-sardines': t(
    'Cool shelf away from the stove, labels out, oldest in front. Toss dented, rusty or bulging cans.',
    'Malamig na istante malayo sa kalan, label nakaharap, pinakaluma sa harap. Itapon ang yupi, kalawangin o umbok na lata.'),
  'canned-meat': t(
    'Below 24 °C if you can, away from the stove and sun. Lasts past the date if the can is sound.',
    'Mababa sa 24 °C kung kaya, malayo sa kalan at araw. Tumatagal lampas sa petsa kung buo ang lata.'),
  'instant-noodles': t(
    'In a sealed bin so ants and rats stay out. The oil in the noodles goes rancid, so rotate every 6 months.',
    'Sa selyadong lalagyan para hindi pasukin ng langgam at daga. Nag-aanta ang mantika sa noodles, kaya palitan tuwing 6 na buwan.'),
  'biscuits': t(
    'Sealed tin or zip bag; humidity makes them soft. Eat and replace every 6 months.',
    'Selyadong lata o zip bag; lumalambot sa halumigmig. Kainin at palitan tuwing 6 na buwan.'),
  'canned-beans': t(
    'Same shelf as the other cans, oldest in front. Wipe off dust before opening.',
    'Kasama ng ibang lata, pinakaluma sa harap. Punasan ang alikabok bago buksan.'),
  'peanut-butter': t(
    'Cool, dark cupboard, lid tight. Once opened, use within about 3 months.',
    'Malamig at madilim na cupboard, mahigpit ang takip. Kapag nabuksan, ubusin sa loob ng mga 3 buwan.'),
  'butane-stove': t(
    'Canisters upright, ventilated, away from the stove and the sun. Detach the canister after use; stove in its case.',
    'Lata nakatayo, may hangin, malayo sa kalan at araw. Tanggalin ang lata pagkatapos gamitin; stove sa case nito.'),
  'dried-fish': t(
    'Sealed bag or jar, dry and dark; it draws moisture and ants. Use within 3 to 4 months.',
    'Selyadong bag o garapon, tuyo at madilim; humihigop ng halumigmig at langgam. Ubusin sa loob ng 3 hanggang 4 na buwan.'),

  // ---- CANNING & PRESERVATION ----
  'mason-jars': t(
    'Clean and dry, lids loose so they do not rust shut. Low shelf, padded, so a quake does not smash them.',
    'Malinis at tuyo, maluwag ang takip para hindi kalawangin. Mababang istante, may sapin, para hindi mabasag sa lindol.'),
  'salt-sugar': t(
    'Airtight jars; both clump in humidity. Salt never spoils, sugar keeps for years if dry.',
    'Airtight na garapon; pareho bumubuo-buo sa halumigmig. Hindi nasisira ang asin, tumatagal ng taon ang asukal kung tuyo.'),
  'vinegar': t(
    'Capped, cool, out of the sun. Keeps for years; cloudiness is harmless. Never next to bleach.',
    'May takip, malamig, hindi naaarawan. Tumatagal ng taon; hindi masama ang paglabo. Huwag sa tabi ng bleach.'),
  'cooking-oil': t(
    'Dark cupboard away from the stove; heat and light make it rancid. Use within a year and smell it before use.',
    'Madilim na cupboard malayo sa kalan; nag-aanta sa init at liwanag. Ubusin sa loob ng isang taon at amuyin bago gamitin.'),
  'ziplock': t(
    'Flat in a drawer away from heat. Reuse bags only for dry goods, washed and fully dried first.',
    'Nakalatag sa drawer malayo sa init. Gamitin muli ang bag para lang sa tuyong pagkain, hugasan at patuyuin muna.'),

  // ---- MEDICINE & FIRST AID ----
  'first-aid-kit': t(
    'High shelf in the bedroom, not the bathroom. Restock what you use that week; check every 3 months.',
    'Mataas na istante sa kuwarto, hindi sa banyo. Palitan ang nagamit sa parehong linggo; suriin tuwing 3 buwan.'),
  'paracetamol': t(
    'Original box, cool and dry, high and locked. Not the bathroom. Toss at the printed date.',
    'Orihinal na kahon, malamig at tuyo, mataas at naka-lock. Hindi sa banyo. Itapon sa nakalimbag na petsa.'),
  'ors': t(
    'Sealed sachets, dry. Mix only when needed with clean water; throw out mixed ORS after 24 hours.',
    'Selyadong sachet, tuyo. Haluin lang kung kailangan sa malinis na tubig; itapon ang hinalong ORS pagkalipas ng 24 oras.'),
  'maintenance-meds': t(
    'Original box with the prescription, cool and dry. Use from the spare and refill it, so the buffer is always fresh.',
    'Orihinal na kahon kasama ng reseta, malamig at tuyo. Gamitin mula sa ekstra at palitan, para laging sariwa ang reserba.'),
  'antiseptic': t(
    'Caps tight, upright, away from heat and flame. Alcohol is flammable: not near the stove or candles.',
    'Mahigpit ang takip, nakatayo, malayo sa init at apoy. Nasusunog ang alcohol: hindi malapit sa kalan o kandila.'),
  'masks-n95': t(
    'Sealed in the box or a zip bag, dry and uncrushed. A damp or crushed mask does not seal.',
    'Selyado sa kahon o zip bag, tuyo at hindi nalulukot. Hindi sumisikip ang basa o lukot na mask.'),
  'insect-repellent': t(
    'Capped, cool, out of reach of kids. Put the go-bag bottle in a zip bag; it leaks in heat.',
    'May takip, malamig, hindi maabot ng bata. Ilagay sa zip bag ang bote sa go-bag; tumatagas sa init.'),

  // ---- BABY & CHILD ----
  'formula': t(
    'Sealed can, cool and dry, check the date; opened cans last 1 month.',
    'Selyadong lata, malamig at tuyo, tingnan ang petsa; 1 buwan lang ang nabukas na lata.'),
  'diapers': t(
    'Sealed pack, off the floor; damp makes them mold. Buy the next size up for the stock.',
    'Selyadong pack, hindi sa sahig; inaamag sa basa. Bumili ng isang size na mas malaki para sa stock.'),
  'wipes': t(
    'Sealed, flip-lid closed, out of the sun; they dry out. Rotate with daily use.',
    'Selyado, sarado ang flip-lid, hindi naaarawan; natutuyo ito. I-rotate sa pang-araw-araw na gamit.'),
  'kids-meds': t(
    'Original box with the dropper, cool, high and locked. Not the bathroom. Check the date every 3 months.',
    'Orihinal na kahon kasama ng dropper, malamig, mataas at naka-lock. Hindi sa banyo. Suriin ang petsa tuwing 3 buwan.'),
  'comfort-item': t(
    'In the kid\'s own go-bag: one small toy, cards, a notebook and crayons. Keep it light and let the kid choose.',
    'Sa sariling go-bag ng bata: isang maliit na laruan, baraha, notebook at krayola. Magaan lang at hayaang pumili ang bata.'),
  'bottles-sterile': t(
    'Clean, dry and assembled in a sealed bag. Sterilizing tabs sealed and dry; follow the pack.',
    'Malinis, tuyo at nakabuo sa selyadong bag. Selyado at tuyo ang sterilizing tabs; sundin ang pack.'),

  // ---- POWER & LIGHTS ----
  'flashlight': t(
    'One on a hook by the main switch, one by the bed. Batteries out if stored for months; rechargeables kept charged.',
    'Isa sa hook sa tabi ng main switch, isa sa tabi ng kama. Tanggalin ang baterya kung itatabi ng ilang buwan; laging charged ang rechargeable.'),
  'batteries': t(
    'Room temperature, in the pack, not loose with coins or keys. Don\'t mix old and new.',
    'Normal na temperatura, nasa pack, hindi nakakalat kasama ng barya o susi. Huwag paghaluin ang luma at bago.'),
  'powerbank': t(
    'Store at 50–80%, top up monthly, never in a hot car.',
    'Itabi sa 50–80%, mag-top up buwan-buwan, huwag sa mainit na sasakyan.'),
  'solar-panel': t(
    'Folded, dry, in its bag, away from damp. Wipe off dust or salt before storing; test it on a sunny day every few months.',
    'Nakatupi, tuyo, sa bag nito, malayo sa basa. Punasan ang alikabok o asin bago itabi; subukan sa maaraw na araw tuwing ilang buwan.'),
  'rechargeable-fan': t(
    'Charge to full when a storm is announced; otherwise store at 50–80%. Dust the blades; keep out of the sun.',
    'I-full charge kapag may anunsyo ng bagyo; kung hindi, itabi sa 50–80%. Linisin ang elisi; ilayo sa araw.'),
  'extension-cord': t(
    'Coiled loosely, dry, no kinks. Check for cracked insulation; never use a cord that got wet until fully dry.',
    'Maluwag na nakaikot, tuyo, walang baluktot. Tingnan kung may bitak ang balot; huwag gamitin ang nabasang cord hangga\'t hindi tuyo.'),

  // ---- SHELTER & REPAIR ----
  'tarp': t(
    'Dry before folding or it molds. Pack it with the rope and clips in one bag so it goes up fast.',
    'Patuyuin bago itupi para hindi amagin. Isama sa isang bag ang lubid at clip para mabilis ikabit.'),
  'rope': t(
    'Coiled, dry, out of the sun; UV weakens nylon. Keep it with the tarp.',
    'Nakaikot, tuyo, hindi naaarawan; pinapahina ng araw ang nylon. Isama sa trapal.'),
  'duct-tape': t(
    'Cool and dry in a sealed bag; heat makes the glue gummy. One roll in the go-bag.',
    'Malamig at tuyo sa selyadong bag; lumalagkit ang pandikit sa init. Isang roll sa go-bag.'),
  'tools': t(
    'One labeled box on a low shelf, tools wiped dry. Keep nails and screws in a small jar inside.',
    'Isang kahon na may label sa mababang istante, pinunasang tuyo ang gamit. Pako at turnilyo sa maliit na garapon sa loob.'),
  'plywood': t(
    'Pre-cut to each window and labeled. Store flat, dry and off the concrete or it warps.',
    'Putulin na ayon sa bawat bintana at lagyan ng label. Itabi nang nakalatag, tuyo at hindi sa semento para hindi kumiwal.'),
  'sleeping-mat': t(
    'Rolled tight in a plastic bag against dust and damp. Air it out every 6 months.',
    'Mahigpit na nakarolyo sa plastik laban sa alikabok at basa. Ibilad tuwing 6 na buwan.'),

  // ---- HYGIENE & SANITATION ----
  'soap': t(
    'Dry soap dish or sealed bag; bars melt in damp. A spare bar in each go-bag.',
    'Tuyong soap dish o selyadong bag; natutunaw ang sabon sa basa. Isang ekstra sa bawat go-bag.'),
  'tissue': t(
    'Sealed plastic or a box with a lid, high and dry. Bathroom damp makes it go soft.',
    'Selyadong plastik o kahon na may takip, mataas at tuyo. Lumalambot sa basa ng banyo.'),
  'trash-bags': t(
    'Dry, away from sharp things, next to the bucket. Keep a few in the go-bag as a liner or poncho.',
    'Tuyo, malayo sa matalim, sa tabi ng timba. Maglagay ng ilan sa go-bag bilang liner o kapote.'),
  'sanitary-pads': t(
    'Sealed zip bag or box, dry; damp pads mold. A few in every go-bag.',
    'Selyadong zip bag o kahon, tuyo; inaamag ang basang napkin. Ilan sa bawat go-bag.'),
  'bleach': t(
    'Original bottle, capped, cool and dark, high and locked. Loses strength in about a year, so buy fresh yearly.',
    'Orihinal na bote, may takip, malamig at madilim, mataas at naka-lock. Humihina sa loob ng isang taon, kaya bumili ng bago taon-taon.'),
  'hand-sanitizer': t(
    'Capped, out of sun and heat; it is flammable alcohol. A small bottle in each go-bag.',
    'May takip, hindi naaarawan at malayo sa init; nasusunog na alcohol ito. Maliit na bote sa bawat go-bag.'),
  'bucket': t(
    'Clean, dry, stacked upside down; standing water breeds mosquitoes. Fill when a storm or water cut is announced.',
    'Malinis, tuyo, nakataob; nag-lalamok ang nakatayong tubig. Punuin kapag may anunsyo ng bagyo o water interruption.'),

  // ---- COMMS & DOCUMENTS ----
  'radio': t(
    'Batteries out, stored beside it in a zip bag. Test monthly and tape a label with the AM stations on it.',
    'Tanggal ang baterya, nakatabi sa zip bag sa tabi nito. Subukan buwan-buwan at idikit ang label ng mga AM station.'),
  'documents': t(
    'Waterproof pouch in the go-bag plus photos on the phone and in email.',
    'Waterproof pouch sa go-bag at litrato sa phone at sa email.'),
  'whistle': t(
    'On a lanyard clipped to each go-bag, one per person. Teach kids: three blasts means help.',
    'Nakasabit sa lanyard sa bawat go-bag, isa kada tao. Turuan ang bata: tatlong pito, ibig sabihin tulong.'),
  'contact-card': t(
    'Laminated or in a zip bag: one per go-bag, one on the fridge, one in each wallet. Update yearly.',
    'Laminated o sa zip bag: isa kada go-bag, isa sa ref, isa sa bawat wallet. I-update taon-taon.'),
  'phone-charged': t(
    'Charge to 50–80% and top up monthly. Load the SIM now and then so it stays active; keep it with the documents.',
    'I-charge sa 50–80% at mag-top up buwan-buwan. Lagyan ng load paminsan-minsan para aktibo ang SIM; itabi kasama ng dokumento.'),

  // ---- CASH ----
  'cash-small': t(
    'Small bills, split between the go-bag and a hidden spot at home.',
    'Maliit na papel, hati sa go-bag at sa tagong lugar sa bahay.'),
  'coins': t(
    'A coin purse in each go-bag plus a jar at home. Fare and sari-sari change when no one can break a big bill.',
    'Coin purse sa bawat go-bag at garapon sa bahay. Pamasahe at sukli sa sari-sari kapag walang makapagpabarya.'),

  // ---- EDC ----
  'go-bag': t(
    'On a hook by the exit, one per person, above flood level. Repack every 6 months.',
    'Sa hook sa tabi ng labasan, isa kada tao, sa itaas ng abot ng baha. Mag-repack tuwing 6 na buwan.'),
  'multitool': t(
    'Closed, dry, a drop of oil on the hinge. Top pocket of the go-bag, out of reach of kids.',
    'Nakasara, tuyo, may patak ng langis sa bisagra. Sa itaas na bulsa ng go-bag, hindi maabot ng bata.'),
  'headlamp': t(
    'In the go-bag with spare batteries beside it, not inside. Test every 3 months.',
    'Sa go-bag, may ekstrang baterya sa tabi, hindi sa loob. Subukan tuwing 3 buwan.'),
  'rain-gear': t(
    'Dried fully, hung or folded with the go-bag. Boots upright and open to air so they do not mold.',
    'Patuyuin nang buo, isabit o itupi kasama ng go-bag. Bota nakatayo at bukas sa hangin para hindi amagin.'),
  'lighter': t(
    'Matches in a waterproof container; lighters out of the sun and away from kids. One set in the bag, one in the kitchen.',
    'Posporo sa waterproof na lalagyan; lighter hindi naaarawan at malayo sa bata. Isang set sa bag, isa sa kusina.'),

  // ---- PETS ----
  'pet-food': t(
    'Airtight bin, cool and off the floor; use an opened bag within about 6 weeks. Rotate with your groceries.',
    'Airtight na lalagyan, malamig at hindi sa sahig; ubusin ang nabukas na bag sa loob ng mga 6 na linggo. I-rotate kasabay ng grocery.'),
  'pet-leash': t(
    'Carrier open and by the bodega door, leash hanging on it. Pet photo and vaccine card in the go-bag.',
    'Carrier bukas at sa tabi ng pinto ng bodega, tali nakasabit dito. Litrato ng alaga at vaccine card sa go-bag.'),
  'pet-bowl': t(
    'Collapsible bowl and the pet\'s meds in a zip bag inside the carrier. Meds cool, dry, labeled, checked every 3 months.',
    'Collapsible na mangkok at gamot ng alaga sa zip bag sa loob ng carrier. Gamot malamig, tuyo, may label, suriin tuwing 3 buwan.'),

  // ---- SECURITY & SAFETY ----
  'fire-extinguisher': t(
    'Mounted by an exit and the kitchen, gauge in the green, shake monthly.',
    'Nakakabit sa tabi ng labasan at kusina, gauge sa green, alugin buwan-buwan.'),
  'door-lock': t(
    'Fitted or hanging by the door, not in a box. Everyone knows how to open it from inside in the dark.',
    'Nakakabit o nakasabit sa tabi ng pinto, hindi sa kahon. Alam ng lahat kung paano buksan mula sa loob kahit madilim.'),
  'smoke-alarm': t(
    'On the ceiling outside the bedrooms, away from kitchen steam. Test monthly, new battery yearly.',
    'Sa kisame sa labas ng mga kuwarto, malayo sa singaw ng kusina. Subukan buwan-buwan, bagong baterya taon-taon.'),
  'blackout-curtain': t(
    'Folded dry in the saferoom closet with its hooks. Shake out the dust every 6 months.',
    'Nakatupi at tuyo sa closet ng saferoom kasama ng hook. Pagpagin ang alikabok tuwing 6 na buwan.'),
  'gloves-safety': t(
    'Dry, in a zip bag with the goggles, in the go-bag or by the exit. Replace cracked gloves.',
    'Tuyo, sa zip bag kasama ng goggles, sa go-bag o sa tabi ng labasan. Palitan ang bitak na guwantes.'),
};

/* ------------------------------------------------------------------ */
/* ROOM FACTS ("did you know" notes on the drawing; EN < 90 chars)     */
/* ------------------------------------------------------------------ */

export const ROOM_FACTS: Record<RoomId, L[]> = {
  kitchen: [
    t('Canned food lasts past its date, but a dented, bulging or rusty can is unsafe.',
      'Tumatagal ang de-lata lampas sa petsa, pero delikado ang yupi, umbok o kalawangin.'),
    t('Heat near the stove shortens the shelf life of canned and dry food.',
      'Pinapaikli ng init malapit sa kalan ang buhay ng de-lata at tuyong pagkain.'),
    t('A bay leaf in the rice bin helps keep weevils away.',
      'Nakakatulong ang dahon ng laurel sa lalagyan ng bigas laban sa bukbok.'),
  ],
  water: [
    t('Clear bottles left in sunlight grow algae. Keep water in the shade.',
      'Tumutubo ang lumot sa malinaw na bote na naaarawan. Ilagay ang tubig sa lilim.'),
    t('4 liters per person per day: 3 to drink and cook, 1 to wash.',
      '4 litro kada tao kada araw: 3 pang-inom at pangluto, 1 panghugas.'),
    t('No way to boil? Unscented bleach, about 2 drops per liter, then wait 30 minutes.',
      'Hindi makapagpakulo? Unscented bleach, mga 2 patak kada litro, maghintay ng 30 minuto.'),
  ],
  bedroom: [
    t('The bathroom is the worst place for medicine: heat and steam shorten its life.',
      'Pinakamasamang lugar para sa gamot ang banyo: pinapaikli ng init at singaw ang buhay nito.'),
    t('An opened formula can lasts about 1 month. Write the open date on the lid.',
      'Mga 1 buwan lang ang nabukas na lata ng formula. Isulat sa takip ang petsa ng pagbukas.'),
    t('Child-proof caps only slow a kid down. A high, locked box stops them.',
      'Pinapabagal lang ng child-proof cap ang bata. Pinipigilan sila ng mataas at naka-lock na kahon.'),
  ],
  bathroom: [
    t('Bleach loses strength in heat and light. A year-old bottle is weaker.',
      'Humihina ang bleach sa init at liwanag. Mas mahina ang isang taong bote.'),
    t('Bleach plus vinegar or alcohol makes toxic gas. Never mix cleaners.',
      'Nakakalason na gas ang bleach na may suka o alcohol. Huwag paghaluin ang panlinis.'),
    t('A bucket left with water breeds dengue mosquitoes in about a week.',
      'Nagpaparami ng lamok ng dengue ang timbang may tubig sa loob ng isang linggo.'),
  ],
  sala: [
    t('Batteries lose charge faster in heat. Keep them off the sunny window shelf.',
      'Mas mabilis maubos ang baterya sa init. Ilayo sa naaarawang istante.'),
    t('Lithium power banks age fastest stored full or empty. 50–80% is the sweet spot.',
      'Pinakamabilis tumanda ang lithium power bank kung puno o ubos. 50–80% ang tama.'),
    t('A swollen battery is a fire risk. Stop charging it.',
      'Panganib sa sunog ang namamagang baterya. Itigil ang pag-charge.'),
  ],
  study: [
    t('Paper dies in a flood. A photo of your ID in email survives.',
      'Nasisira ang papel sa baha. Nakakaligtas ang litrato ng ID sa email.'),
    t('ATMs and e-wallets fail with the power. Small bills still work.',
      'Hindi gumagana ang ATM at e-wallet kung walang kuryente. Gumagana pa ang maliit na papel.'),
    t('AM radio keeps working when cell data is down.',
      'Gumagana pa ang AM radio kahit walang data.'),
  ],
  entry: [
    t('A go-bag by the door saves the minutes you would spend hunting in the dark.',
      'Nakakatipid ng minuto ang go-bag sa tabi ng pinto imbes na maghanap sa dilim.'),
    t('Kids carry a light bag: water, a snack, a light, the contact card.',
      'Magaan ang bag ng bata: tubig, meryenda, ilaw, contact card.'),
    t('In a flood zone, hang the bag above the usual high-water line.',
      'Sa binabahang lugar, isabit ang bag sa itaas ng karaniwang taas ng baha.'),
  ],
  bodega: [
    t('Heavy things low: a falling toolbox hurts more than a falling tarp.',
      'Mabigat sa baba: mas masakit ang bumagsak na toolbox kaysa trapal.'),
    t('Rust shows up fast in humid air. Wipe tools dry before storing.',
      'Mabilis kalawangin sa mahalumigmig na hangin. Punasang tuyo ang gamit bago itabi.'),
    t('LPG and butane never go indoors near heat. Leaked gas sinks and pools.',
      'Hindi dapat sa loob malapit sa init ang LPG at butane. Bumababa at nag-iipon ang tumagas na gas.'),
  ],
  saferoom: [
    t('In a flood, move essentials upstairs before the water rises, not after.',
      'Sa baha, iakyat ang mahahalaga bago tumaas ang tubig, hindi pagkatapos.'),
    t('Nothing heavy above a bed: shelves and mirrors fall in an earthquake.',
      'Walang mabigat sa itaas ng kama: bumabagsak ang istante at salamin sa lindol.'),
    t('Extinguisher gauge in the green? Check monthly. PASS: Pull, Aim, Squeeze, Sweep.',
      'Gauge ng extinguisher sa green? Tingnan buwan-buwan. PASS: Pull, Aim, Squeeze, Sweep.'),
  ],
};
