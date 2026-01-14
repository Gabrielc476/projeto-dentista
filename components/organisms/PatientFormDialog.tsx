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
    submitting?: boolean;
}

export function PatientFormDialog({
    open,
    onClose,
    formData,
    onChange,
    onSubmit,
    isEditing,
    submitting = false,
}: PatientFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={submitting ? undefined : onClose}>
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
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

