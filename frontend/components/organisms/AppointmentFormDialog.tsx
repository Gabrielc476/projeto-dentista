import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Patient, Procedure, Appointment } from '@/types';
import { PatientCombobox } from '@/components/molecules/PatientCombobox';
import { DateTimePicker } from '@/components/molecules/DateTimePicker';
import { useMemo } from 'react';
import { useOccupancy } from '@/hooks/useOccupancy';

interface ProcedureSelection {
    id: string;
    quantity: number;
    unitPrice?: number;
}

interface AppointmentFormDialogProps {
    open: boolean;
    onClose: () => void;
    formData: {
        patientId: string;
        scheduledDate: string;
        status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
        notes: string;
        totalValue: number;
    };
    onFormChange: (updates: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
    patients: Patient[];
    procedures: Procedure[];
    selectedProcedures: ProcedureSelection[];
    onAddProcedure: () => void;
    onRemoveProcedure: (index: number) => void;
    onUpdateProcedure: (index: number, field: string, value: any) => void;
    onPatientCreated?: (patient: Patient) => void;
    existingAppointments?: Appointment[];  // For busy slot detection
    editingAppointmentId?: string;  // To exclude current appointment from busy slots
}

export function AppointmentFormDialog({
    open,
    onClose,
    formData,
    onFormChange,
    onSubmit,
    isEditing,
    patients,
    procedures,
    selectedProcedures,
    onAddProcedure,
    onRemoveProcedure,
    onUpdateProcedure,
    onPatientCreated,
    existingAppointments = [],
    editingAppointmentId,
}: AppointmentFormDialogProps) {
    // Get cross-entity occupancy data
    const { fullyOccupiedDates, isTimeSlotBusy } = useOccupancy();

    // Filter busy slots to exclude the appointment being edited
    const filteredIsTimeSlotBusy = useMemo(() => {
        if (!editingAppointmentId) return isTimeSlotBusy;

        // Get the scheduled date of the appointment being edited
        const editingAppointment = existingAppointments.find(a => a.id === editingAppointmentId);
        if (!editingAppointment) return isTimeSlotBusy;

        const editingDate = editingAppointment.scheduledDate;
        let editingDateStr: string;
        let editingTime: string;

        if (editingDate instanceof Date) {
            editingDateStr = `${editingDate.getFullYear()}-${String(editingDate.getMonth() + 1).padStart(2, '0')}-${String(editingDate.getDate()).padStart(2, '0')}`;
            editingTime = `${String(editingDate.getHours()).padStart(2, '0')}:${String(editingDate.getMinutes()).padStart(2, '0')}`;
        } else if (typeof editingDate === 'string') {
            editingDateStr = editingDate.split('T')[0];
            editingTime = editingDate.split('T')[1]?.slice(0, 5) || '';
        } else {
            return isTimeSlotBusy;
        }

        return (date: string, time: string) => {
            // Exclude the slot being edited
            if (date === editingDateStr && time === editingTime) return false;
            return isTimeSlotBusy(date, time);
        };
    }, [isTimeSlotBusy, editingAppointmentId, existingAppointments]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Editar Consulta' : 'Nova Consulta'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha as informações da consulta e selecione os procedimentos
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="patient">Paciente *</Label>
                            <PatientCombobox
                                patients={patients}
                                value={formData.patientId}
                                onChange={(id) => onFormChange({ patientId: id })}
                                onPatientCreated={(patient) => {
                                    onPatientCreated?.(patient);
                                    onFormChange({ patientId: patient.id });
                                }}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="scheduledDate">Data e Hora *</Label>
                            <DateTimePicker
                                value={formData.scheduledDate}
                                onChange={(value) => onFormChange({ scheduledDate: value })}
                                placeholder="Selecione data e hora da consulta"
                                fullyOccupiedDates={fullyOccupiedDates}
                                isTimeSlotBusy={filteredIsTimeSlotBusy}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: any) => onFormChange({ status: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">Agendada</SelectItem>
                                    <SelectItem value="completed">Concluída</SelectItem>
                                    <SelectItem value="cancelled">Cancelada</SelectItem>
                                    <SelectItem value="no_show">Não Compareceu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Procedures Section */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-3">
                                <Label>Procedimentos *</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onAddProcedure}
                                >
                                    + Adicionar Procedimento
                                </Button>
                            </div>

                            {selectedProcedures.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Nenhum procedimento selecionado
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedProcedures.map((procSelection, index) => {
                                        const procedure = procedures.find(p => p.id === procSelection.id);

                                        console.log('[AppointmentForm] Rendering procedure', index, {
                                            procSelection,
                                            foundProcedure: procedure,
                                            allProcedures: procedures.map(p => ({ id: p.id, name: p.name }))
                                        });

                                        return (
                                            <Card key={index} className="p-3">
                                                <div className="grid grid-cols-12 gap-2 items-end">
                                                    <div className="col-span-5">
                                                        <Label className="text-xs">Procedimento</Label>
                                                        <Select
                                                            key={`${index}-${procSelection.id}`}
                                                            value={procSelection.id}
                                                            onValueChange={(value) => {
                                                                console.log('[AppointmentForm] Select changed:', {
                                                                    index,
                                                                    oldValue: procSelection.id,
                                                                    newValue: value
                                                                });
                                                                const proc = procedures.find(p => p.id === value);
                                                                console.log('[AppointmentForm] Found procedure:', proc);

                                                                // FIX: Update both fields at once to avoid stale state
                                                                onUpdateProcedure(index, 'multi', {
                                                                    id: value,
                                                                    unitPrice: proc?.defaultPrice
                                                                });
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {procedures.map((proc) => (
                                                                    <SelectItem key={proc.id} value={proc.id}>
                                                                        {proc.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label className="text-xs">Qtd</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={procSelection.quantity}
                                                            onChange={(e) => onUpdateProcedure(index, 'quantity', parseInt(e.target.value))}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <Label className="text-xs">Preço Unit.</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={procSelection.unitPrice || procedure?.defaultPrice || 0}
                                                            onChange={(e) => onUpdateProcedure(index, 'unitPrice', parseFloat(e.target.value))}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => onRemoveProcedure(index)}
                                                            className="w-full h-9"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="totalValue">Valor Total (R$)</Label>
                            <Input
                                id="totalValue"
                                type="number"
                                step="0.01"
                                value={formData.totalValue}
                                onChange={(e) => onFormChange({ totalValue: parseFloat(e.target.value) || 0 })}
                                className="font-bold text-lg"
                            />
                            <p className="text-xs text-gray-500">
                                Calculado automaticamente ou pode ser ajustado manualmente
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => onFormChange({ notes: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
