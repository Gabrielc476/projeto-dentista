import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Payment } from '@/types';
import { EmptyState } from '../molecules/EmptyState';
import { LoadingState } from '../molecules/LoadingState';

interface PaymentTableProps {
    payments: Payment[];
    loading: boolean;
    onEdit: (payment: Payment) => void;
    onDelete: (id: string) => void;
    getPatientName: (patientId: string) => string;
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

export function PaymentTable({ payments, loading, onEdit, onDelete, getPatientName }: PaymentTableProps) {
    if (loading) {
        return (
            <Card className="p-6">
                <LoadingState />
            </Card>
        );
    }

    if (payments.length === 0) {
        return (
            <Card className="p-6">
                <EmptyState message='Nenhum pagamento cadastrado. Clique em "+ Novo Pagamento" para começar.' />
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                                {getPatientName(payment.patientId)}
                            </TableCell>
                            <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{formatPaymentType(payment.paymentType)}</TableCell>
                            <TableCell>
                                {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadge(payment.status)}>
                                    {payment.status === 'pending' ? 'Pendente' :
                                        payment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(payment)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(payment.id)}
                                >
                                    Deletar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
