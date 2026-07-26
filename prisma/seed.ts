import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.tuningStage.deleteMany();
  await prisma.engine.deleteMany();
  await prisma.model.deleteMany();
  await prisma.make.deleteMany();

  const data = [
    {
      slug: 'volkswagen',
      name: 'Volkswagen',
      models: [
        {
          slug: 'golf-gti-mk7',
          name: 'Golf GTI Mk7',
          yearStart: 2013,
          yearEnd: 2020,
          engines: [
            {
              code: 'EA888 Gen 3',
              displacement: '2.0L Turbo',
              stockHp: 220,
              stockTorque: 258,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 45, torqueGain: 50 },
                { stageNumber: 2, requiredMods: 'Downpipe, intercooler, intake', hpGain: 75, torqueGain: 80 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling', hpGain: 120, torqueGain: 110 },
              ],
            },
            {
              code: 'EA288',
              displacement: '2.0L TDI',
              stockHp: 150,
              stockTorque: 236,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 30, torqueGain: 50 },
                { stageNumber: 2, requiredMods: 'Downpipe, DPF delete', hpGain: 50, torqueGain: 75 },
              ],
            },
          ],
        },
        {
          slug: 'golf-r-mk7',
          name: 'Golf R Mk7',
          yearStart: 2014,
          yearEnd: 2020,
          engines: [
            {
              code: 'EA888 Gen 3 (R)',
              displacement: '2.0L Turbo',
              stockHp: 292,
              stockTorque: 280,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 55, torqueGain: 60 },
                { stageNumber: 2, requiredMods: 'Downpipe, intercooler, intake', hpGain: 90, torqueGain: 100 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling', hpGain: 150, torqueGain: 140 },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'bmw',
      name: 'BMW',
      models: [
        {
          slug: 'm3-f80',
          name: 'M3 (F80)',
          yearStart: 2014,
          yearEnd: 2018,
          engines: [
            {
              code: 'S55B30',
              displacement: '3.0L Twin-Turbo',
              stockHp: 425,
              stockTorque: 406,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 60, torqueGain: 70 },
                { stageNumber: 2, requiredMods: 'Downpipes, intake, charge pipes', hpGain: 100, torqueGain: 120 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling, exhaust', hpGain: 200, torqueGain: 180 },
              ],
            },
          ],
        },
        {
          slug: 'm340i-g20',
          name: 'M340i (G20)',
          yearStart: 2019,
          yearEnd: 2025,
          engines: [
            {
              code: 'B58B30',
              displacement: '3.0L Turbo',
              stockHp: 382,
              stockTorque: 369,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 50, torqueGain: 55 },
                { stageNumber: 2, requiredMods: 'Downpipe, intake', hpGain: 85, torqueGain: 100 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling', hpGain: 160, torqueGain: 150 },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'audi',
      name: 'Audi',
      models: [
        {
          slug: 'rs3-8v',
          name: 'RS3 (8V)',
          yearStart: 2015,
          yearEnd: 2020,
          engines: [
            {
              code: '2.5 TFSI',
              displacement: '2.5L Turbo',
              stockHp: 400,
              stockTorque: 354,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 50, torqueGain: 60 },
                { stageNumber: 2, requiredMods: 'Downpipe, intercooler, intake', hpGain: 90, torqueGain: 100 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling', hpGain: 180, torqueGain: 160 },
              ],
            },
          ],
        },
        {
          slug: 's3-8v',
          name: 'S3 (8V)',
          yearStart: 2013,
          yearEnd: 2020,
          engines: [
            {
              code: 'EA888 Gen 3',
              displacement: '2.0L Turbo',
              stockHp: 300,
              stockTorque: 280,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 55, torqueGain: 60 },
                { stageNumber: 2, requiredMods: 'Downpipe, intercooler, intake', hpGain: 90, torqueGain: 100 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling', hpGain: 150, torqueGain: 140 },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'ford',
      name: 'Ford',
      models: [
        {
          slug: 'mustang-gt-s550',
          name: 'Mustang GT (S550)',
          yearStart: 2015,
          yearEnd: 2023,
          engines: [
            {
              code: '5.0L Coyote',
              displacement: '5.0L V8',
              stockHp: 460,
              stockTorque: 420,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 25, torqueGain: 30 },
                { stageNumber: 2, requiredMods: 'Cold air intake, exhaust, tune', hpGain: 50, torqueGain: 45 },
                { stageNumber: 3, requiredMods: 'Supercharger kit, fueling', hpGain: 200, torqueGain: 180 },
              ],
            },
          ],
        },
        {
          slug: 'focus-rs-mk3',
          name: 'Focus RS Mk3',
          yearStart: 2016,
          yearEnd: 2018,
          engines: [
            {
              code: '2.3L EcoBoost',
              displacement: '2.3L Turbo',
              stockHp: 350,
              stockTorque: 350,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 40, torqueGain: 50 },
                { stageNumber: 2, requiredMods: 'Intercooler, downpipe, intake', hpGain: 75, torqueGain: 80 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling', hpGain: 130, torqueGain: 120 },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'toyota',
      name: 'Toyota',
      models: [
        {
          slug: 'gr-supra-a90',
          name: 'GR Supra (A90)',
          yearStart: 2019,
          yearEnd: 2025,
          engines: [
            {
              code: 'B58B30',
              displacement: '3.0L Turbo',
              stockHp: 382,
              stockTorque: 369,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 50, torqueGain: 55 },
                { stageNumber: 2, requiredMods: 'Downpipe, intake', hpGain: 85, torqueGain: 100 },
                { stageNumber: 3, requiredMods: 'Turbo upgrade, fueling', hpGain: 160, torqueGain: 150 },
              ],
            },
          ],
        },
        {
          slug: 'gr-yaris',
          name: 'GR Yaris',
          yearStart: 2020,
          yearEnd: 2025,
          engines: [
            {
              code: 'G16E-GTS',
              displacement: '1.6L Turbo',
              stockHp: 261,
              stockTorque: 266,
              stages: [
                { stageNumber: 1, requiredMods: 'ECU remap', hpGain: 40, torqueGain: 45 },
                { stageNumber: 2, requiredMods: 'Downpipe, intake, intercooler', hpGain: 70, torqueGain: 75 },
              ],
            },
          ],
        },
      ],
    },
  ];

  for (const make of data) {
    const createdMake = await prisma.make.create({
      data: {
        slug: make.slug,
        name: make.name,
      },
    });

    for (const model of make.models) {
      const createdModel = await prisma.model.create({
        data: {
          makeId: createdMake.id,
          slug: model.slug,
          name: model.name,
          yearStart: model.yearStart,
          yearEnd: model.yearEnd,
        },
      });

      for (const engine of model.engines) {
        const { stages, ...engineData } = engine;
        const createdEngine = await prisma.engine.create({
          data: {
            modelId: createdModel.id,
            ...engineData,
          },
        });

        for (const stage of stages) {
          await prisma.tuningStage.create({
            data: {
              engineId: createdEngine.id,
              ...stage,
            },
          });
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });