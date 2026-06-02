import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientFormData } from '@/types';

interface PatientFormFieldsProps {
    formData: PatientFormData;
    onChange: (data: PatientFormData) => void;
}

// Formatadores
function formatCPF(value: string): string {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '').slice(0, 11);

    // Aplica a máscara: 000.000.000-00
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '').slice(0, 11);

    // Aplica a máscara: (00) 00000-0000 ou (00) 0000-0000
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatName(value: string): string {
    // Capitaliza cada palavra
    return value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function PatientFormFields({ formData, onChange }: PatientFormFieldsProps) {
    const handleChange = (field: keyof PatientFormData, value: string) => {
        onChange({ ...formData, [field]: value });
    };

    const handleNameChange = (value: string) => {
        // Formata ao perder o foco, não durante a digitação
        handleChange('name', value);
    };

    const handleNameBlur = () => {
        if (formData.name) {
            handleChange('name', formatName(formData.name));
        }
    };

    const handlePhoneChange = (value: string) => {
        handleChange('phone', formatPhone(value));
    };

    const handleCPFChange = (value: string) => {
        handleChange('cpf', formatCPF(value));
    };

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="Nome completo do paciente"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value.toLowerCase())}
                    placeholder="email@exemplo.com"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                    id="cpf"
                    value={formData.cpf || ''}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    placeholder="000.000.000-00"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Rua, número, bairro"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Observações sobre o paciente"
                />
            </div>
        </div>
    );
}
