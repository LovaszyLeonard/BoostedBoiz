import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const { modelId } = await params;
    const engines = await prisma.engine.findMany({
      where: { modelId },
      select: {
        id: true,
        code: true,
        displacement: true,
        stockHp: true,
        stockTorque: true,
        tuningType: true,
      },
      orderBy: { code: 'asc' },
    });

    if (engines.length === 0) {
      return new NextResponse('No engines found for this model', { status: 404 });
    }

    return NextResponse.json({ engines });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}