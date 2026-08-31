import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const FIRST_NAMES = [
  "Karim", "Nadim", "Charbel", "Elie", "Georges", "Fadi", "Hadi", "Ziad", "Jad", "Toufic",
  "Rami", "Tariq", "Anthony", "Bassam", "Alain", "Naji", "Sami", "Walid", "Patrick", "Maher",
  "Rabih", "Wael", "Maroun", "Joseph", "Omar", "Layla", "Nour", "Maya", "Rita", "Yasmine",
  "Rania", "Zeina", "Lea", "Dalia", "Maria", "Cynthia", "Celine", "Christina", "Yara", "Sarah",
  "Samar", "Rana", "Mona", "Perla", "Lynn", "Nathalie", "Joelle", "Reem", "Lara", "Tania"
];

const LAST_NAMES = [
  "El-Khoury", "Haddad", "Sleiman", "Geagea", "Chaaban", "Gemayel", "Ghanem", "Kassab",
  "Abou Jaoude", "Chehab", "Rahme", "Nassar", "Karam", "Harb", "Saab", "Matar",
  "Najjar", "Bitar", "Wakim", "Helou", "Dagher", "Kanaan", "Frem", "Saliba",
  "Azar", "Boutros", "Sfeir", "Chahine", "Makhlouf", "Abi Nader", "Tannous", "Douaihy",
  "Chidiac", "Moukarzel", "Massaad", "Zgheib", "Eid", "Khoury", "Mansour", "Aoun"
];

const PATIENT_NOTES = [
  "No known drug allergies. Medical history clear.",
  "Prefers morning appointments.",
  "Slight dental anxiety; responds well to gentle care.",
  "Penicillin allergy noted.",
  "Hypertension managed with medication.",
  "Regular visitor every 6 months.",
  "Referred by Dr. El-Khoury.",
  "Requires pediatric-style soft touch.",
  "Smoker; advised on periodontal risk.",
  "Diabetic (Type 2); careful monitoring required.",
  null,
];

const TREATMENT_TEMPLATES = [
  {
    type: "Routine Cleaning & Polishing",
    diagnosis: "Mild plaque buildup and superficial staining",
    notes: "Full mouth supragingival scaling and fluoridation.",
    minPayment: 50,
    maxPayment: 100,
  },
  {
    type: "Root Canal Therapy",
    diagnosis: "Irreversible pulpitis on tooth #16",
    notes: "Canal instrumented, disinfected, and obturated with Gutta-percha.",
    minPayment: 300,
    maxPayment: 600,
  },
  {
    type: "Composite Filling",
    diagnosis: "Class II occlusal caries on tooth #24",
    notes: "Caries excavated, bonded with shade A2 composite resin.",
    minPayment: 80,
    maxPayment: 180,
  },
  {
    type: "Teeth Whitening",
    diagnosis: "Moderate enamel staining",
    notes: "In-office hydrogen peroxide gel application with LED light.",
    minPayment: 200,
    maxPayment: 400,
  },
  {
    type: "Tooth Extraction",
    diagnosis: "Severely decayed & non-restorable tooth #38",
    notes: "Simple extraction under local anesthesia. Post-op instructions given.",
    minPayment: 100,
    maxPayment: 250,
  },
  {
    type: "Porcelain-Fused Crown",
    diagnosis: "Extensive structure loss on tooth #14",
    notes: "Tooth prepared, impression taken, temporary crown placed.",
    minPayment: 350,
    maxPayment: 700,
  },
  {
    type: "Orthodontic Adjustment",
    diagnosis: "Malocclusion alignment progression",
    notes: "Arch wire replaced and power chain renewed.",
    minPayment: 100,
    maxPayment: 200,
  },
  {
    type: "Deep Periodontal Scaling",
    diagnosis: "Generalized chronic gingivitis",
    notes: "Subgingival scaling and root planing per quadrant.",
    minPayment: 150,
    maxPayment: 300,
  },
  {
    type: "Dental Implant Consultation",
    diagnosis: "Edentulous space at site #36",
    notes: "CBCT scan reviewed, surgical guide planned.",
    minPayment: 500,
    maxPayment: 1200,
  },
  {
    type: "Night Guard Delivery",
    diagnosis: "Severe nocturnal bruxism & attrition",
    notes: "Custom clear occlusal guard fitted and adjusted.",
    minPayment: 120,
    maxPayment: 250,
  },
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startYear = 1960, endYear = 2005) {
  const year = getRandomInt(startYear, endYear);
  const month = getRandomInt(0, 11);
  const day = getRandomInt(1, 28);
  return new Date(year, month, day);
}

function getRandomTreatmentDate() {
  const now = new Date();
  const daysAgo = getRandomInt(1, 365);
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Starting seed process for remote database...");

  // Clean existing records
  await prisma.treatment.deleteMany();
  await prisma.patient.deleteMany();

  const createdPatientsCount = 50;


  for (let i = 0; i < createdPatientsCount; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = getRandomElement(LAST_NAMES);
    const birthDate = getRandomDate();
    const notes = getRandomElement(PATIENT_NOTES);

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        birthDate,
        notes,
      },
    });

    // 1 to 4 treatments per patient
    const treatmentCount = getRandomInt(1, 4);

    // Most patients (~75%) have exactly 1 active treatment; others have 0 or 2
    const roll = Math.random();
    let targetActiveCount = 1;
    if (roll < 0.15) {
      targetActiveCount = 0;
    } else if (roll > 0.88 && treatmentCount >= 2) {
      targetActiveCount = 2;
    }

    for (let t = 0; t < treatmentCount; t++) {
      const template = getRandomElement(TREATMENT_TEMPLATES);
      const totalPayment = getRandomInt(template.minPayment, template.maxPayment);

      // Determine payment status: ~60% fully paid, ~40% partial or unpaid
      const isFullyPaid = Math.random() < 0.6;
      let totalPayed = totalPayment;

      if (!isFullyPaid) {
        const paymentRatios = [0, 0.25, 0.5, 0.75];
        const ratio = getRandomElement(paymentRatios);
        totalPayed = Math.floor(totalPayment * ratio);
      }

      // Mark the first targetActiveCount treatments as active, remaining as completed
      const isActive = t < targetActiveCount;

      await prisma.treatment.create({
        data: {
          patientId: patient.id,
          type: template.type,
          diagnosis: template.diagnosis,
          notes: template.notes,
          date: getRandomTreatmentDate(),
          totalPayment,
          totalPayed,
          isActive,
        },
      });
    }

  }

  console.log(`Successfully seeded ${createdPatientsCount} patients with realistic Lebanese names and treatments!`);
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
