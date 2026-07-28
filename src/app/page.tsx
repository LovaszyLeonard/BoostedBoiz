'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMakes } from '@/hooks/useMakes';
import { useModels } from '@/hooks/useModels';
import { useEngines } from '@/hooks/useEngines';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Check,
  ChevronsUpDown,
  ArrowUpRight,
  Zap,
  Flame,
  ShieldAlert,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stage {
  id: string;
  stageNumber: number;
  requiredMods: string;
  hpGain: number;
  torqueGain: number;
  notes: string | null;
}

interface Model {
  id: string;
  name: string;
  yearStart?: number | null;
  yearEnd?: number | null;
  slug: string;
}

interface ComboboxOption {
  id: string;
  label: string;
  searchValue: string;
}

// Gracefully format model names without a dangling "(?-?)"
function formatModelName(model: Model) {
  if (model.yearStart && model.yearEnd) {
    return `${model.name} (${model.yearStart}–${model.yearEnd})`;
  }
  if (model.yearStart) {
    return `${model.name} (${model.yearStart}+)`;
  }
  return model.name;
}

// Shared combobox used for Brand / Model / Engine
function VehicleCombobox({
  label,
  placeholder,
  emptyMessage,
  options,
  selectedId,
  selectedLabel,
  onSelect,
  disabled,
  loading,
  open,
  onOpenChange,
}: {
  label: string;
  placeholder: string;
  emptyMessage: string;
  options: ComboboxOption[];
  selectedId: string;
  selectedLabel: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        aria-label={selectedLabel ? `${label}: ${selectedLabel}` : `Select ${label.toLowerCase()}`}
        className="w-full h-14 px-5 bg-black hover:bg-zinc-900 border border-zinc-900 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] flex items-center justify-between text-left transition-all duration-300 group disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
      >
        <span
          className={cn(
            'font-racing text-sm font-black uppercase tracking-wider truncate',
            !selectedLabel ? 'text-zinc-600' : 'text-zinc-100'
          )}
        >
          {selectedLabel || label}
        </span>
        {loading ? (
          <Settings2 className="h-4 w-4 shrink-0 text-amber-500 animate-spin" aria-hidden="true" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-amber-500 transition-colors" aria-hidden="true" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-black border border-zinc-800 rounded-none shadow-2xl">
        <Command className="bg-transparent text-zinc-100">
          <CommandInput
            placeholder={placeholder}
            className="font-racing text-xs text-zinc-100 placeholder:text-zinc-600 border-b border-zinc-800 rounded-none uppercase"
          />
          <CommandList className="max-h-60 overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-amber-500">
            <CommandEmpty className="py-4 text-center font-racing text-xs text-zinc-600 uppercase">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.searchValue}
                  onSelect={() => onSelect(option.id)}
                  className="px-4 py-3 font-racing text-xs text-zinc-300 font-black uppercase tracking-wider cursor-pointer aria-selected:bg-amber-500 aria-selected:text-black hover:bg-zinc-900 transition-colors rounded-none"
                >
                  <Check
                    className={cn('mr-3 h-4 w-4 shrink-0', selectedId === option.id ? 'opacity-100 text-black' : 'opacity-0')}
                    aria-hidden="true"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedMakeId, setSelectedMakeId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [selectedEngineId, setSelectedEngineId] = useState<string>('');

  const [openMake, setOpenMake] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [openEngine, setOpenEngine] = useState(false);

  const [stageData, setStageData] = useState<{
    stockHp: number;
    stockTorque: number;
    stages: Stage[];
  } | null>(null);
  const [stagesLoading, setStagesLoading] = useState(false);

  // Bumped on every request so a slow, stale response can't clobber the
  // state for whatever engine the user has since selected.
  const stagesRequestId = useRef(0);

  const { makes, loading: makesLoading } = useMakes();
  const { models, loading: modelsLoading } = useModels(selectedMakeId || null);
  const { engines, loading: enginesLoading } = useEngines(selectedModelId || null);

  const fetchStages = useCallback(async (engineId: string) => {
    const requestId = ++stagesRequestId.current;
    setStagesLoading(true);
    try {
      const res = await fetch(`/api/engines/${engineId}/stages`);
      if (!res.ok) throw new Error('Failed to fetch stages');
      const data = await res.json();
      if (requestId === stagesRequestId.current) {
        setStageData(data);
      }
    } catch (err) {
      console.error(err);
      if (requestId === stagesRequestId.current) {
        setStageData(null);
      }
    } finally {
      if (requestId === stagesRequestId.current) {
        setStagesLoading(false);
      }
    }
  }, []);

  // Restore state from URL
  useEffect(() => {
    const makeSlug = searchParams.get('make');
    if (makeSlug && makes.length > 0) {
      const make = makes.find((m) => m.slug === makeSlug);
      if (make) setSelectedMakeId(make.id);
    }
  }, [makes, searchParams]);

  useEffect(() => {
    const modelSlug = searchParams.get('model');
    if (modelSlug && models.length > 0) {
      const model = models.find((m) => m.slug === modelSlug);
      if (model) setSelectedModelId(model.id);
    }
  }, [models, searchParams]);

  useEffect(() => {
    const engineSlug = searchParams.get('engine');
    if (engineSlug && engines.length > 0) {
      const engine = engines.find((e) => e.code === engineSlug);
      if (engine) {
        setSelectedEngineId(engine.id);
        fetchStages(engine.id);
      }
    }
  }, [engines, searchParams, fetchStages]);

  const updateURL = useCallback(
    (makeSlug?: string, modelSlug?: string, engineSlug?: string) => {
      const params = new URLSearchParams();
      if (makeSlug) params.set('make', makeSlug);
      if (modelSlug) params.set('model', modelSlug);
      if (engineSlug) params.set('engine', engineSlug);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleMakeSelect = (makeId: string) => {
    const make = makes.find((m) => m.id === makeId);
    setSelectedMakeId(makeId);
    setSelectedModelId('');
    setSelectedEngineId('');
    setStageData(null);
    setOpenMake(false);
    updateURL(make?.slug);
  };

  const handleModelSelect = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    const makeSlug = makes.find((m) => m.id === selectedMakeId)?.slug;
    setSelectedModelId(modelId);
    setSelectedEngineId('');
    setStageData(null);
    setOpenModel(false);
    updateURL(makeSlug, model?.slug);
  };

  const handleEngineSelect = (engineId: string) => {
    const engine = engines.find((e) => e.id === engineId);
    const makeSlug = makes.find((m) => m.id === selectedMakeId)?.slug;
    const modelSlug = models.find((m) => m.id === selectedModelId)?.slug;
    setSelectedEngineId(engineId);
    setOpenEngine(false);
    updateURL(makeSlug, modelSlug, engine?.code);
    fetchStages(engineId);
  };

  const handleReset = () => {
    stagesRequestId.current += 1;
    setSelectedMakeId('');
    setSelectedModelId('');
    setSelectedEngineId('');
    setStageData(null);
    router.replace('?', { scroll: false });
  };

  const selectedMake = makes.find((m) => m.id === selectedMakeId);
  const selectedModel = models.find((m) => m.id === selectedModelId);
  const selectedEngine = engines.find((e) => e.id === selectedEngineId);

  const maxHpGain = stageData?.stages.reduce((max, s) => Math.max(max, s.hpGain), 0) || 0;

  return (
    <main className="relative min-h-screen bg-black text-zinc-100 flex flex-col items-center p-4 sm:p-8 lg:p-12 overflow-hidden selection:bg-amber-500 selection:text-black">

      {/* Dynamic Carbon Grid Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-amber-600/10 via-orange-600/5 to-transparent blur-[100px]" />
        <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]" />
      </div>

      <div className="w-full max-w-6xl mx-auto space-y-10">

        {/* Title Header */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="transform -skew-x-12 bg-amber-500 px-8 py-2 border-b-4 border-amber-700 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <h1 className="font-racing text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none text-black drop-shadow-sm">
              boosted<span className="text-zinc-900">Boiz</span>
            </h1>
          </div>
        </div>

        {/* Selector Console */}
        <div className="p-1.5 bg-zinc-950 border border-zinc-800 shadow-2xl relative z-20">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

          {selectedMakeId && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute -top-3 right-4 font-racing text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-amber-500 bg-black px-2 py-0.5 border border-zinc-800 transition-colors z-10"
            >
              Reset
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <VehicleCombobox
              label="BRAND"
              placeholder="SEARCH BRAND..."
              emptyMessage="NO BRAND FOUND"
              options={makes.map((m) => ({ id: m.id, label: m.name, searchValue: m.name }))}
              selectedId={selectedMakeId}
              selectedLabel={selectedMake?.name ?? null}
              onSelect={handleMakeSelect}
              disabled={makesLoading}
              loading={makesLoading}
              open={openMake}
              onOpenChange={setOpenMake}
            />

            <VehicleCombobox
              label="MODEL"
              placeholder="SEARCH MODEL..."
              emptyMessage="NO MODEL FOUND"
              options={models.map((m) => ({ id: m.id, label: formatModelName(m), searchValue: m.name }))}
              selectedId={selectedModelId}
              selectedLabel={selectedModel ? formatModelName(selectedModel) : null}
              onSelect={handleModelSelect}
              disabled={!selectedMakeId || modelsLoading}
              loading={modelsLoading}
              open={openModel}
              onOpenChange={setOpenModel}
            />

            <VehicleCombobox
              label="ENGINE"
              placeholder="SEARCH ENGINE..."
              emptyMessage="NO ENGINE FOUND"
              options={engines.map((e) => ({
                id: e.id,
                label: `${e.code} (${e.displacement}) – ${e.stockHp} HP`,
                searchValue: `${e.code} ${e.displacement}`,
              }))}
              selectedId={selectedEngineId}
              selectedLabel={selectedEngine ? `${selectedEngine.code} (${selectedEngine.displacement})` : null}
              onSelect={handleEngineSelect}
              disabled={!selectedModelId || enginesLoading}
              loading={enginesLoading}
              open={openEngine}
              onOpenChange={setOpenEngine}
            />
          </div>
        </div>

        {/* HUD Telemetry Bar */}
        {selectedEngine && stageData && !stagesLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800 border border-zinc-800 animate-in fade-in duration-300">
            <div className="bg-black p-4 flex flex-col justify-center">
              <span className="font-racing text-[10px] font-black uppercase tracking-widest text-zinc-500">PLATFORM</span>
              <span className="font-racing text-xs font-black tracking-wide text-zinc-100 truncate mt-1">
                {selectedMake?.name} {selectedModel ? formatModelName(selectedModel) : ''}
              </span>
            </div>
            <div className="bg-black p-4 flex flex-col justify-center">
              <span className="font-racing text-[10px] font-black uppercase tracking-widest text-zinc-500">ENGINE CODE</span>
              <span className="font-racing text-xs font-black tracking-wide text-zinc-100 truncate mt-1">{selectedEngine.code}</span>
            </div>
            <div className="bg-black p-4 flex flex-col justify-center">
              <span className="font-racing text-[10px] font-black uppercase tracking-widest text-zinc-500">FACTORY SPEC</span>
              <span className="font-racing text-xs font-black tracking-wide text-zinc-400 mt-1 tabular-nums">
                {stageData.stockHp} HP / {stageData.stockTorque} TQ
              </span>
            </div>
            <div className="bg-black p-4 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
              <span className="font-racing text-[10px] font-black uppercase tracking-widest text-amber-500/80">PEAK POTENTIAL</span>
              <span className="font-racing text-sm font-black italic tracking-wider text-amber-400 flex items-center gap-1.5 mt-1 tabular-nums">
                <Flame className="w-4 h-4" aria-hidden="true" /> +{maxHpGain} HP
              </span>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {stagesLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-5" role="status" aria-live="polite">
            <Settings2 className="w-10 h-10 text-amber-500 animate-spin" aria-hidden="true" />
            <p className="font-racing text-xs font-black tracking-widest text-zinc-500 uppercase">CALIBRATING MAPS...</p>
          </div>
        )}

        {/* Stage Performance Cards */}
        {stageData && !stagesLoading && (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {stageData.stages.map((stage) => {
                const totalHp = stageData.stockHp + stage.hpGain;
                const totalTq = stageData.stockTorque + stage.torqueGain;
                const powerPercent = Math.min(100, Math.round((stage.hpGain / stageData.stockHp) * 100));
                const modsArray = stage.requiredMods ? stage.requiredMods.split(',').map((m) => m.trim()) : [];

                return (
                  <div
                    key={stage.id}
                    className="group relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 to-black border border-zinc-800 border-t-2 border-t-zinc-700 hover:border-t-amber-500 hover:shadow-[0_10px_40px_rgba(245,158,11,0.12)] transition-all duration-300 flex flex-col justify-between pt-6 mt-4"
                  >
                    {/* Stamped Stage Badge */}
                    <div className="absolute -top-5 left-4 transform -skew-x-12 bg-zinc-900 border border-zinc-700 group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors px-5 py-1.5 shadow-xl z-10">
                      <span className="font-racing text-sm font-black italic uppercase tracking-tighter text-zinc-300 group-hover:text-black flex items-center gap-1">
                        STAGE {stage.stageNumber} <Zap className="w-4 h-4 ml-1" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="space-y-6 p-6 pt-7">
                      
                      {/* Output Numbers Box */}
                      <div className="space-y-5">
                        
                        {/* HP Row */}
                        <div>
                          <span className="font-racing text-[10px] font-black tracking-widest text-zinc-500 block mb-1.5">ESTIMATED HP</span>
                          <div className="flex items-end justify-between gap-3 pb-1">
                            <span className="font-racing text-4xl font-black italic tracking-tighter text-white leading-none tabular-nums">
                              {totalHp} <span className="font-racing text-lg font-bold text-zinc-600 not-italic ml-1.5">HP</span>
                            </span>
                            <span className="font-racing text-sm font-black text-emerald-500 flex items-center tabular-nums mb-0.5">
                              <ArrowUpRight className="w-4 h-4 mr-1" aria-hidden="true" />+{stage.hpGain}
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-px bg-zinc-800/80 my-1" />

                        {/* Torque Row */}
                        <div>
                          <span className="font-racing text-[10px] font-black tracking-widest text-zinc-500 block mb-1.5">ESTIMATED TORQUE</span>
                          <div className="flex items-end justify-between gap-3 pb-1">
                            <span className="font-racing text-4xl font-black italic tracking-tighter text-zinc-300 leading-none tabular-nums">
                              {totalTq} <span className="font-racing text-lg font-bold text-zinc-600 not-italic ml-1.5">LB-FT</span>
                            </span>
                            <span className="font-racing text-sm font-black text-emerald-500 flex items-center tabular-nums mb-0.5">
                              <ArrowUpRight className="w-4 h-4 mr-1" aria-hidden="true" />+{stage.torqueGain}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Segmented Progress Bar */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between font-racing text-[10px] font-black tracking-widest text-zinc-500">
                          <span>BOOST LEVEL</span>
                          <span className="text-amber-500 tabular-nums">+{powerPercent}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-zinc-950 flex gap-0.5 border border-zinc-900 p-0.5">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-full flex-1 transform -skew-x-12 transition-colors duration-500',
                                i < powerPercent / 10 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-zinc-800/40'
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Hardware Prerequisite Tags */}
                      <div className="space-y-3 pt-4">
                        <span className="font-racing text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 border-l-2 border-amber-500 pl-2">
                          HARDWARE PREREQUISITES
                        </span>

                        {modsArray.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {modsArray.map((mod, i) => (
                              <span
                                key={i}
                                className="font-racing text-[10px] font-black uppercase tracking-wider text-black bg-zinc-300 px-2.5 py-1 flex items-center shadow-sm hover:bg-white transition-colors"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="font-racing text-[11px] text-zinc-500 bg-zinc-950 p-2.5 border border-zinc-900 uppercase">
                            &gt; NO HARDWARE REQUIRED (SOFTWARE MAP ONLY)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Warning Note Banner */}
                    {stage.notes && (
                      <div className="bg-amber-500/10 border-t border-amber-500/20 p-3.5 mt-auto flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="font-racing text-[10px] font-black uppercase tracking-wide text-amber-400/90 leading-relaxed">
                          {stage.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}