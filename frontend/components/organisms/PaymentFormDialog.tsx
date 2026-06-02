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
import { PaymentFormData, Patient, Appointment } from '@/types';

interface PaymentFormDialogProps {
    open: boolean;
    onClose: () => void;
    formData: PaymentFormData;
    onChange: (data: PaymentFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
    patients: Patient[];
    appointments: Appointment[];
}

export function PaymentFormDialog({
    open,
    onClose,
    formData,
    onChange,
    onSubmit,
    isEditing,
    patients,
    appointments,
}: PaymentFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Editar Pagamento' : 'Novo Pagamento'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha as informações do pagamento
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="patient">Paciente *</Label>
                            <Select
                                value={formData.patientId}
                                onValueChange={(value) => onChange({ ...formData, patientId: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um paciente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="appointment">Consulta *</Label>
                            <Select
                                value={formData.appointmentId}
                                onValueChange={(value) => onChange({ ...formData, appointmentId: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma consulta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {appointments.map((appointment) => (
                                        <SelectItem key={appointment.id} value={appointment.id}>
                                            {appointment.pacienteNome} - {new Date(appointment.scheduledDate).toLocaleDateString('pt-BR')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Valor (R$) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => onChange({
                                    ...formData,
                                    amount: parseFloat(e.target.value) || 0
                                })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentType">Tipo de Pagamento *</Label>
                            <Select
                                value={formData.paymentType}
                                onValueChange={(value: any) => onChange({ ...formData, paymentType: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Dinheiro</SelectItem>
                                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="insurance">Convênio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentDate">Data do Pagamento *</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => onChange({ ...formData, paymentDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: any) => onChange({ ...formData, status: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="completed">Concluído</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes || ''}
                                onChange={(e) => onChange({ ...formData, notes: e.target.value })}
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
