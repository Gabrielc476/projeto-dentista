import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Procedure } from '@/types';
import { EmptyState } from '../molecules/EmptyState';
import { LoadingState } from '../molecules/LoadingState';

interface ProcedureTableProps {
    procedures: Procedure[];
    loading: boolean;
    onEdit: (procedure: Procedure) => void;
    onDelete: (id: string) => void;
}

export function ProcedureTable({ procedures, loading, onEdit, onDelete }: ProcedureTableProps) {
    if (loading) {
        return (
            <Card className="p-6">
                <LoadingState />
            </Card>
        );
    }

    if (procedures.length === 0) {
        return (
            <Card className="p-6">
                <EmptyState message='Nenhum procedimento cadastrado. Clique em "+ Novo Procedimento" para começar.' />
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Preço Padrão</TableHead>
                        <TableHead className="text-right">Duração (min)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {procedures.map((procedure) => (
                        <TableRow key={procedure.id}>
                            <TableCell className="font-medium">{procedure.name}</TableCell>
                            <TableCell>{procedure.description || '-'}</TableCell>
                            <TableCell className="text-right">
                                {procedure.defaultPrice
                                    ? `R$ ${procedure.defaultPrice.toFixed(2)}`
                                    : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                {procedure.durationMinutes || '-'}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(procedure)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(procedure.id)}
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
