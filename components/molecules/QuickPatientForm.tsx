'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Loader2, UserPlus, Check } from 'lucide-react';
import { PatientFormData, Patient } from '@/types';
import { patientService } from '@/features/patients/services/patient.service';

interface QuickPatientFormProps {
    onPatientCreated: (patient: Patient) => void;
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

export function QuickPatientForm({ onPatientCreated, onCancel }: QuickPatientFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successName, setSuccessName] = useState('');
    const [formData, setFormData] = useState<PatientFormData>({
        name: '',
        phone: '',
    });

    const handleSubmit = async () => {
        if (submitting) return;

        if (!formData.name || !formData.phone) {
            alert('Nome e telefone são obrigatórios');
            return;
        }

        setSubmitting(true);
        try {
            const newPatient = await patientService.create(formData);
            setSuccessName(newPatient.name);
            setSuccess(true);

            // Aguarda feedback visual antes de fechar
            setTimeout(() => {
                onPatientCreated(newPatient);
                setFormData({ name: '', phone: '' });
                setIsOpen(false);
                setSuccess(false);
            }, 1500);
        } catch (error) {
            console.error('Error creating patient:', error);
            alert('Erro ao cadastrar paciente');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        setFormData({ name: '', phone: '' });
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
                <UserPlus className="h-4 w-4" />
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
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">Paciente cadastrado!</p>
                        <p className="text-sm text-muted-foreground">{successName} foi adicionado</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <UserPlus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Cadastro Rápido</p>
                        <p className="text-xs text-muted-foreground">Novo paciente</p>
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
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Nome *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nome do paciente"
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
                </div>

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
