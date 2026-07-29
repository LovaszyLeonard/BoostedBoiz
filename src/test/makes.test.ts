import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/makes/route';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    make: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('GET /api/makes', () => {
  it('returns a list of makes', async () => {
    const mockMakes = [
      { id: '1', name: 'BMW', slug: 'bmw' },
      { id: '2', name: 'Audi', slug: 'audi' },
    ];
    (prisma.make.findMany as any).mockResolvedValue(mockMakes);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.makes).toEqual(mockMakes);
  });

  it('returns 500 on database error', async () => {
    (prisma.make.findMany as any).mockRejectedValue(new Error('DB error'));

    const response = await GET();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe('Internal Server Error');
  });
});