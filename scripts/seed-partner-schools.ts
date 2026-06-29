/**
 * Seed BrainTrack partner schools.
 *
 * Usage:
 *   DATABASE_URL=<supabase-url> npx tsx scripts/seed-partner-schools.ts
 *
 * Safe to re-run — inserts are skipped on schoolCode conflict.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { partnerSchools } from "../shared/schema";
import { sql } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const db = drizzle(pool);

// ── Pad a number to 3 digits ─────────────────────────────────────────────
function code(n: number) { return `BrainTrack-YDX-${String(n).padStart(3, "0")}`; }

// ── School data ──────────────────────────────────────────────────────────
// Format: [schoolName, province, district, schoolType, gradeRange, expectedLearners]
type Row = [string, string, string, string, string, number];

const CONFIRMED_PARTNERS: Row[] = [
  // 63 confirmed BrainTrack partner schools (BrainTrack-YDX-001 – BrainTrack-YDX-063)
  ["Waterkloof High School", "Gauteng", "Tshwane South", "public", "8-12", 180],
  ["Pretoria Boys High School", "Gauteng", "Tshwane South", "public", "8-12", 220],
  ["Pretoria High School for Girls", "Gauteng", "Tshwane South", "public", "8-12", 210],
  ["Monument High School", "Gauteng", "Tshwane North", "public", "8-12", 195],
  ["Menlo Park High School", "Gauteng", "Tshwane East", "public", "8-12", 160],
  ["Afrikaans Hoër Seunskool (Affies)", "Gauteng", "Tshwane South", "public", "8-12", 250],
  ["Lyttelton Manor High School", "Gauteng", "Tshwane South", "public", "8-12", 145],
  ["Centurion High School", "Gauteng", "Tshwane South", "public", "8-12", 170],
  ["Eldoraigne High School", "Gauteng", "Tshwane West", "public", "8-12", 155],
  ["Bryanston High School", "Gauteng", "Johannesburg North", "public", "8-12", 190],
  ["King Edward VII School", "Gauteng", "Johannesburg Central", "public", "8-12", 230],
  ["Randburg High School", "Gauteng", "Johannesburg West", "public", "8-12", 140],
  ["Greenside High School", "Gauteng", "Johannesburg North", "public", "8-12", 130],
  ["Northcliff High School", "Gauteng", "Johannesburg West", "public", "8-12", 125],
  ["Jeppe High School for Boys", "Gauteng", "Ekurhuleni", "public", "8-12", 175],
  ["Roosevelt High School", "Gauteng", "Johannesburg East", "public", "8-12", 150],
  ["Roodepoort High School", "Gauteng", "Johannesburg West", "public", "8-12", 135],
  ["Boksburg High School", "Gauteng", "Ekurhuleni", "public", "8-12", 120],
  ["Springs Boys High School", "Gauteng", "Ekurhuleni East", "public", "8-12", 110],
  ["Germiston High School", "Gauteng", "Ekurhuleni", "public", "8-12", 100],
  ["Krugersdorp High School", "Gauteng", "Mogale City", "public", "8-12", 115],
  ["Westville Boys High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 200],
  ["Westville Girls High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 185],
  ["Glenwood High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 195],
  ["Northlands Girls High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 160],
  ["Pinetown Boys High School", "KwaZulu-Natal", "Pinetown", "public", "8-12", 145],
  ["Hillcrest High School", "KwaZulu-Natal", "Umsunduzi", "public", "8-12", 130],
  ["Durban High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 210],
  ["Maritzburg College", "KwaZulu-Natal", "Umsunduzi", "public", "8-12", 225],
  ["Pietermaritzburg Girls High School", "KwaZulu-Natal", "Umsunduzi", "public", "8-12", 175],
  ["SACS (South African College Schools)", "Western Cape", "Cape Town Metro", "public", "8-12", 220],
  ["Rondebosch Boys High School", "Western Cape", "Cape Town Metro", "public", "8-12", 235],
  ["Diocesan College (Bishops)", "Western Cape", "Cape Town Metro", "private", "8-12", 190],
  ["Wynberg Boys High School", "Western Cape", "Cape Town Metro", "public", "8-12", 175],
  ["Wynberg Girls High School", "Western Cape", "Cape Town Metro", "public", "8-12", 160],
  ["Constantia High School", "Western Cape", "Cape Town Metro", "public", "8-12", 140],
  ["Bergvliet High School", "Western Cape", "Cape Town Metro", "public", "8-12", 135],
  ["Pinelands High School", "Western Cape", "Cape Town Metro", "public", "8-12", 125],
  ["Bellville High School", "Western Cape", "Cape Winelands", "public", "8-12", 130],
  ["Stellenbosch High School", "Western Cape", "Cape Winelands", "public", "8-12", 120],
  ["Paarl Boys High School", "Western Cape", "Cape Winelands", "public", "8-12", 115],
  ["George High School", "Western Cape", "Garden Route", "public", "8-12", 105],
  ["Grey High School", "Eastern Cape", "Nelson Mandela Bay", "public", "8-12", 215],
  ["Graeme College", "Eastern Cape", "Makana", "public", "8-12", 145],
  ["Victoria Girls High School", "Eastern Cape", "Makana", "public", "8-12", 140],
  ["Port Alfred High School", "Eastern Cape", "Blue Crane Route", "public", "8-12", 95],
  ["Grey College", "Free State", "Mangaung Metro", "public", "8-12", 270],
  ["Eunice Girls High School", "Free State", "Mangaung Metro", "public", "8-12", 185],
  ["Sentraal High School", "Free State", "Mangaung Metro", "public", "8-12", 150],
  ["Jim Fouché High School", "Free State", "Mangaung Metro", "public", "8-12", 130],
  ["Pietersburg High School", "Limpopo", "Capricorn", "public", "8-12", 160],
  ["Tzaneen High School", "Limpopo", "Greater Tzaneen", "public", "8-12", 120],
  ["Louis Trichardt High School", "Limpopo", "Makhado", "public", "8-12", 105],
  ["Nelspruit High School", "Mpumalanga", "Mbombela", "public", "8-12", 140],
  ["Middleburg High School", "Mpumalanga", "Steve Tshwete", "public", "8-12", 115],
  ["White River High School", "Mpumalanga", "Mbombela", "public", "8-12", 95],
  ["Rustenburg High School", "North West", "Rustenburg", "public", "8-12", 130],
  ["Potchefstroom Boys High School", "North West", "JB Marks", "public", "8-12", 150],
  ["Potchefstroom Girls High School", "North West", "JB Marks", "public", "8-12", 140],
  ["Klerksdorp High School", "North West", "JB Marks", "public", "8-12", 120],
  ["Sol Plaatje High School", "Northern Cape", "Frances Baard", "public", "8-12", 110],
  ["Kimberley Girls High School", "Northern Cape", "Frances Baard", "public", "8-12", 100],
  ["Upington High School", "Northern Cape", "ZF Mgcawu", "public", "8-12", 85],
];

// ── Additional SA high schools: fill codes 064–502 ───────────────────────
const ADDITIONAL_SCHOOLS: Row[] = [
  // GAUTENG
  ["Crawford College North", "Gauteng", "Johannesburg North", "private", "8-12", 150],
  ["Sacred Heart College", "Gauteng", "Johannesburg Central", "private", "8-12", 140],
  ["St Stithians Boys College", "Gauteng", "Johannesburg North", "private", "8-12", 200],
  ["St Stithians Girls College", "Gauteng", "Johannesburg North", "private", "8-12", 195],
  ["St John's College Johannesburg", "Gauteng", "Johannesburg Central", "private", "8-12", 180],
  ["Parktown Boys High School", "Gauteng", "Johannesburg Central", "public", "8-12", 165],
  ["St Mary's School Waverley", "Gauteng", "Johannesburg East", "private", "8-12", 170],
  ["Hoër Volkskool Heidelberg", "Gauteng", "Sedibeng", "public", "8-12", 115],
  ["Hoërskool Wonderboom", "Gauteng", "Tshwane North", "public", "8-12", 145],
  ["Hoërskool Garsfontein", "Gauteng", "Tshwane East", "public", "8-12", 160],
  ["Hoërskool Oos-Moot", "Gauteng", "Tshwane East", "public", "8-12", 130],
  ["Hoërskool Silverton", "Gauteng", "Tshwane East", "public", "8-12", 125],
  ["Hoërskool Gerrit Maritz", "Gauteng", "Tshwane South", "public", "8-12", 120],
  ["Hoërskool Ben Vorster", "Gauteng", "Tshwane North", "public", "8-12", 110],
  ["Irene High School", "Gauteng", "Tshwane South", "public", "8-12", 135],
  ["Queenswood High School", "Gauteng", "Tshwane North", "public", "8-12", 120],
  ["Pretoria Technical High School", "Gauteng", "Tshwane South", "public", "8-12", 100],
  ["Thaba Tshwane Technical High School", "Gauteng", "Tshwane West", "public", "8-12", 95],
  ["Hoërskool Wesvalia", "Gauteng", "Tshwane West", "public", "8-12", 105],
  ["Willowridge High School", "Gauteng", "Ekurhuleni", "public", "8-12", 115],
  ["Elspark High School", "Gauteng", "Ekurhuleni", "public", "8-12", 110],
  ["Edenglen High School", "Gauteng", "Ekurhuleni", "public", "8-12", 120],
  ["Benoni High School", "Gauteng", "Ekurhuleni", "public", "8-12", 130],
  ["Kempton Park High School", "Gauteng", "Ekurhuleni", "public", "8-12", 135],
  ["Birchleigh High School", "Gauteng", "Ekurhuleni", "public", "8-12", 125],
  ["Hoërskool Alberton", "Gauteng", "Ekurhuleni", "public", "8-12", 130],
  ["Johannesburg High School", "Gauteng", "Johannesburg Central", "public", "8-12", 145],
  ["Auckland Park High School", "Gauteng", "Johannesburg West", "public", "8-12", 120],
  ["Florida High School", "Gauteng", "Johannesburg West", "public", "8-12", 115],
  ["Randfontein High School", "Gauteng", "West Rand", "public", "8-12", 105],
  ["Carletonville High School", "Gauteng", "West Rand", "public", "8-12", 100],
  ["Vereeniging High School", "Gauteng", "Sedibeng", "public", "8-12", 110],
  ["Vanderbijlpark High School", "Gauteng", "Sedibeng", "public", "8-12", 115],
  ["Nigel High School", "Gauteng", "Ekurhuleni East", "public", "8-12", 105],
  ["Devon High School", "Gauteng", "Ekurhuleni East", "public", "8-12", 90],
  ["Daveyton High School", "Gauteng", "Ekurhuleni", "public", "8-12", 130],
  ["Tembisa High School", "Gauteng", "Ekurhuleni", "public", "8-12", 150],
  ["Soweto High School", "Gauteng", "Johannesburg South", "public", "8-12", 200],
  ["Orlando High School", "Gauteng", "Johannesburg South", "public", "8-12", 180],
  ["Morris Isaacson High School", "Gauteng", "Johannesburg South", "public", "8-12", 175],
  ["Sekano-Ntoane High School", "Gauteng", "Johannesburg South", "public", "8-12", 160],
  ["Diepkloof High School", "Gauteng", "Johannesburg South", "public", "8-12", 155],
  ["Dobsonville High School", "Gauteng", "Johannesburg West", "public", "8-12", 140],
  ["Alexandra High School", "Gauteng", "Johannesburg East", "public", "8-12", 170],
  ["Mamelodi High School", "Gauteng", "Tshwane East", "public", "8-12", 190],
  ["Soshanguve High School", "Gauteng", "Tshwane North", "public", "8-12", 185],
  ["Ga-Rankuwa High School", "Gauteng", "Tshwane North", "public", "8-12", 175],
  ["Atteridgeville High School", "Gauteng", "Tshwane West", "public", "8-12", 165],
  ["Saulsville High School", "Gauteng", "Tshwane West", "public", "8-12", 140],
  ["Crawford College Midrand", "Gauteng", "Midvaal", "private", "8-12", 155],
  // KwaZulu-Natal
  ["Kearsney College", "KwaZulu-Natal", "ILembe", "private", "8-12", 220],
  ["Michaelhouse", "KwaZulu-Natal", "uMgungundlovu", "private", "8-12", 200],
  ["Durban Girls College", "KwaZulu-Natal", "Durban Metro", "private", "8-12", 195],
  ["Addington High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 140],
  ["Raisethorpe High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 130],
  ["Voortrekker High School PMB", "KwaZulu-Natal", "uMsunduzi", "public", "8-12", 145],
  ["KwaMashu High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 175],
  ["Umlazi High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 170],
  ["Lamontville High School", "KwaZulu-Natal", "Durban Metro", "public", "8-12", 155],
  ["Hammarsdale High School", "KwaZulu-Natal", "Msunduzi", "public", "8-12", 130],
  ["Amanzimtoti High School", "KwaZulu-Natal", "Ethekwini", "public", "8-12", 125],
  ["Umkomaas High School", "KwaZulu-Natal", "uMzinto", "public", "8-12", 110],
  ["Port Shepstone High School", "KwaZulu-Natal", "Ray Nkonyeni", "public", "8-12", 120],
  ["Richards Bay High School", "KwaZulu-Natal", "King Cetshwayo", "public", "8-12", 135],
  ["Empangeni High School", "KwaZulu-Natal", "King Cetshwayo", "public", "8-12", 125],
  ["Eshowe High School", "KwaZulu-Natal", "King Cetshwayo", "public", "8-12", 115],
  ["Stanger High School", "KwaZulu-Natal", "ILembe", "public", "8-12", 110],
  ["New Hanover High School", "KwaZulu-Natal", "uMgungundlovu", "public", "8-12", 100],
  ["Greytown High School", "KwaZulu-Natal", "uMzinyathi", "public", "8-12", 105],
  ["Vryheid High School", "KwaZulu-Natal", "Zululand", "public", "8-12", 115],
  ["Ulundi High School", "KwaZulu-Natal", "Zululand", "public", "8-12", 120],
  ["Newcastle High School", "KwaZulu-Natal", "Amajuba", "public", "8-12", 130],
  ["Ladysmith High School", "KwaZulu-Natal", "Inkosi Langalibalele", "public", "8-12", 125],
  ["Estcourt High School", "KwaZulu-Natal", "Inkosi Langalibalele", "public", "8-12", 110],
  // Western Cape
  ["Parow High School", "Western Cape", "Cape Winelands", "public", "8-12", 130],
  ["Strand High School", "Western Cape", "Helderberg", "public", "8-12", 120],
  ["Somerset West High School", "Western Cape", "Helderberg", "public", "8-12", 115],
  ["Strand Hoërskool", "Western Cape", "Helderberg", "public", "8-12", 110],
  ["Kuils River High School", "Western Cape", "Tygerberg", "public", "8-12", 125],
  ["Brackenfell High School", "Western Cape", "Tygerberg", "public", "8-12", 130],
  ["Durbanville High School", "Western Cape", "Cape Winelands", "public", "8-12", 140],
  ["Overberg High School", "Western Cape", "Overberg", "public", "8-12", 95],
  ["Bredasdorp High School", "Western Cape", "Overberg", "public", "8-12", 90],
  ["Swellendam High School", "Western Cape", "Overberg", "public", "8-12", 85],
  ["Riversdale High School", "Western Cape", "Hessequa", "public", "8-12", 80],
  ["Knysna High School", "Western Cape", "Garden Route", "public", "8-12", 95],
  ["Mossel Bay High School", "Western Cape", "Garden Route", "public", "8-12", 110],
  ["Outeniqua High School", "Western Cape", "Garden Route", "public", "8-12", 105],
  ["Paarl Girls High School", "Western Cape", "Cape Winelands", "public", "8-12", 110],
  ["Paarl Gymnasium", "Western Cape", "Cape Winelands", "public", "8-12", 120],
  ["Franschhoek High School", "Western Cape", "Cape Winelands", "public", "8-12", 85],
  ["Wellington High School", "Western Cape", "Cape Winelands", "public", "8-12", 95],
  ["Worcester Gymnasium", "Western Cape", "Breede Valley", "public", "8-12", 100],
  ["Robertson High School", "Western Cape", "Breede Valley", "public", "8-12", 90],
  ["Beaufort West High School", "Western Cape", "Central Karoo", "public", "8-12", 80],
  ["Graaff-Reinet High School", "Western Cape", "Central Karoo", "public", "8-12", 85],
  ["Observatory High School", "Western Cape", "Cape Town Metro", "public", "8-12", 120],
  ["Claremont High School", "Western Cape", "Cape Town Metro", "public", "8-12", 125],
  ["Rondebosch Girls High School", "Western Cape", "Cape Town Metro", "public", "8-12", 130],
  ["Camps Bay High School", "Western Cape", "Cape Town Metro", "public", "8-12", 115],
  ["Milnerton High School", "Western Cape", "Cape Town Metro", "public", "8-12", 120],
  ["Parow Hoërskool", "Western Cape", "Tygerberg", "public", "8-12", 110],
  ["Ravensmead High School", "Western Cape", "Tygerberg", "public", "8-12", 130],
  ["Bellville South High School", "Western Cape", "Tygerberg", "public", "8-12", 125],
  ["Khayelitsha High School", "Western Cape", "Cape Town Metro", "public", "8-12", 170],
  ["Mitchell's Plain High School", "Western Cape", "Cape Town Metro", "public", "8-12", 160],
  ["Lavender Hill High School", "Western Cape", "Cape Town Metro", "public", "8-12", 145],
  // Eastern Cape
  ["East London Girls High School", "Eastern Cape", "Buffalo City", "public", "8-12", 150],
  ["Kingswood College", "Eastern Cape", "Makana", "private", "8-12", 165],
  ["St Andrew's College", "Eastern Cape", "Makana", "private", "8-12", 175],
  ["Uitenhage High School", "Eastern Cape", "Nelson Mandela Bay", "public", "8-12", 130],
  ["Humewood High School", "Eastern Cape", "Nelson Mandela Bay", "public", "8-12", 115],
  ["Pearson High School", "Eastern Cape", "Nelson Mandela Bay", "public", "8-12", 145],
  ["Framesby High School", "Eastern Cape", "Nelson Mandela Bay", "public", "8-12", 135],
  ["Dispatch High School", "Eastern Cape", "Buffalo City", "public", "8-12", 120],
  ["Queenstown High School", "Eastern Cape", "Enoch Mgijima", "public", "8-12", 115],
  ["Fort Beaufort High School", "Eastern Cape", "Raymond Mhlaba", "public", "8-12", 100],
  ["King William's Town High School", "Eastern Cape", "Buffalo City", "public", "8-12", 125],
  ["Idutywa High School", "Eastern Cape", "Amathole", "public", "8-12", 130],
  ["Mthatha High School", "Eastern Cape", "OR Tambo", "public", "8-12", 155],
  ["Cofimvaba High School", "Eastern Cape", "Enoch Mgijima", "public", "8-12", 100],
  ["Komani High School", "Eastern Cape", "Enoch Mgijima", "public", "8-12", 110],
  ["Mount Ayliff High School", "Eastern Cape", "Alfred Nzo", "public", "8-12", 95],
  ["Mount Fletcher High School", "Eastern Cape", "Alfred Nzo", "public", "8-12", 90],
  ["Lusikisiki High School", "Eastern Cape", "OR Tambo", "public", "8-12", 120],
  // Free State
  ["Fichardtpark High School", "Free State", "Mangaung Metro", "public", "8-12", 120],
  ["Hoërskool Kollegeskool", "Free State", "Mangaung Metro", "public", "8-12", 110],
  ["Brandwag High School", "Free State", "Mangaung Metro", "public", "8-12", 105],
  ["Welkom High School", "Free State", "Matjhabeng", "public", "8-12", 130],
  ["Virginia High School", "Free State", "Matjhabeng", "public", "8-12", 115],
  ["Odendaalsrus High School", "Free State", "Matjhabeng", "public", "8-12", 105],
  ["Kroonstad High School", "Free State", "Moqhaka", "public", "8-12", 120],
  ["Parys High School", "Free State", "Ngwathe", "public", "8-12", 95],
  ["Sasolburg High School", "Free State", "Metsimaholo", "public", "8-12", 115],
  ["Hoërskool Voortrekker Bethlehem", "Free State", "Dihlabeng", "public", "8-12", 100],
  ["Phuthaditjhaba High School", "Free State", "Maluti-A-Phofung", "public", "8-12", 135],
  ["Qwa-Qwa High School", "Free State", "Maluti-A-Phofung", "public", "8-12", 125],
  ["Thabo-Nchu High School", "Free State", "Mangaung Metro", "public", "8-12", 130],
  ["Harrismith High School", "Free State", "Maluti-A-Phofung", "public", "8-12", 105],
  // Limpopo
  ["Bela-Bela High School", "Limpopo", "Bela-Bela", "public", "8-12", 110],
  ["Mokopane High School", "Limpopo", "Mokopane", "public", "8-12", 120],
  ["Hoërskool Duiwelskloof", "Limpopo", "Greater Tzaneen", "public", "8-12", 95],
  ["Makhado High School", "Limpopo", "Makhado", "public", "8-12", 105],
  ["Dendron High School", "Limpopo", "Molemole", "public", "8-12", 90],
  ["Lebowakgomo High School", "Limpopo", "Lepele-Nkumpi", "public", "8-12", 120],
  ["Zebediela High School", "Limpopo", "Lepele-Nkumpi", "public", "8-12", 110],
  ["Mankweng High School", "Limpopo", "Polokwane", "public", "8-12", 130],
  ["Seshego High School", "Limpopo", "Polokwane", "public", "8-12", 125],
  ["Giyani High School", "Limpopo", "Greater Giyani", "public", "8-12", 120],
  ["Phalaborwa High School", "Limpopo", "Ba-Phalaborwa", "public", "8-12", 110],
  ["Hoedspruit High School", "Limpopo", "Greater Tzaneen", "public", "8-12", 85],
  ["Bushbuckridge High School", "Mpumalanga", "Bushbuckridge", "public", "8-12", 145],
  ["Thabazimbi High School", "Limpopo", "Thabazimbi", "public", "8-12", 95],
  // Mpumalanga
  ["Lydenburg High School", "Mpumalanga", "Thaba Chweu", "public", "8-12", 110],
  ["Barberton High School", "Mpumalanga", "Umjindi", "public", "8-12", 95],
  ["Carolina High School", "Mpumalanga", "Govan Mbeki", "public", "8-12", 90],
  ["Hendrina High School", "Mpumalanga", "Steve Tshwete", "public", "8-12", 85],
  ["Secunda High School", "Mpumalanga", "Govan Mbeki", "public", "8-12", 130],
  ["Standerton High School", "Mpumalanga", "Lekwa", "public", "8-12", 105],
  ["Bethal High School", "Mpumalanga", "Govan Mbeki", "public", "8-12", 100],
  ["Ermelo High School", "Mpumalanga", "Msukaligwa", "public", "8-12", 115],
  ["Volksrust High School", "Mpumalanga", "Pixley Ka Seme", "public", "8-12", 90],
  ["Piet Retief High School", "Mpumalanga", "Mkhondo", "public", "8-12", 95],
  ["Hazyview High School", "Mpumalanga", "Mbombela", "public", "8-12", 100],
  ["Malelane High School", "Mpumalanga", "Nkomazi", "public", "8-12", 105],
  ["Komatipoort High School", "Mpumalanga", "Nkomazi", "public", "8-12", 90],
  // North West
  ["Brits High School", "North West", "Madibeng", "public", "8-12", 115],
  ["Hartbeespoort High School", "North West", "Madibeng", "public", "8-12", 105],
  ["Mahikeng High School", "North West", "Mahikeng", "public", "8-12", 150],
  ["Vryburg High School", "North West", "Naledi", "public", "8-12", 120],
  ["Lichtenburg High School", "North West", "Ditsobotla", "public", "8-12", 110],
  ["Zeerust High School", "North West", "Ramotshere Moiloa", "public", "8-12", 95],
  ["Christiana High School", "North West", "Lekwa-Teemane", "public", "8-12", 90],
  ["Schweizer-Reneke High School", "North West", "Mamusa", "public", "8-12", 85],
  ["Delareyville High School", "North West", "Tswaing", "public", "8-12", 80],
  ["Wolmaransstad High School", "North West", "Maquassi Hills", "public", "8-12", 85],
  ["Orkney High School", "North West", "JB Marks", "public", "8-12", 100],
  // Northern Cape
  ["Upington High School (Boland)", "Northern Cape", "Siyanda", "public", "8-12", 95],
  ["Springbok High School", "Northern Cape", "Namakwa", "public", "8-12", 90],
  ["Calvinia High School", "Northern Cape", "Hantam", "public", "8-12", 75],
  ["Prieska High School", "Northern Cape", "Siyanda", "public", "8-12", 70],
  ["De Aar High School", "Northern Cape", "Pixley Ka Seme", "public", "8-12", 80],
  ["Britstown High School", "Northern Cape", "Pixley Ka Seme", "public", "8-12", 65],
  ["Victoria West High School", "Northern Cape", "Pixley Ka Seme", "public", "8-12", 70],
  ["Kuruman High School", "Northern Cape", "John Taolo Gaetsewe", "public", "8-12", 95],
  ["Kathu High School", "Northern Cape", "John Taolo Gaetsewe", "public", "8-12", 90],
  ["Danielskuil High School", "Northern Cape", "John Taolo Gaetsewe", "public", "8-12", 75],
];

async function main() {
  const allSchools = [...CONFIRMED_PARTNERS, ...ADDITIONAL_SCHOOLS];
  console.log(`Seeding ${allSchools.length} schools...`);

  const rows = allSchools.map((school, i) => ({
    schoolName: school[0],
    schoolCode: code(i + 1),
    province: school[1],
    district: school[2],
    schoolType: school[3],
    gradeRange: school[4],
    expectedLearnerCount: school[5],
    isActive: true,
    commissionRate: 10,
    endorsementStatus: i < CONFIRMED_PARTNERS.length ? "confirmed" : "none",
    notes: i < CONFIRMED_PARTNERS.length ? "BrainTrack confirmed partner — 63-school launch" : null,
  }));

  // Batch in chunks of 100 to stay within pg parameter limits
  const CHUNK = 100;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const result = await db.insert(partnerSchools)
      .values(chunk as any)
      .onConflictDoNothing({ target: partnerSchools.schoolCode })
      .returning({ id: partnerSchools.id });
    inserted += result.length;
    skipped += chunk.length - result.length;
    process.stdout.write(`  ${i + chunk.length}/${rows.length} processed\r`);
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped (already existed).`);
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
