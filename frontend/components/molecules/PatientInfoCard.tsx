import { Card } from '@/components/ui/card';
import { Patient } from '@/types';

interface PatientInfoCardProps {
    patient: Patient;
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Informações do Paciente</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{patient.name}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{patient.phone}</p>
                </div>

                {patient.email && (
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{patient.email}</p>
                    </div>
                )}

                {patient.cpf && (
                    <div>
                        <p className="text-sm text-gray-500">CPF</p>
                        <p className="font-medium">{patient.cpf}</p>
                    </div>
                )}

                {patient.birthDate && (
                    <div>
                        <p className="text-sm text-gray-500">Data de Nascimento</p>
                        <p className="font-medium">
                            {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                )}

                {patient.address && (
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Endereço</p>
                        <p className="font-medium">{patient.address}</p>
                    </div>
                )}

                {patient.notes && (
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Observações</p>
                        <p className="font-medium">{patient.notes}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
