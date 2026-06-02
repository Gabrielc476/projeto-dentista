'use client';

import { useDoctors } from '@/hooks/useDoctors';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Phone, User, Calendar } from 'lucide-react';
import { DoctorType, ShiftType, SHIFT_NAMES, WEEKDAY_NAMES, WeekdayNumber } from '@/types';

const WEEKDAYS: WeekdayNumber[] = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

// Formatador de telefone
function formatPhone(value: string): string {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '').slice(0, 11);

    // Aplica a máscara: (00) 00000-0000 ou (00) 0000-0000
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function MedicosPage() {
    const {
        doctors,
        loading,
        dialogOpen,
        formData,
        editingDoctor,
        filterType,
        setFilterType,
        openDialog,
        closeDialog,
        handleFormChange,
        handleSubmit,
        handleEdit,
        handleDelete,
    } = useDoctors();

    const handlePhoneChange = (value: string) => {
        handleFormChange({ ...formData, phone: formatPhone(value) });
    };

    const getTypeBadge = (type: DoctorType) => {
        return type === 'fixed' ? (
            <Badge variant="default" className="bg-emerald-500">Fixo</Badge>
        ) : (
            <Badge variant="secondary">Avulso</Badge>
        );
    };

    const toggleWeekday = (weekday: number) => {
        const current = formData.fixedWeekdays || [];
        const newWeekdays = current.includes(weekday)
            ? current.filter(d => d !== weekday)
            : [...current, weekday].sort((a, b) => a - b);
        handleFormChange({ ...formData, fixedWeekdays: newWeekdays });
    };

    const formatFixedSchedule = (doctor: any) => {
        if (!doctor.fixedWeekdays?.length || !doctor.fixedShift) return '-';
        const days = doctor.fixedWeekdays
            .map((d: WeekdayNumber) => WEEKDAY_NAMES[d]?.substring(0, 3))
            .join(', ');
        const shift = SHIFT_NAMES[doctor.fixedShift as ShiftType];
        return `${days} - ${shift}`;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Médicos"
                description="Gerenciamento de médicos que alugam a clínica"
                actionLabel="+ Novo Médico"
                onAction={openDialog}
            />

            {/* Filtro */}
            <Card className="glass-card">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Label>Filtrar por tipo:</Label>
                        <Select value={filterType} onValueChange={(v) => setFilterType(v as DoctorType | 'all')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="fixed">Fixos</SelectItem>
                                <SelectItem value="temporary">Avulsos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card className="glass-card">
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="text-center py-8">Carregando...</div>
                    ) : doctors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum médico cadastrado
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Agenda Fixa</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {doctors.map((doctor) => (
                                    <TableRow key={doctor.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {doctor.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {doctor.phone}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(doctor.type)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{formatFixedSchedule(doctor)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(doctor)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(doctor.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingDoctor ? 'Editar Médico' : 'Novo Médico'}
                            </DialogTitle>
                            <DialogDescription>
                                Preencha as informações do médico
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleFormChange({ ...formData, name: e.target.value })}
                                        placeholder="Nome completo"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone *</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => handleFormChange({
                                        ...formData,
                                        type: v as DoctorType,
                                        // Clear fixed schedule if switching to temporary
                                        fixedWeekdays: v === 'temporary' ? [] : formData.fixedWeekdays,
                                        fixedShift: v === 'temporary' ? undefined : formData.fixedShift,
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixo (aluga regularmente)</SelectItem>
                                        <SelectItem value="temporary">Avulso (aluga ocasionalmente)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Fixed schedule fields - only shown for fixed doctors */}
                            {formData.type === 'fixed' && !editingDoctor && (
                                <Card className="border-dashed border-emerald-500/50 bg-emerald-500/5">
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <Calendar className="h-4 w-4" />
                                            <span className="font-medium text-sm">Agenda Fixa (gera locações automaticamente)</span>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Dias da Semana</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {WEEKDAYS.map((day) => (
                                                    <label
                                                        key={day}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                                                            ${formData.fixedWeekdays?.includes(day)
                                                                ? 'bg-emerald-500/20 border-emerald-500'
                                                                : 'hover:bg-accent border-border'
                                                            }`}
                                                    >
                                                        <Checkbox
                                                            checked={formData.fixedWeekdays?.includes(day)}
                                                            onCheckedChange={() => toggleWeekday(day)}
                                                        />
                                                        <span className="text-sm">{WEEKDAY_NAMES[day]}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fixedShift">Turno Fixo</Label>
                                            <Select
                                                value={formData.fixedShift || ''}
                                                onValueChange={(v) => handleFormChange({ ...formData, fixedShift: v as ShiftType })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o turno" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="morning">Manhã (08:00 - 12:00)</SelectItem>
                                                    <SelectItem value="afternoon">Tarde (14:00 - 18:00)</SelectItem>
                                                    <SelectItem value="evening">Noite (18:00 - 22:00)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            As locações serão geradas automaticamente do dia atual até o final do mês.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange({ ...formData, notes: e.target.value })}
                                    placeholder="Observações opcionais"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

