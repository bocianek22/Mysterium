import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Administrator ---
  const email = process.env.ADMIN_EMAIL || "admin@mysterium.pl";
  const password = process.env.ADMIN_PASSWORD || "mysterium123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Administrator" },
  });
  console.log(`✓ Admin: ${email}`);

  // --- Ustawienia strony ---
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  // --- Pokoje ---
  const rooms = [
    {
      slug: "pokoj-nr-1",
      namePl: "Pokój Nr 1",
      nameEn: "Room No. 1",
      taglinePl: "Stacjonarny escape room przy ul. Ogrodowej w Warszawie.",
      taglineEn: "On-site escape room at Ogrodowa St. in Warsaw.",
      descriptionPl:
        "Wciągająca przygoda pełna zagadek i tajemnic. Macie 60 minut, by rozwikłać kolejne łamigłówki i wydostać się na wolność.",
      descriptionEn:
        "An immersive adventure full of puzzles and mysteries. You have 60 minutes to crack every riddle and escape.",
      durationMin: 60,
      minPlayers: 2,
      maxPlayers: 8,
      badgePl: "Stacjonarny",
      badgeEn: "On-site",
      status: "ACTIVE",
      order: 1,
    },
    {
      slug: "mobilna-skrzynia",
      namePl: "Mobilna Skrzynia",
      nameEn: "Mobile Box",
      taglinePl: "Escape Room przyjeżdża do Ciebie! Na eventy i urodziny.",
      taglineEn: "The Escape Room comes to you! For events and birthdays.",
      descriptionPl:
        "Mobilna wersja naszego escape roomu — idealna na eventy firmowe, urodziny i imprezy. Przyjeżdżamy z kompletem zagadek tam, gdzie chcesz.",
      descriptionEn:
        "A mobile version of our escape room — perfect for corporate events, birthdays and parties. We bring the full set of puzzles wherever you want.",
      durationMin: 60,
      minPlayers: 2,
      maxPlayers: 8,
      badgePl: "Mobilny",
      badgeEn: "Mobile",
      status: "ACTIVE",
      order: 2,
    },
  ];
  for (const r of rooms) {
    await prisma.room.upsert({
      where: { slug: r.slug },
      update: r,
      create: r,
    });
  }
  console.log(`✓ Pokoje: ${rooms.length}`);

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
