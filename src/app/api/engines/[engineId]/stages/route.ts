import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ engineId: string }> }
) {
  try {
    const { engineId } = await params;
    const engine = await prisma.engine.findUnique({
      where: { id: engineId },
      include: { stages: { orderBy: { stageNumber: 'asc' } } },
    });

    if (!engine) {
      return new NextResponse('Engine not found', { status: 404 });
    }

    if (engine.stages.length > 0) {
      return NextResponse.json({
        stockHp: engine.stockHp,
        stockTorque: engine.stockTorque,
        stages: engine.stages,
      });
    }

    const stages = generateFallbackStages(
      engine.stockHp,
      engine.stockTorque,
      engine.tuningType
    );

    return NextResponse.json({
      stockHp: engine.stockHp,
      stockTorque: engine.stockTorque,
      stages,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function generateFallbackStages(
  stockHp: number,
  stockTorque: number,
  tuningType: string | null
) {
  const multipliers: Record<string, number[]> = {
    TURBO: [0.2, 0.35, 0.55],
    SUPERCHARGED: [0.15, 0.3, 0.5],
    NA: [0.08, 0.15, 0.25],
    ELECTRIC: [0.05, 0.1, 0.18],
  };

  const gains = multipliers[tuningType ?? 'NA'] || [0.1, 0.2, 0.3];

  return gains.map((factor, index) => {
    const stageNum = index + 1;
    return {
      id: `calc-${stageNum}`,
      stageNumber: stageNum,
      requiredMods: getModsForStage(stageNum, tuningType),
      hpGain: Math.round(stockHp * factor),
      torqueGain: Math.round(stockTorque * factor),
      notes: null,
    };
  });
}

function getModsForStage(stage: number, tuningType: string | null): string {
  if (tuningType === 'ELECTRIC') {
    if (stage === 1) return 'Software optimization';
    if (stage === 2) return 'Inverter upgrade, cooling';
    return 'Motor and battery upgrade';
  }
  if (stage === 1) return 'ECU remap';
  if (stage === 2) return 'Downpipe, intake, intercooler';
  return 'Turbo upgrade, fueling, exhaust';
}