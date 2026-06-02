import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Payment } from '@/types';
import { EmptyState } from '../molecules/EmptyState';

interface PatientPaymentHistoryProps {
    payments: Payment[];
}

const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        pending: 'destructive',
        completed: 'default',
        cancelled: 'secondary',
    };
    return variants[status] || 'outline';
};

const formatPaymentType = (type: string) => {
    const types: Record<string, string> = {
        cash: 'Dinheiro',
        credit_card: 'Cartão de Crédito',
        debit_card: 'Cartão de Débito',
        pix: 'PIX',
        insurance: 'Convênio',
    };
    return types[type] || type;
};

export function PatientPaymentHistory({ payments }: PatientPaymentHistoryProps) {
    if (payments.length === 0) {
        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Histórico de Pagamentos</h2>
                <EmptyState message="Nenhum pagamento registrado para este paciente." />
            </Card>
        );
    }

    // Calculate totals
    const totalPaid = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Histórico de Pagamentos</h2>
                <div className="flex gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Pago: </span>
                        <span className="font-semibold text-green-600">R$ {totalPaid.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Pendente: </span>
                        <span className="font-semibold text-red-600">R$ {totalPending.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell>
                                {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{formatPaymentType(payment.paymentType)}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadge(payment.status)}>
                                    {payment.status === 'pending' ? 'Pendente' :
                                        payment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
