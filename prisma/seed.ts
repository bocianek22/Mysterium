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
        "Mysterium to escape roomy z duszą — mroczne, dopracowane i pełne napięcia.\n\nZaczynamy od „Pułapki”: mobilnej skrzyni, którą przywozimy na Twój event, urodziny czy integrację. To skrzynia mordercy — sieć zamków i szyfrów do rozpracowania w 60 minut. Wkrótce otworzymy też stacjonarny pokój w Warszawie.\n\nTworzymy gry, które wciągają od pierwszej sekundy — idealne na wieczór ze znajomymi, randkę z dreszczykiem czy firmowy team building.",
      aboutEn:
        "Mysterium is escape rooms with a soul — dark, polished and full of tension.\n\nWe start with 'The Trap': a mobile box we bring to your event, birthday or team day. It's the murderer's chest — a web of locks and ciphers to crack in 60 minutes. An on-site room in Warsaw is coming soon.\n\nWe craft games that grip you from the first second — perfect for a night out, a thrilling date or corporate team building.",
    },
  });

  // --- Pokoje ---
  const rooms = [
    {
      slug: "pokoj-nr-1",
      namePl: "Pokój stacjonarny",
      nameEn: "On-site Room",
      taglinePl: "Stacjonarny escape room w Warszawie. Wkrótce otwieramy drzwi.",
      taglineEn: "On-site escape room in Warsaw. We open the doors soon.",
      descriptionPl:
        "Za tymi drzwiami powstaje coś, czego jeszcze nie widzieliście.\n\nStacjonarny escape room Mysterium — mroczny klimat, presja czasu i zagadki, które wciągają bez reszty. Już wkrótce w Warszawie.",
      descriptionEn:
        "Behind these doors we're building something you haven't seen yet.\n\nMysterium's on-site escape room — a dark atmosphere, time pressure and puzzles that pull you right in. Coming soon to Warsaw.",
      durationMin: 60,
      minPlayers: 2,
      maxPlayers: 8,
      difficultyPl: "Średni",
      difficultyEn: "Medium",
      badgePl: "Stacjonarny",
      badgeEn: "On-site",
      status: "SOON",
      order: 2,
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
    travelZonesJson: JSON.stringify([
      { labelPl: "Warszawa", labelEn: "Warsaw", price: "gratis" },
      { labelPl: "do 30 km od Warszawy", labelEn: "up to 30 km from Warsaw", price: "100 zł" },
      { labelPl: "powyżej 30 km", labelEn: "over 30 km", price: "wycena indyw." },
    ]),
    areaPl: "Warszawa i okolice do ok. 50 km. Dalsze lokalizacje po indywidualnym ustaleniu.",
    areaEn: "Warsaw and surroundings up to ~50 km. Farther locations by arrangement.",
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
    { authorName: "Anna K.", eventPl: "Urodziny", eventEn: "Birthday", textPl: "Niesamowite doświadczenie! Pokój Nr 1 to coś wyjątkowego — klimat, zagadki, profesjonalizm na najwyższym poziomie.", textEn: "An amazing experience! Room No. 1 is something special — atmosphere, puzzles and top-level professionalism.", rating: 5, order: 1 },
    { authorName: "Marek W.", eventPl: "Event firmowy", eventEn: "Corporate event", textPl: "Team building z Mobilną Skrzynią — absolutny hit! Nasz zespół był zachwycony. Na pewno wrócimy!", textEn: "Team building with the Mobile Box — an absolute hit! Our team was thrilled. We'll be back for sure!", rating: 5, order: 2 },
    { authorName: "Kasia & Tomek", eventPl: "Wieczór panieński", eventEn: "Hen party", textPl: "Wieczór panieński z Mysterium — strzał w dziesiątkę. Cudowne wspomnienia na całe życie!", textEn: "A hen party with Mysterium — bullseye. Wonderful memories for a lifetime!", rating: 5, order: 3 },
  ];
  if ((await prisma.review.count()) === 0) {
    await prisma.review.createMany({ data: reviews });
  }
  console.log(`✓ Opinie`);

  // --- FAQ ---
  const faq = [
    { questionPl: "Gdzie znajduje się Mysterium?", questionEn: "Where is Mysterium located?", answerPl: "Nasz stacjonarny pokój zagadek mieści się przy ul. Ogrodowej w Warszawie. Posiadamy też Mobilną Skrzynię na eventy.", answerEn: "Our on-site escape room is located at Ogrodowa St. in Warsaw. We also have a Mobile Box for events.", order: 1 },
    { questionPl: "Ile osób może grać jednocześnie?", questionEn: "How many people can play at once?", answerPl: "Od 2 do 8 osób. Dla większych grup możemy zorganizować specjalne rozwiązania.", answerEn: "From 2 to 8 people. For larger groups we can arrange special solutions.", order: 2 },
    { questionPl: "Jak długo trwa jedna gra?", questionEn: "How long does one game last?", answerPl: "60 minut + brief i podsumowanie. Z przyjazdem warto zarezerwować ok. 1,5 godziny.", answerEn: "60 minutes + briefing and summary. Plan for about 1.5 hours including arrival.", order: 3 },
    { questionPl: "Jak dokonać rezerwacji?", questionEn: "How do I make a booking?", answerPl: "Przez platformę LockMe — przycisk Zarezerwuj na stronie. Dla Mobilnej Skrzyni przez formularz lub WhatsApp.", answerEn: "Via the LockMe platform — the Book button on the site. For the Mobile Box use the form or WhatsApp.", order: 4 },
    { questionPl: "Czy można anulować rezerwację?", questionEn: "Can I cancel a booking?", answerPl: "Tak, do 48 godzin przed planowaną datą bez kosztów.", answerEn: "Yes, up to 48 hours before the scheduled date at no cost.", order: 5 },
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
