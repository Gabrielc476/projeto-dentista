'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Loader2, Check, Stethoscope, Calendar } from 'lucide-react';
import { DoctorFormData, Doctor, DoctorType, ShiftType, SHIFT_NAMES, WEEKDAY_NAMES, WeekdayNumber } from '@/types';
import { doctorService } from '@/features/doctors/services/doctor.service';

const WEEKDAYS: WeekdayNumber[] = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

interface QuickDoctorFormProps {
    onDoctorCreated: (doctor: Doctor) => void;
    onCancel?: () => void;
}

// Formatador de telefone
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function QuickDoctorForm({ onDoctorCreated, onCancel }: QuickDoctorFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successName, setSuccessName] = useState('');
    const [formData, setFormData] = useState<DoctorFormData>({
        name: '',
        phone: '',
        type: 'temporary',
        fixedWeekdays: [],
        fixedShift: undefined,
    });

    const toggleWeekday = (weekday: number) => {
        const current = formData.fixedWeekdays || [];
        const newWeekdays = current.includes(weekday)
            ? current.filter(d => d !== weekday)
            : [...current, weekday].sort((a, b) => a - b);
        setFormData(prev => ({ ...prev, fixedWeekdays: newWeekdays }));
    };

    const handleSubmit = async () => {
        if (submitting) return;

        if (!formData.name || !formData.phone) {
            alert('Nome e telefone são obrigatórios');
            return;
        }

        setSubmitting(true);
        try {
            const newDoctor = await doctorService.create(formData);
            setSuccessName(newDoctor.name);
            setSuccess(true);

            // Aguarda feedback visual antes de fechar
            setTimeout(() => {
                onDoctorCreated(newDoctor);
                setFormData({ name: '', phone: '', type: 'temporary', fixedWeekdays: [], fixedShift: undefined });
                setIsOpen(false);
                setSuccess(false);
            }, 1500);
        } catch (error) {
            console.error('Error creating doctor:', error);
            alert('Erro ao cadastrar médico');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        setFormData({ name: '', phone: '', type: 'temporary', fixedWeekdays: [], fixedShift: undefined });
        setSuccess(false);
        onCancel?.();
    };

    if (!isOpen) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium"
            >
                <Stethoscope className="h-4 w-4" />
                Novo
            </Button>
        );
    }

    // Estado de sucesso
    if (success) {
        return (
            <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in duration-300">
                        <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">Médico cadastrado!</p>
                        <p className="text-sm text-muted-foreground">{successName} foi adicionado</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-violet-500/5 via-violet-500/10 to-transparent border border-violet-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Cadastro Rápido</p>
                        <p className="text-xs text-muted-foreground">Novo médico</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleCancel}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Nome *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nome do médico"
                            className="h-9 text-sm bg-background/50 focus:bg-background transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Telefone *</Label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                            placeholder="(00) 00000-0000"
                            className="h-9 text-sm bg-background/50 focus:bg-background transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Tipo *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v: DoctorType) => setFormData(prev => ({
                                ...prev,
                                type: v,
                                fixedWeekdays: v === 'temporary' ? [] : prev.fixedWeekdays,
                                fixedShift: v === 'temporary' ? undefined : prev.fixedShift,
                            }))}
                        >
                            <SelectTrigger className="h-9 text-sm bg-background/50 focus:bg-background transition-colors">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixo</SelectItem>
                                <SelectItem value="temporary">Avulso</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Fixed schedule fields - only shown for fixed doctors */}
                {formData.type === 'fixed' && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="font-medium text-xs">Agenda Fixa (gera locações auto)</span>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Dias da Semana</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {WEEKDAYS.map((day) => (
                                    <label
                                        key={day}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer transition-colors text-xs
                                            ${formData.fixedWeekdays?.includes(day)
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600'
                                                : 'hover:bg-accent border-border'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={formData.fixedWeekdays?.includes(day)}
                                            onCheckedChange={() => toggleWeekday(day)}
                                            className="h-3 w-3"
                                        />
                                        <span>{WEEKDAY_NAMES[day]?.substring(0, 3)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Turno Fixo</Label>
                            <Select
                                value={formData.fixedShift || ''}
                                onValueChange={(v: ShiftType) => setFormData(prev => ({ ...prev, fixedShift: v }))}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">{SHIFT_NAMES.morning}</SelectItem>
                                    <SelectItem value="afternoon">{SHIFT_NAMES.afternoon}</SelectItem>
                                    <SelectItem value="evening">{SHIFT_NAMES.evening}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={submitting || !formData.name || !formData.phone}
                        onClick={handleSubmit}
                        className="gap-1.5 min-w-[100px]"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Cadastrar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
