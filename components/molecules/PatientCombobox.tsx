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
import { Check, ChevronsUpDown, UserPlus, Search, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient, PatientFormData } from '@/types';
import { patientService } from '@/features/patients/services/patient.service';

interface PatientComboboxProps {
    patients: Patient[];
    value: string;
    onChange: (patientId: string) => void;
    onPatientCreated: (patient: Patient) => void;
}

// Formatador de telefone
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function PatientCombobox({ patients, value, onChange, onPatientCreated }: PatientComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createStep, setCreateStep] = useState<'idle' | 'phone' | 'saving' | 'success'>('idle');
    const [newPhone, setNewPhone] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedPatient = patients.find(p => p.id === value);

    const filteredPatients = useMemo(() => {
        if (!search) return patients;
        const searchLower = search.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.phone.includes(search)
        );
    }, [patients, search]);

    const showCreateOption = search.length >= 2 &&
        !filteredPatients.some(p => p.name.toLowerCase() === search.toLowerCase());

    const handleSelect = (patientId: string) => {
        onChange(patientId);
        setOpen(false);
        setSearch('');
        setIsCreating(false);
        setCreateStep('idle');
    };

    const handleStartCreate = () => {
        setIsCreating(true);
        setCreateStep('phone');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleCreate = async () => {
        if (!search || !newPhone) return;

        setCreateStep('saving');
        try {
            const newPatient = await patientService.create({
                name: search,
                phone: newPhone,
            });
            setCreateStep('success');

            setTimeout(() => {
                onPatientCreated(newPatient);
                onChange(newPatient.id);
                setOpen(false);
                setSearch('');
                setNewPhone('');
                setIsCreating(false);
                setCreateStep('idle');
            }, 800);
        } catch (error) {
            console.error('Error creating patient:', error);
            alert('Erro ao cadastrar paciente');
            setCreateStep('phone');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && createStep === 'phone' && newPhone) {
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
                    {selectedPatient ? (
                        <span className="truncate">{selectedPatient.name}</span>
                    ) : (
                        <span className="text-muted-foreground">Buscar ou criar paciente...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
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
                    {filteredPatients.length > 0 && !isCreating && (
                        <div className="p-1">
                            {/* Show hint when no search */}
                            {!search && patients.length > 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground border-b mb-1">
                                    Selecione um paciente ou digite para buscar/criar
                                </div>
                            )}
                            {filteredPatients.slice(0, 10).map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => handleSelect(patient.id)}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        value === patient.id && "bg-accent"
                                    )}
                                >
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{patient.name}</p>
                                        <p className="text-xs text-muted-foreground">{patient.phone}</p>
                                    </div>
                                    {value === patient.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            ))}
                            {filteredPatients.length > 10 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                                    Digite para filtrar mais {filteredPatients.length - 10} pacientes...
                                </div>
                            )}
                        </div>
                    )}

                    {/* No results */}
                    {filteredPatients.length === 0 && search && !isCreating && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Nenhum paciente encontrado
                        </div>
                    )}

                    {/* Create Option */}
                    {showCreateOption && !isCreating && (
                        <div className="border-t p-1">
                            <button
                                onClick={handleStartCreate}
                                className="relative flex w-full cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-3 text-sm outline-none transition-colors hover:bg-primary/10 group"
                            >
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                                    <UserPlus className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-primary">
                                        Criar "{search}"
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Novo paciente
                                    </p>
                                </div>
                                <Sparkles className="h-4 w-4 text-primary/50" />
                            </button>
                        </div>
                    )}

                    {/* Create Form - Phone Step */}
                    {isCreating && createStep === 'phone' && (
                        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                                    <UserPlus className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold">{search}</p>
                                    <p className="text-xs text-muted-foreground">Novo paciente</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs">Telefone para contato</Label>
                                <Input
                                    ref={inputRef}
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(formatPhone(e.target.value))}
                                    onKeyDown={handleKeyDown}
                                    placeholder="(00) 00000-0000"
                                    className="h-10"
                                    autoFocus
                                />
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
                                    Criar Paciente
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Create Form - Saving */}
                    {isCreating && createStep === 'saving' && (
                        <div className="p-8 flex flex-col items-center justify-center animate-in fade-in duration-200">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                            <p className="text-sm text-muted-foreground">Cadastrando...</p>
                        </div>
                    )}

                    {/* Create Form - Success */}
                    {isCreating && createStep === 'success' && (
                        <div className="p-8 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                            <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center mb-3">
                                <Check className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-semibold text-emerald-600">Paciente criado!</p>
                            <p className="text-sm text-muted-foreground">{search}</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
