import { useState, useEffect } from 'react';

interface Make {
  id: string;
  name: string;
  slug: string;
}

export function useMakes() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/makes')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch makes');
        return res.json();
      })
      .then((data) => setMakes(data.makes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { makes, loading, error };
}