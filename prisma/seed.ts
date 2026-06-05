import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Właściciel (konto główne) ---
  const email = process.env.ADMIN_EMAIL || "admin@mysterium.pl";
  const password = process.env.ADMIN_PASSWORD || "mysterium123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {}, // nie nadpisujemy istniejącego konta (chronimy zmiany z panelu)
    create: { email, passwordHash, name: "Właściciel", role: "OWNER" },
  });
  console.log(`✓ Właściciel: ${email}`);

  // --- Ustawienia strony ---
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      aboutPl:
        "Mysterium to escape roomy z duszą — mroczne, dopracowane i pełne napięcia.\n\nNasza „Pułapka” — skrzynia mordercy — czeka na Was w dwóch wersjach: stacjonarnie w Nowym Dworze Mazowieckim (ul. Warszawska 40) oraz mobilnie, gdy przywozimy ją na Twój event, urodziny czy integrację. Sieć zamków i szyfrów do rozpracowania w 60 minut.\n\nTworzymy gry, które wciągają od pierwszej sekundy — idealne na wieczór ze znajomymi, randkę z dreszczykiem czy firmowy team building.",
      aboutEn:
        "Mysterium is escape rooms with a soul — dark, polished and full of tension.\n\nOur 'Trap' — the murderer's chest — awaits in two forms: on-site in Nowy Dwór Mazowiecki (Warszawska 40) and mobile, brought to your event, birthday or team day. A web of locks and ciphers to crack in 60 minutes.\n\nWe craft games that grip you from the first second — perfect for a night out, a thrilling date or corporate team building.",
    },
  });

  // --- Pokoje ---
  const rooms = [
    {
      slug: "pulapka-stacjonarna",
      namePl: "Pułapka",
      nameEn: "The Trap",
      taglinePl: "Stacjonarna wersja skrzyni mordercy. Zamknięci w jednym pomieszczeniu macie 60 minut, by ją rozpracować.",
      taglineEn: "The on-site version of the murderer's chest. Locked in one room, you have 60 minutes to crack it.",
      descriptionPl:
        "To ta sama skrzynia, która zna już niejeden sekret — tym razem czeka na Was u nas, na miejscu.\n\nWchodzicie do pomieszczenia, w którym morderca ukrył swoją grę. Zamki, szyfry i wskazówki prowadzą jedna do drugiej, a zegar nie zwalnia. Macie 60 minut, żeby otworzyć skrzynię i wydostać to, co skrył — zanim pułapka się zatrzaśnie.\n\nWersja stacjonarna „Pułapki” — pełna scenografia, mocniejszy klimat i to samo mrożące krew w żyłach napięcie.",
      descriptionEn:
        "It's the same chest that already keeps more than one secret — this time it waits for you at our place.\n\nYou enter the room where the murderer hid his game. Locks, ciphers and clues lead from one to the next, and the clock won't slow down. You have 60 minutes to open the chest and recover what he hid — before the trap snaps shut.\n\nThe on-site version of 'The Trap' — full set design, deeper atmosphere and the same blood-chilling tension.",
      durationMin: 60,
      minPlayers: 2,
      maxPlayers: 8,
      difficultyPl: "Średni",
      difficultyEn: "Medium",
      badgePl: "Stacjonarny",
      badgeEn: "On-site",
      pricingJson: JSON.stringify([
        { labelPl: "2 osoby", labelEn: "2 people", price: "199 zł" },
        { labelPl: "3–4 osoby", labelEn: "3–4 people", price: "259 zł" },
        { labelPl: "5–6 osób", labelEn: "5–6 people", price: "319 zł" },
      ]),
      status: "ACTIVE",
      order: 1,
    },
  ];
  for (const r of rooms) {
    await prisma.room.upsert({
      where: { slug: r.slug },
      update: {}, // nie nadpisujemy treści edytowanych w panelu
      create: r,
    });
  }
  console.log(`✓ Pokoje: ${rooms.length}`);

  // --- Oferty mobilne ---
  const mobile = {
    slug: "pulapka",
    namePl: "Pułapka",
    nameEn: "The Trap",
    taglinePl: "Mobilny escape box, który przyjeżdża do Ciebie. Otwórz skrzynię mordercy — jeśli zdążysz.",
    taglineEn: "A mobile escape box delivered to you. Open the murderer's chest — if you dare.",
    descriptionPl:
      "Na stole staje skrzynia. Nikt nie przyznaje się, skąd ją ma — wiadomo tylko, że jej poprzedni właściciel już nie żyje.\n\nW środku morderca zostawił swoją grę: splątaną sieć zamków, szyfrów i niepokojących wskazówek. Macie 60 minut, żeby wejść do jego umysłu, otworzyć kolejne skrytki i odkryć, co ukrył — zanim pułapka zatrzaśnie się na dobre.\n\n„Pułapka” to nasza mobilna skrzynia — przywozimy mroczny escape room na Twój event, urodziny czy integrację. Bez wychodzenia z sali: emocje, presja czasu i zagadki rozstawiamy na miejscu.",
    descriptionEn:
      "A chest is placed on the table. No one admits where it came from — all that's certain is that its previous owner is dead.\n\nInside, the murderer left his game: a tangled web of locks, ciphers and unsettling clues. You have 60 minutes to step into his mind, open every compartment and uncover what he hid — before the trap snaps shut for good.\n\n'The Trap' is our mobile box — we bring a dark escape room to your event, birthday or team day. No need to leave the room: the thrill, the time pressure and the puzzles come to you.",
    image: null,
    durationMin: 60,
    minPlayers: 2,
    maxPlayers: 8,
    priceInfoPl: "od 299 zł",
    priceInfoEn: "from 299 zł",
    pricingJson: JSON.stringify([
      { labelPl: "2–4 osoby", labelEn: "2–4 people", price: "299 zł" },
      { labelPl: "5–8 osób", labelEn: "5–8 people", price: "399 zł" },
      { labelPl: "powyżej 8 osób", labelEn: "8+ people", price: "wycena" },
    ]),
    travelZonesJson: JSON.stringify([
      { labelPl: "Nowy Dwór Mazowiecki", labelEn: "Nowy Dwór Mazowiecki", price: "gratis" },
      { labelPl: "Warszawa i okolice", labelEn: "Warsaw area", price: "100 zł" },
      { labelPl: "powyżej 40 km", labelEn: "over 40 km", price: "wycena indyw." },
    ]),
    areaPl: "Nowy Dwór Mazowiecki, Warszawa i okolice. Dalsze lokalizacje po indywidualnym ustaleniu.",
    areaEn: "Nowy Dwór Mazowiecki, Warsaw and surroundings. Farther locations by arrangement.",
    requirementsPl: "Przestrzeń ok. 9 m², dostęp do gniazdka 230V, stół. Możliwość gry w pomieszczeniu lub pod zadaszeniem.",
    requirementsEn: "About 9 m² of space, a 230V socket, a table. Indoors or under cover.",
    occasionsPl: "Eventy firmowe\nUrodziny\nIntegracje zespołów\nSzkoły i festyny\nWieczory panieńskie/kawalerskie",
    occasionsEn: "Corporate events\nBirthdays\nTeam integrations\nSchools & festivals\nStag/hen parties",
    badgePl: "Wyjazdowy",
    badgeEn: "Mobile",
    status: "ACTIVE",
    order: 1,
  };
  await prisma.mobileOffer.upsert({ where: { slug: mobile.slug }, update: {}, create: mobile });
  console.log(`✓ Oferty mobilne: 1`);

  // --- Cennik ---
  const plans = [
    { namePl: "Pakiet Basic", nameEn: "Basic Package", price: "199 zł", descPl: "Do 4 osób • 60 min", descEn: "Up to 4 people • 60 min", featured: false, order: 1 },
    { namePl: "Pakiet Standard", nameEn: "Standard Package", price: "299 zł", descPl: "Do 6 osób • 60 min", descEn: "Up to 6 people • 60 min", featured: true, order: 2 },
    { namePl: "Pakiet Premium", nameEn: "Premium Package", price: "399 zł", descPl: "Do 8 osób • 90 min", descEn: "Up to 8 people • 90 min", featured: false, order: 3 },
    { namePl: "Event firmowy", nameEn: "Corporate event", price: "Wycena", descPl: "Indywidualna wycena", descEn: "Custom quote", featured: false, order: 4 },
  ];
  if ((await prisma.pricingPlan.count()) === 0) {
    await prisma.pricingPlan.createMany({ data: plans });
  }
  console.log(`✓ Cennik`);

  // --- Opinie ---
  const reviews = [
    { authorName: "Anna K.", eventPl: "Urodziny", eventEn: "Birthday", textPl: "Niesamowite doświadczenie! „Pułapka” to coś wyjątkowego — klimat, zagadki, profesjonalizm na najwyższym poziomie.", textEn: "An amazing experience! 'The Trap' is something special — atmosphere, puzzles and top-level professionalism.", rating: 5, source: "GOOGLE", order: 1 },
    { authorName: "Marek W.", eventPl: "Event firmowy", eventEn: "Corporate event", textPl: "Team building z mobilną „Pułapką” — absolutny hit! Nasz zespół był zachwycony. Na pewno wrócimy!", textEn: "Team building with the mobile 'Trap' — an absolute hit! Our team was thrilled. We'll be back for sure!", rating: 5, source: "GOOGLE", order: 2 },
    { authorName: "Kasia & Tomek", eventPl: "Wieczór panieński", eventEn: "Hen party", textPl: "Wieczór panieński z Mysterium — strzał w dziesiątkę. Cudowne wspomnienia na całe życie!", textEn: "A hen party with Mysterium — bullseye. Wonderful memories for a lifetime!", rating: 5, order: 3 },
  ];
  if ((await prisma.review.count()) === 0) {
    await prisma.review.createMany({ data: reviews });
  }
  console.log(`✓ Opinie`);

  // --- FAQ ---
  const faq = [
    { questionPl: "Gdzie znajduje się Mysterium?", questionEn: "Where is Mysterium located?", answerPl: "Nasz stacjonarny escape room mieści się przy ul. Warszawskiej 40 w Nowym Dworze Mazowieckim. Posiadamy też mobilną „Pułapkę” na eventy.", answerEn: "Our on-site escape room is located at Warszawska 40 in Nowy Dwór Mazowiecki. We also have the mobile 'Trap' for events.", order: 1 },
    { questionPl: "Ile osób może grać jednocześnie?", questionEn: "How many people can play at once?", answerPl: "Od 2 do 8 osób. Dla większych grup możemy zorganizować specjalne rozwiązania.", answerEn: "From 2 to 8 people. For larger groups we can arrange special solutions.", order: 2 },
    { questionPl: "Jak długo trwa jedna gra?", questionEn: "How long does one game last?", answerPl: "60 minut + brief i podsumowanie. Z przyjazdem warto zarezerwować ok. 1,5 godziny.", answerEn: "60 minutes + briefing and summary. Plan for about 1.5 hours including arrival.", order: 3 },
    { questionPl: "Jak dokonać rezerwacji?", questionEn: "How do I make a booking?", answerPl: "Przez platformę LockMe — przycisk Zarezerwuj na stronie. Dla Mobilnej Skrzyni przez formularz lub WhatsApp.", answerEn: "Via the LockMe platform — the Book button on the site. For the Mobile Box use the form or WhatsApp.", order: 4 },
    { questionPl: "Czy można anulować rezerwację?", questionEn: "Can I cancel a booking?", answerPl: "Tak, do 48 godzin przed planowaną datą bez kosztów.", answerEn: "Yes, up to 48 hours before the scheduled date at no cost.", order: 5 },
    { questionPl: "Ile kosztuje gra?", questionEn: "How much does it cost?", answerPl: "Cena zależy od pokoju i liczby osób — pełny cennik znajdziesz na podstronie każdej gry oraz w zakładce Cennik.", answerEn: "The price depends on the room and group size — see the full pricing on each game's page and in the Pricing tab.", order: 6 },
    { questionPl: "Czy to jest straszne?", questionEn: "Is it scary?", answerPl: "„Pułapka” ma mroczny klimat i buduje napięcie, ale to przede wszystkim gra logiczna — nie horror z aktorami. Spokojnie poradzą sobie też mniej odważni.", answerEn: "'The Trap' has a dark atmosphere and builds tension, but it's primarily a logic game — not an actor-driven horror. Even the less brave will be fine.", order: 7 },
    { questionPl: "Od ilu lat można grać?", questionEn: "What's the minimum age?", answerPl: "Polecamy od 12 lat; młodsi gracze mile widziani pod opieką dorosłych.", answerEn: "We recommend ages 12+; younger players are welcome with an adult.", order: 8 },
    { questionPl: "Czy organizujecie eventy firmowe?", questionEn: "Do you host corporate events?", answerPl: "Tak! Robimy integracje i eventy — u nas na miejscu lub z dojazdem (mobilna „Pułapka”). Szczegóły w zakładce Eventy firmowe.", answerEn: "Yes! We run team-building and events — at our place or on-site (mobile 'Trap'). See the Corporate events tab.", order: 9 },
    { questionPl: "Czy dojeżdżacie z Mobilną Skrzynią?", questionEn: "Do you travel with the Mobile Box?", answerPl: "Tak — Nowy Dwór Mazowiecki, Warszawa i okolice. Koszt dojazdu zależy od strefy (szczegóły na stronie oferty mobilnej).", answerEn: "Yes — Nowy Dwór Mazowiecki, Warsaw and surroundings. Travel cost depends on the zone (details on the mobile offer page).", order: 10 },
  ];
  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({ data: faq });
  }
  console.log(`✓ FAQ`);

  console.log("\n✅ Seed zakończony.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
