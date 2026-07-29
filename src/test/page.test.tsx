import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

vi.mock('@/hooks/useMakes');
vi.mock('@/hooks/useModels');
vi.mock('@/hooks/useEngines');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { useMakes } from '@/hooks/useMakes';
import { useModels } from '@/hooks/useModels';
import { useEngines } from '@/hooks/useEngines';

describe('Home page', () => {
  beforeEach(() => {
    (useMakes as any).mockReturnValue({
      makes: [{ id: '1', name: 'BMW', slug: 'bmw' }],
      loading: false,
      error: null,
    });
    (useModels as any).mockReturnValue({ models: [], loading: false, error: null });
    (useEngines as any).mockReturnValue({ engines: [], loading: false, error: null });
  });

  it('renders the brand combobox and opens to show BMW', async () => {
    render(<Home />);

    const brandButton = screen.getByRole('button', { name: /select brand/i });
    expect(brandButton).toBeInTheDocument();

    await userEvent.click(brandButton);

    await waitFor(() => {
      expect(screen.getByText('BMW')).toBeInTheDocument();
    });
  });
});