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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Check, ChevronsUpDown, Stethoscope, Search, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Doctor, DoctorFormData, DoctorType } from '@/types';
import { doctorService } from '@/features/doctors/services/doctor.service';

interface DoctorComboboxProps {
    doctors: Doctor[];
    value: string;
    onChange: (doctorId: string) => void;
    onDoctorCreated: (doctor: Doctor) => void;
}

// Formatador de telefone
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function DoctorCombobox({ doctors, value, onChange, onDoctorCreated }: DoctorComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createStep, setCreateStep] = useState<'idle' | 'details' | 'saving' | 'success'>('idle');
    const [newPhone, setNewPhone] = useState('');
    const [newType, setNewType] = useState<DoctorType>('temporary');
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedDoctor = doctors.find(d => d.id === value);

    const filteredDoctors = useMemo(() => {
        if (!search) return doctors;
        const searchLower = search.toLowerCase();
        return doctors.filter(d =>
            d.name.toLowerCase().includes(searchLower) ||
            d.phone.includes(search)
        );
    }, [doctors, search]);

    const showCreateOption = search.length >= 2 &&
        !filteredDoctors.some(d => d.name.toLowerCase() === search.toLowerCase());

    const handleSelect = (doctorId: string) => {
        onChange(doctorId);
        setOpen(false);
        setSearch('');
        setIsCreating(false);
        setCreateStep('idle');
    };

    const handleStartCreate = () => {
        setIsCreating(true);
        setCreateStep('details');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleCreate = async () => {
        if (!search || !newPhone) return;

        setCreateStep('saving');
        try {
            const newDoctor = await doctorService.create({
                name: search,
                phone: newPhone,
                type: newType,
            });
            setCreateStep('success');

            setTimeout(() => {
                onDoctorCreated(newDoctor);
                onChange(newDoctor.id);
                setOpen(false);
                setSearch('');
                setNewPhone('');
                setNewType('temporary');
                setIsCreating(false);
                setCreateStep('idle');
            }, 800);
        } catch (error) {
            console.error('Error creating doctor:', error);
            alert('Erro ao cadastrar médico');
            setCreateStep('details');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && createStep === 'details' && newPhone) {
            e.preventDefault();
            handleCreate();
        }
    };

    useEffect(() => {
        if (!open) {
            setSearch('');
            setIsCreating(false);
            setCreateStep('idle');
            setNewPhone('');
            setNewType('temporary');
        }
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {selectedDoctor ? (
                        <span className="truncate flex items-center gap-2">
                            {selectedDoctor.name}
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                selectedDoctor.type === 'fixed'
                                    ? "bg-emerald-500/20 text-emerald-600"
                                    : "bg-blue-500/20 text-blue-600"
                            )}>
                                {selectedDoctor.type === 'fixed' ? 'Fixo' : 'Avulso'}
                            </span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Buscar ou criar médico...</span>
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
                        placeholder="Buscar ou digite para criar novo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                    {/* Results - show all when no search, filtered when searching */}
                    {filteredDoctors.length > 0 && !isCreating && (
                        <div className="p-1">
                            {/* Show hint when no search */}
                            {!search && doctors.length > 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground border-b mb-1">
                                    Selecione um médico ou digite para buscar/criar
                                </div>
                            )}
                            {filteredDoctors.slice(0, 10).map((doctor) => (
                                <button
                                    key={doctor.id}
                                    onClick={() => handleSelect(doctor.id)}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        value === doctor.id && "bg-accent"
                                    )}
                                >
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{doctor.name}</p>
                                            <span className={cn(
                                                "text-xs px-1.5 py-0.5 rounded",
                                                doctor.type === 'fixed'
                                                    ? "bg-emerald-500/20 text-emerald-600"
                                                    : "bg-blue-500/20 text-blue-600"
                                            )}>
                                                {doctor.type === 'fixed' ? 'Fixo' : 'Avulso'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{doctor.phone}</p>
                                    </div>
                                    {value === doctor.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                            {filteredDoctors.length > 10 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                                    Digite para filtrar mais {filteredDoctors.length - 10} médicos...
                                </div>
                            )}
                        </div>
                    )}

                    {/* No results */}
                    {filteredDoctors.length === 0 && search && !isCreating && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Nenhum médico encontrado
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
                                    <Stethoscope className="h-4 w-4 text-violet-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-violet-600 dark:text-violet-400">
                                        Criar "{search}"
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Novo médico
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
                                    <Stethoscope className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold">{search}</p>
                                    <p className="text-xs text-muted-foreground">Novo médico</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">Telefone</Label>
                                    <Input
                                        ref={inputRef}
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(formatPhone(e.target.value))}
                                        onKeyDown={handleKeyDown}
                                        placeholder="(00) 00000-0000"
                                        className="h-9"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Tipo</Label>
                                    <Select value={newType} onValueChange={(v: DoctorType) => setNewType(v)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">Fixo</SelectItem>
                                            <SelectItem value="temporary">Avulso</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        setNewPhone('');
                                        setNewType('temporary');
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={!newPhone || newPhone.length < 14}
                                    onClick={handleCreate}
                                    className="gap-1.5"
                                >
                                    <Check className="h-4 w-4" />
                                    Criar Médico
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
                            <p className="font-semibold text-emerald-600">Médico criado!</p>
                            <p className="text-sm text-muted-foreground">{search}</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
