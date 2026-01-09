import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientFormData } from '@/types';

interface PatientFormFieldsProps {
    formData: PatientFormData;
    onChange: (data: PatientFormData) => void;
}

export function PatientFormFields({ formData, onChange }: PatientFormFieldsProps) {
    const handleChange = (field: keyof PatientFormData, value: string) => {
        onChange({ ...formData, [field]: value });
    };

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                    id="cpf"
                    value={formData.cpf || ''}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                />
            </div>
        </div>
    );
}
