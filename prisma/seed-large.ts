import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface Make {
  MakeId: number;
  MakeName: string;
}

interface Model {
  Model_ID: number;
  Model_Name: string;
}

async function main() {
  // Clear non-curated data? We want to keep existing curated entries. To simplify,
  // delete all non-curated (i.e., those without any stages) and re-add.
  // Or just ignore duplicates by using upsert. We'll do an incremental approach:
  // keep everything we already have and add new makes/models/engines.

  console.log('Fetching makes from NHTSA...');
  const { data: makesData } = await axios.get(
    'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json'
  );
  const makes: Make[] = makesData.Results;

  // Limit to a manageable subset – e.g., top 30 popular makes
  const popularMakes = [
    'FORD','CHEVROLET','TOYOTA','HONDA','NISSAN','JEEP','SUBARU',
    'VOLKSWAGEN','BMW','MERCEDES-BENZ','AUDI','LEXUS','MAZDA',
    'HYUNDAI','KIA','DODGE','CHRYSLER','RAM','GMC','CADILLAC',
    'INFINITI','ACURA','LINCOLN','BUICK','VOLVO','LAND ROVER',
    'PORSCHE','MINI','FIAT','MITSUBISHI'
  ];

  let processed = 0;
  for (const make of makes) {
    if (!popularMakes.includes(make.MakeName.toUpperCase())) continue;
    processed++;
    console.log(`Processing ${make.MakeName} (${processed}/${popularMakes.length})`);

    // Upsert the Make
    const slug = make.MakeName.toLowerCase().replace(/\s+/g, '-');
    const createdMake = await prisma.make.upsert({
      where: { slug },
      update: {},
      create: { name: make.MakeName, slug },
    });

    // Fetch models for this make
    try {
      const { data: modelsData } = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make.MakeName)}?format=json`
      );
      const models: Model[] = modelsData.Results;

      for (const model of models) {
        const modelSlug = model.Model_Name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        // Skip if model already exists (prevents duplicate engines)
        const existingModel = await prisma.model.findUnique({ where: { slug: modelSlug } });
        if (existingModel) continue;

        const createdModel = await prisma.model.create({
          data: {
            makeId: createdMake.id,
            name: model.Model_Name,
            slug: modelSlug,
            yearStart: null,
            yearEnd: null,
          },
        });

        // Generate an engine for this model using heuristics
        const engineCode = model.Model_Name.split(' ')[0] + '-GEN'; // crude
        const displacement = guessDisplacement(model.Model_Name);
        const stockHp = guessHorsepower(model.Model_Name, make.MakeName);
        const stockTorque = Math.round(stockHp * 0.9); // rough
        const tuningType = guessTuningType(model.Model_Name);

        await prisma.engine.create({
          data: {
            modelId: createdModel.id,
            code: engineCode,
            displacement,
            stockHp,
            stockTorque,
            tuningType,
          },
        });
      }
    } catch (err) {
      console.error(`Failed to fetch models for ${make.MakeName}:`, err);
    }

    // Rate limit: wait a bit to not hammer the API
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('Large seed completed!');
}

function guessDisplacement(modelName: string): string {
  const name = modelName.toLowerCase();
  if (name.includes('v8') || name.includes('5.0')) return '5.0L V8';
  if (name.includes('v6') || name.includes('3.5')) return '3.5L V6';
  if (name.includes('2.0') || name.includes('turbo')) return '2.0L Turbo';
  if (name.includes('1.5') || name.includes('1.6')) return '1.6L I4';
  if (name.includes('hybrid') || name.includes('electric')) return 'Electric';
  return '2.5L I4';
}

function guessHorsepower(modelName: string, make: string): number {
  const name = modelName.toLowerCase();
  const makeLower = make.toLowerCase();
  if (makeLower.includes('ford') && name.includes('mustang')) return 460;
  if (name.includes('rs') || name.includes('type r')) return 320;
  if (name.includes('m3') || name.includes('m4')) return 425;
  if (name.includes('amg')) return 400;
  if (name.includes('turbo') || name.includes('tfsi')) return 250;
  if (name.includes('hybrid')) return 200;
  if (name.includes('electric')) return 300;
  return 180; // default
}

function guessTuningType(modelName: string): string {
  const name = modelName.toLowerCase();
  if (name.includes('electric') || name.includes('ev')) return 'ELECTRIC';
  if (name.includes('turbo') || name.includes('tfsi') || name.includes('ecoboost') || name.includes('tdi')) return 'TURBO';
  if (name.includes('supercharged') || name.includes('kompressor')) return 'SUPERCHARGED';
  return 'NA';
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });