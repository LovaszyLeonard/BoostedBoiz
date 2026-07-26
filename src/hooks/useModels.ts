import { useState, useEffect } from 'react';

interface Model {
  id: string;
  name: string;
  slug: string;
  yearStart: number | null;
  yearEnd: number | null;
}

export function useModels(makeId: string | null) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!makeId) {
      setModels([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/makes/${makeId}/models`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch models');
        return res.json();
      })
      .then((data) => setModels(data.models))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [makeId]);

  return { models, loading, error };
}