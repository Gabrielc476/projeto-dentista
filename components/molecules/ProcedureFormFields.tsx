import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProcedureFormData } from '@/types';

interface ProcedureFormFieldsProps {
    formData: ProcedureFormData;
    onChange: (data: ProcedureFormData) => void;
}

export function ProcedureFormFields({ formData, onChange }: ProcedureFormFieldsProps) {
    const handleChange = (field: keyof ProcedureFormData, value: string | number | undefined) => {
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="defaultPrice">Preço Padrão (R$)</Label>
                <Input
                    id="defaultPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultPrice || ''}
                    onChange={(e) => handleChange('defaultPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="durationMinutes">Duração (minutos)</Label>
                <Input
                    id="durationMinutes"
                    type="number"
                    min="0"
                    value={formData.durationMinutes || ''}
                    onChange={(e) => handleChange('durationMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
                />
            </div>
        </div>
    );
}
