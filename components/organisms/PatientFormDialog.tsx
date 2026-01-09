import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PatientFormData } from '@/types';
import { PatientFormFields } from '../molecules/PatientFormFields';

interface PatientFormDialogProps {
    open: boolean;
    onClose: () => void;
    formData: PatientFormData;
    onChange: (data: PatientFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
}

export function PatientFormDialog({
    open,
    onClose,
    formData,
    onChange,
    onSubmit,
    isEditing,
}: PatientFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha as informações do paciente
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <PatientFormFields formData={formData} onChange={onChange} />
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
