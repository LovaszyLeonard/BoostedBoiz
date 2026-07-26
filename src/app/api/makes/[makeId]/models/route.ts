import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ makeId: string }> }
) {
  try {
    const { makeId } = await params;
    const models = await prisma.model.findMany({
      where: { makeId },
      select: {
        id: true,
        name: true,
        slug: true,
        yearStart: true,
        yearEnd: true,
      },
      orderBy: { name: 'asc' },
    });

    if (models.length === 0) {
      return new NextResponse('No models found for this make', { status: 404 });
    }

    return NextResponse.json({ models });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}