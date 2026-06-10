'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Activity, Search, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Procedure } from '@/types';
import { procedureService } from '@/features/procedures/services/procedure.service';
import { toast } from 'sonner';

interface ProcedureComboboxProps {
    procedures: Procedure[];
    value: string;
    onChange: (procedureId: string) => void;
    onProcedureCreated: (procedure: Procedure) => void;
}

export function ProcedureCombobox({ procedures, value, onChange, onProcedureCreated }: ProcedureComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createStep, setCreateStep] = useState<'idle' | 'details' | 'saving' | 'success'>('idle');
    const [newPrice, setNewPrice] = useState<string>('0');
    const [newDuration, setNewDuration] = useState<string>('30');
    const priceInputRef = useRef<HTMLInputElement>(null);

    const selectedProcedure = procedures.find(p => p.id === value);

    const filteredProcedures = useMemo(() => {
        if (!search) return procedures;
        const searchLower = search.toLowerCase();
        return procedures.filter(p =>
            p.name.toLowerCase().includes(searchLower)
        );
    }, [procedures, search]);

    const showCreateOption = search.length >= 2 &&
        !filteredProcedures.some(p => p.name.toLowerCase() === search.toLowerCase());

    const handleSelect = (procedureId: string) => {
        onChange(procedureId);
        setOpen(false);
        setSearch('');
        setIsCreating(false);
        setCreateStep('idle');
    };

    const handleStartCreate = () => {
        setIsCreating(true);
        setCreateStep('details');
        setTimeout(() => priceInputRef.current?.focus(), 100);
    };

    const handleCreate = async () => {
        if (!search) return;

        setCreateStep('saving');
        try {
            const price = parseFloat(newPrice) || 0;
            const duration = parseInt(newDuration) || 30;

            const newProc = await procedureService.create({
                name: search,
                defaultPrice: price,
                durationMinutes: duration,
            });
            setCreateStep('success');

            setTimeout(() => {
                onProcedureCreated(newProc);
                onChange(newProc.id);
                setOpen(false);
                setSearch('');
                setNewPrice('0');
                setNewDuration('30');
                setIsCreating(false);
                setCreateStep('idle');
            }, 800);
        } catch (error: any) {
            console.error('Error creating procedure:', error);
            toast.error(error.message || 'Erro ao cadastrar procedimento');
            setCreateStep('details');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && createStep === 'details') {
            e.preventDefault();
            handleCreate();
        }
    };

    useEffect(() => {
        if (!open) {
            setSearch('');
            setIsCreating(false);
            setCreateStep('idle');
            setNewPrice('0');
            setNewDuration('30');
        }
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal h-9"
                >
                    {selectedProcedure ? (
                        <span className="truncate flex items-center gap-2">
                            {selectedProcedure.name}
                            <span className="text-xs text-muted-foreground font-semibold">
                                (R$ {selectedProcedure.defaultPrice || 0})
                            </span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Buscar ou criar...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[420px] p-0" align="start">
                {/* Search Input */}
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Buscar procedimento ou digite para criar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                    {/* Results - show all when no search, filtered when searching */}
                    {filteredProcedures.length > 0 && !isCreating && (
                        <div className="p-1">
                            {!search && procedures.length > 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground border-b mb-1">
                                    Selecione um procedimento ou digite para buscar/criar
                                </div>
                            )}
                            {filteredProcedures.slice(0, 10).map((proc) => (
                                <button
                                    key={proc.id}
                                    onClick={() => handleSelect(proc.id)}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        value === proc.id && "bg-accent"
                                    )}
                                >
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{proc.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Preço: R$ {proc.defaultPrice || 0} | Duração: {proc.durationMinutes || 30} min
                                        </p>
                                    </div>
                                    {value === proc.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                            {filteredProcedures.length > 10 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                                    Digite para filtrar mais {filteredProcedures.length - 10} procedimentos...
                                </div>
                            )}
                        </div>
                    )}

                    {/* No results */}
                    {filteredProcedures.length === 0 && search && !isCreating && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Nenhum procedimento encontrado
                        </div>
                    )}

                    {/* Create Option */}
                    {showCreateOption && !isCreating && (
                        <div className="border-t p-1">
                            <button
                                onClick={handleStartCreate}
                                className="relative flex w-full cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-3 text-sm outline-none transition-colors hover:bg-violet-500/10 group"
                            >
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-violet-500/20 transition-colors">
                                    <Activity className="h-4 w-4 text-violet-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-violet-600 dark:text-violet-400">
                                        Criar "{search}"
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Novo procedimento
                                    </p>
                                </div>
                                <Sparkles className="h-4 w-4 text-violet-500/50" />
                            </button>
                        </div>
                    )}

                    {/* Create Form - Details Step */}
                    {isCreating && createStep === 'details' && (
                        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold">{search}</p>
                                    <p className="text-xs text-muted-foreground">Novo procedimento</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">Preço Padrão (R$)</Label>
                                    <Input
                                        ref={priceInputRef}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="0.00"
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Duração (min)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newDuration}
                                        onChange={(e) => setNewDuration(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="30"
                                        className="h-9"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setCreateStep('idle');
                                        setNewPrice('0');
                                        setNewDuration('30');
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleCreate}
                                    className="gap-1.5"
                                >
                                    <Check className="h-4 w-4" />
                                    Criar Procedimento
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Create Form - Saving */}
                    {isCreating && createStep === 'saving' && (
                        <div className="p-8 flex flex-col items-center justify-center animate-in fade-in duration-200">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
                            <p className="text-sm text-muted-foreground">Cadastrando...</p>
                        </div>
                    )}

                    {/* Create Form - Success */}
                    {isCreating && createStep === 'success' && (
                        <div className="p-8 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center mb-3">
                                <Check className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-semibold text-emerald-600">Procedimento criado!</p>
                            <p className="text-sm text-muted-foreground">{search}</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
