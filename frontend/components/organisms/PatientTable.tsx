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
import { Patient } from '@/types';
import { EmptyState } from '../molecules/EmptyState';
import { LoadingState } from '../molecules/LoadingState';
import { useRouter } from 'next/navigation';

interface PatientTableProps {
    patients: Patient[];
    loading: boolean;
    onEdit: (patient: Patient) => void;
    onDelete: (id: string) => void;
}

export function PatientTable({ patients, loading, onEdit, onDelete }: PatientTableProps) {
    const router = useRouter();

    if (loading) {
        return (
            <Card className="p-6">
                <LoadingState />
            </Card>
        );
    }

    if (patients.length === 0) {
        return (
            <Card className="p-6">
                <EmptyState message='Nenhum paciente cadastrado. Clique em "+ Novo Paciente" para começar.' />
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => (
                        <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>{patient.email || '-'}</TableCell>
                            <TableCell>{patient.cpf || '-'}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => router.push(`/pacientes/${patient.id}`)}
                                >
                                    Detalhes
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(patient)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(patient.id)}
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
