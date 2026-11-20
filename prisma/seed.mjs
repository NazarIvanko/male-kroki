// Fills the database with demo content and an admin account.
// Run: npm run db:seed  (safe to run again — it updates instead of duplicating)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

// tiny .env loader so the script works without extra packages
try {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const db = new PrismaClient();

const days = [
  ["Słoik wdzięczności", "Zaczynamy od dobrego słowa.", "🫙", "Emocje", 10, [
    "Weźcie pusty słoik albo pudełko i ozdóbcie je razem.",
    "Każde z was pisze (lub rysuje) jedną rzecz, za którą jest dziś wdzięczne.",
    "Wrzućcie karteczki do słoika i przeczytajcie je na głos.",
    "Umówcie się, że wrzucacie jedną karteczkę każdego wieczoru.",
  ]],
  ["Detektyw kształtów", "Szukamy kół, kwadratów i trójkątów w domu.", "🔍", "Matematyka", 15, [
    "Pokaż dziecku koło, kwadrat i trójkąt narysowane na kartce.",
    "Macie 5 minut, żeby znaleźć w domu jak najwięcej przedmiotów o tych kształtach.",
    "Zapiszcie wyniki w tabelce: kto znalazł więcej kół?",
    "Na koniec narysujcie robota zbudowanego tylko z tych trzech kształtów.",
  ]],
  ["Opowieść z trzech słów", "Wymyślamy bajkę z losowych słów.", "📖", "Język", 15, [
    "Każde z was wybiera jedno słowo (np. smok, rower, pizza).",
    "Rodzic zaczyna historię jednym zdaniem, dziecko dodaje kolejne.",
    "Wszystkie trzy słowa muszą pojawić się w opowieści.",
    "Narysujcie okładkę do waszej bajki i nadajcie jej tytuł.",
  ]],
  ["Kuchenny eksperyment", "Czy jajko pływa w słonej wodzie?", "🥚", "Nauka", 20, [
    "Nalejcie wodę do dwóch szklanek. Do jednej wsypcie 4 łyżki soli i zamieszajcie.",
    "Zapytaj dziecko: co się stanie, gdy włożymy jajko? Zapiszcie hipotezę.",
    "Delikatnie włóżcie jajko najpierw do zwykłej, potem do słonej wody.",
    "Porozmawiajcie, dlaczego w morzu łatwiej się unosić.",
  ]],
  ["Mapa skarbów", "Rysujemy plan pokoju i chowamy skarb.", "🗺️", "Logika", 20, [
    "Narysujcie razem prosty plan jednego pokoju z góry.",
    "Rodzic chowa mały „skarb” i zaznacza go na mapie krzyżykiem.",
    "Dziecko szuka skarbu, korzystając tylko z mapy.",
    "Zamieńcie się rolami!",
  ]],
  ["Rytm i oddech", "Uczymy się uspokajać ciało.", "🌬️", "Emocje", 10, [
    "Usiądźcie wygodnie. Wdech nosem na 4, wydech ustami na 6.",
    "Wyobraźcie sobie, że zdmuchujecie świeczkę na torcie — powoli.",
    "Wystukajcie dłońmi prosty rytm i powtarzajcie go na zmianę.",
    "Porozmawiajcie: kiedy taki oddech może się przydać?",
  ]],
  ["Sklep z liczbami", "Bawimy się w sklep i liczymy pieniądze.", "🛒", "Matematyka", 20, [
    "Przygotujcie kilka produktów i przyklejcie do nich ceny (1–10 zł).",
    "Dziecko jest sprzedawcą, rodzic klientem — i odwrotnie.",
    "Płaćcie „monetami” z papieru i liczcie resztę.",
    "Dla starszych: dodajcie promocję „drugi produkt za pół ceny”.",
  ]],
  ["Litera tygodnia", "Szukamy słów na jedną literę.", "🔤", "Język", 15, [
    "Wylosujcie literę (np. M).",
    "W ciągu 3 minut wymieńcie jak najwięcej słów na tę literę.",
    "Znajdźcie w domu 3 przedmioty zaczynające się na tę literę.",
    "Ulepcie literę z plasteliny lub ułóżcie ją z kredek.",
  ]],
  ["Cień i światło", "Teatr cieni z latarką.", "🔦", "Nauka", 20, [
    "Zgaście światło i skierujcie latarkę na ścianę.",
    "Pokażcie dłońmi zwierzęta: psa, ptaka, królika.",
    "Sprawdźcie: co się dzieje z cieniem, gdy latarka jest bliżej, a co gdy dalej?",
    "Odegrajcie krótką scenkę z cieniami.",
  ]],
  ["Pomocne ręce", "Planujemy dobry uczynek.", "🤝", "Emocje", 15, [
    "Porozmawiajcie, komu można dziś pomóc (sąsiad, babcia, kolega).",
    "Wybierzcie jedną małą rzecz i zróbcie ją jeszcze dziś.",
    "Narysujcie, jak się czuła osoba, której pomogliście.",
  ]],
  ["Budowniczy mostów", "Most z papieru, który utrzyma monety.", "🌉", "Nauka", 25, [
    "Połóżcie kartkę papieru między dwiema książkami jak most.",
    "Ile monet utrzyma płaska kartka?",
    "Złóżcie kartkę w harmonijkę i sprawdźcie ponownie.",
    "Porozmawiajcie, dlaczego kształt ma znaczenie.",
  ]],
  ["Wielki finał tygodnia", "Pokaz talentów dla rodziny.", "🎉", "Zabawa", 20, [
    "Wybierzcie ulubioną aktywność z tego tygodnia.",
    "Przygotujcie krótki pokaz dla reszty rodziny.",
    "Wręczcie sobie nawzajem dyplomy (narysowane!).",
  ]],
];

for (const [i, [title, summary, emoji, category, minutes, steps]] of days.entries()) {
  const number = i + 1;
  const data = { title, summary, emoji, category, minutes, body: steps.join("\n"), isFree: number <= 3 };
  await db.day.upsert({ where: { number }, update: data, create: { number, ...data } });
}

const email = process.env.ADMIN_EMAIL || "admin@demo.local";
const pw = process.env.ADMIN_PASSWORD;
if (pw) {
  await db.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: {
      email,
      name: "Administrator",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(pw, 10),
      consentAt: new Date(),
    },
  });
  console.log(`Admin: ${email} (password is ADMIN_PASSWORD in .env)`);
}
console.log(`Seeded ${days.length} days.`);
await db.$disconnect();
