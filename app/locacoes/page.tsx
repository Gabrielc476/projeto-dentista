'use client';

import { useState, useMemo, useCallback } from 'react';
import { useClinicRentals } from '@/hooks/useClinicRentals';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, Plus, Trash2, Pencil, Stethoscope, Download } from 'lucide-react';
import { ShiftType, SHIFT_LABELS, SHIFT_NAMES, CalendarItem } from '@/types';
import { useRouter } from 'next/navigation';
import { DoctorCombobox } from '@/components/molecules/DoctorCombobox';
import { DatePicker } from '@/components/molecules/DatePicker';
import { useOccupancy } from '@/hooks/useOccupancy';
import { AvailabilityExportModal } from '@/components/molecules/AvailabilityExportModal';

const SHIFTS: ShiftType[] = ['morning', 'afternoon', 'evening'];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function LocacoesPage() {
    const router = useRouter();
    const {
        doctors,
        rentals,
        loading,
        dialogOpen,
        formData,
        editingRental,
        currentWeekStart,
        weekDays,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        getItemsForSlot,
        formatDate,
        handleDoctorCreated,
    } = useClinicRentals();

    // Get cross-entity occupancy data
    const { fullyOccupiedDates, isShiftBusy: occupancyIsShiftBusy } = useOccupancy();

    // Filter isShiftBusy to exclude the rental being edited
    const isShiftBusy = useCallback((date: string, shift: ShiftType): boolean => {
        if (!occupancyIsShiftBusy) return false;

        // Exclude the rental being edited
        if (editingRental) {
            const editingDate = editingRental.date;
            let editingDateStr: string;
            if (editingDate instanceof Date) {
                editingDateStr = `${editingDate.getFullYear()}-${String(editingDate.getMonth() + 1).padStart(2, '0')}-${String(editingDate.getDate()).padStart(2, '0')}`;
            } else {
                editingDateStr = typeof editingDate === 'string' ? editingDate : '';
            }
            if (date === editingDateStr && shift === editingRental.shift) return false;
        }

        return occupancyIsShiftBusy(date, shift);
    }, [occupancyIsShiftBusy, editingRental]);

    const formatWeekRange = () => {
        const start = weekDays[0];
        const end = weekDays[6];
        const startMonth = MONTH_NAMES[start.getMonth()];
        const endMonth = MONTH_NAMES[end.getMonth()];

        if (startMonth === endMonth) {
            return `${start.getDate()} - ${end.getDate()} de ${startMonth} ${end.getFullYear()}`;
        }
        return `${start.getDate()} de ${startMonth} - ${end.getDate()} de ${endMonth} ${end.getFullYear()}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const renderCalendarCell = (items: CalendarItem[], date: Date, shift: ShiftType) => {
        const dateStr = formatDate(date);

        if (items.length > 0) {
            return (
                <div className="space-y-1 min-h-[60px]">
                    {items.map((item) => {
                        if (item.type === 'rental') {
                            // Find the full rental data for editing
                            const rental = rentals.find(r => r.id === item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`p-2 rounded-lg cursor-pointer transition-all
                                        ${item.doctorType === 'fixed'
                                            ? 'bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30'
                                            : 'bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30'
                                        }`}
                                    onClick={() => rental && handleEdit(rental)}
                                >
                                    <div className="flex justify-between items-start gap-1">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.doctorName}</p>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs mt-1 ${item.doctorType === 'fixed' ? 'border-emerald-500/50' : 'border-blue-500/50'}`}
                                            >
                                                {item.doctorType === 'fixed' ? 'Fixo' : 'Avulso'}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        } else {
                            // Appointment item
                            return (
                                <div
                                    key={item.id}
                                    className="p-2 rounded-lg cursor-pointer transition-all
                                        bg-violet-500/20 border border-violet-500/30 hover:bg-violet-500/30"
                                    onClick={() => router.push(`/consultas/${item.id}`)}
                                >
                                    <div className="flex justify-between items-start gap-1">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {item.scheduledTime} - {item.patientName}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="text-xs mt-1 border-violet-500/50"
                                            >
                                                <Stethoscope className="h-3 w-3 mr-1" />
                                                Consulta
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            );
        }

        return (
            <button
                onClick={() => openDialog(dateStr, shift)}
                className="w-full h-full min-h-[60px] rounded-lg border border-dashed border-muted-foreground/30 
                         hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center"
            >
                <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
        );
    };

    const [exportModalOpen, setExportModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Locações da Clínica"
                    description="Calendário de locação por turnos"
                    actionLabel="+ Nova Locação"
                    onAction={() => openDialog()}
                />
                <Button
                    variant="outline"
                    onClick={() => setExportModalOpen(true)}
                    className="gap-2"
                >
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
            </div>

            {/* Navegação do Calendário */}
            <Card className="glass-card">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={goToNextWeek}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={goToCurrentWeek}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Hoje
                            </Button>
                        </div>
                        <h2 className="text-lg font-semibold">{formatWeekRange()}</h2>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-emerald-500/50" />
                                <span>Fixo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-500/50" />
                                <span>Avulso</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-violet-500/50" />
                                <span>Consulta</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendário Semanal */}
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-16">Carregando...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="w-24 p-3 text-left text-sm font-medium text-muted-foreground">
                                            Turno
                                        </th>
                                        {weekDays.map((day, idx) => (
                                            <th
                                                key={idx}
                                                className={`p-3 text-center min-w-[150px] ${isToday(day) ? 'bg-primary/10' : ''}`}
                                            >
                                                <div className="text-sm font-medium">
                                                    {DAY_NAMES[day.getDay()]}
                                                </div>
                                                <div className={`text-2xl font-bold ${isToday(day) ? 'text-primary' : ''}`}>
                                                    {day.getDate()}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {SHIFTS.map((shift) => (
                                        <tr key={shift} className="border-b border-border/30">
                                            <td className="p-3 border-r border-border/30">
                                                <div className="font-medium text-sm">{SHIFT_NAMES[shift]}</div>
                                                <div className="text-xs text-muted-foreground">{SHIFT_LABELS[shift]}</div>
                                            </td>
                                            {weekDays.map((day, idx) => (
                                                <td
                                                    key={idx}
                                                    className={`p-2 ${isToday(day) ? 'bg-primary/5' : ''}`}
                                                >
                                                    {renderCalendarCell(getItemsForSlot(day, shift), day, shift)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[700px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingRental ? 'Editar Locação' : 'Nova Locação'}
                            </DialogTitle>
                            <DialogDescription>
                                Defina quem irá utilizar a clínica neste turno
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="doctorId">Médico *</Label>
                                <DoctorCombobox
                                    doctors={doctors}
                                    value={formData.doctorId}
                                    onChange={(id) => handleFormChange({ ...formData, doctorId: id })}
                                    onDoctorCreated={(doctor) => {
                                        handleDoctorCreated(doctor);
                                        handleFormChange({ ...formData, doctorId: doctor.id });
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Data *</Label>
                                    <DatePicker
                                        value={formData.date}
                                        onChange={(value) => handleFormChange({ ...formData, date: value })}
                                        placeholder="Selecione a data"
                                        fullyOccupiedDates={fullyOccupiedDates}
                                        selectedShift={formData.shift}
                                        isShiftBusy={isShiftBusy}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shift">Turno *</Label>
                                    <Select
                                        value={formData.shift}
                                        onValueChange={(v) => handleFormChange({ ...formData, shift: v as ShiftType })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o turno" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SHIFTS.map((shift) => {
                                                const isBusy = formData.date && isShiftBusy(formData.date, shift);
                                                return (
                                                    <SelectItem
                                                        key={shift}
                                                        value={shift}
                                                        className={isBusy ? 'text-red-500 line-through opacity-70' : ''}
                                                    >
                                                        {SHIFT_NAMES[shift]} ({SHIFT_LABELS[shift]})
                                                        {isBusy && <span className="ml-2 text-xs text-red-500">(Ocupado)</span>}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange({ ...formData, notes: e.target.value })}
                                    placeholder="Observações opcionais"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={!formData.doctorId}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Exportação */}
            <AvailabilityExportModal
                open={exportModalOpen}
                onOpenChange={setExportModalOpen}
            />
        </div>
    );
}
