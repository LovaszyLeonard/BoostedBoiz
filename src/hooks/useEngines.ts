import { useState, useEffect } from 'react';

interface Engine {
  id: string;
  code: string;
  displacement: string;
  stockHp: number;
  stockTorque: number;
  tuningType: string | null;
}

export function useEngines(modelId: string | null) {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) {
      setEngines([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/models/${modelId}/engines`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch engines');
        return res.json();
      })
      .then((data) => setEngines(data.engines))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [modelId]);

  return { engines, loading, error };
}