'use client';

import { useState } from 'react';
import { useMakes } from '@/hooks/useMakes';
import { useModels } from '@/hooks/useModels';
import { useEngines } from '@/hooks/useEngines';

interface Stage {
  id: string;
  stageNumber: number;
  requiredMods: string;
  hpGain: number;
  torqueGain: number;
  notes: string | null;
}

export default function Home() {
  const [selectedMakeId, setSelectedMakeId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedEngineId, setSelectedEngineId] = useState('');
  const [stageData, setStageData] = useState<{
    stockHp: number;
    stockTorque: number;
    stages: Stage[];
  } | null>(null);
  const [stagesLoading, setStagesLoading] = useState(false);

  const { makes, loading: makesLoading, error: makesError } = useMakes();
  const { models, loading: modelsLoading } = useModels(selectedMakeId || null);
  const { engines, loading: enginesLoading } = useEngines(selectedModelId || null);

  const fetchStages = async (engineId: string) => {
    setStagesLoading(true);
    try {
      const res = await fetch(`/api/engines/${engineId}/stages`);
      if (!res.ok) throw new Error('Failed to fetch stages');
      const data = await res.json();
      setStageData(data);
    } catch (err) {
      console.error(err);
      setStageData(null);
    } finally {
      setStagesLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-6 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-white">
        Tuning Stage Calculator
      </h1>

      <div className="flex flex-col gap-5 w-full max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Select Make
          </label>
          <select
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedMakeId}
            onChange={(e) => {
              setSelectedMakeId(e.target.value);
              setSelectedModelId('');
              setSelectedEngineId('');
              setStageData(null);
            }}
            disabled={makesLoading}
          >
            <option value="">-- Choose Make --</option>
            {makes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {makesLoading && <p className="text-sm text-gray-400 mt-1">Loading makes...</p>}
          {makesError && <p className="text-sm text-red-400 mt-1">Error: {makesError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Select Model
          </label>
          <select
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            value={selectedModelId}
            onChange={(e) => {
              setSelectedModelId(e.target.value);
              setSelectedEngineId('');
              setStageData(null);
            }}
            disabled={!selectedMakeId || modelsLoading}
          >
            <option value="">-- Choose Model --</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.yearStart && `(${m.yearStart}–${m.yearEnd ?? 'present'})`}
              </option>
            ))}
          </select>
          {modelsLoading && <p className="text-sm text-gray-400 mt-1">Loading models...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Select Engine
          </label>
          <select
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            value={selectedEngineId}
            onChange={(e) => {
              setSelectedEngineId(e.target.value);
              if (e.target.value) {
                fetchStages(e.target.value);
              } else {
                setStageData(null);
              }
            }}
            disabled={!selectedModelId || enginesLoading}
          >
            <option value="">-- Choose Engine --</option>
            {engines.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.code} ({eng.displacement}) – {eng.stockHp} HP
              </option>
            ))}
          </select>
          {enginesLoading && <p className="text-sm text-gray-400 mt-1">Loading engines...</p>}
        </div>
      </div>

      {stagesLoading && (
        <p className="mt-10 text-gray-400">Loading tuning stages...</p>
      )}

      {stageData && !stagesLoading && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {stageData.stages.map((stage) => (
            <div
              key={stage.id}
              className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold text-white mb-2">
                Stage {stage.stageNumber}
              </h2>
              <p className="text-sm text-gray-300 mb-4">{stage.requiredMods}</p>
              <div className="space-y-1.5">
                <p className="text-white">
                  <span className="font-bold text-lg">
                    {stageData.stockHp + stage.hpGain} HP
                  </span>{' '}
                  <span className="text-green-400 text-sm">+{stage.hpGain}</span>
                </p>
                <p className="text-white">
                  <span className="font-bold text-lg">
                    {stageData.stockTorque + stage.torqueGain} lb‑ft
                  </span>{' '}
                  <span className="text-green-400 text-sm">+{stage.torqueGain}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}