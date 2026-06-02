import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProcedureFormData } from '@/types';
import { ProcedureFormFields } from '../molecules/ProcedureFormFields';

interface ProcedureFormDialogProps {
    open: boolean;
    onClose: () => void;
    formData: ProcedureFormData;
    onChange: (data: ProcedureFormData) => void;
    onSubmit: (e: React.FormEvent) => void;
    isEditing: boolean;
}

export function ProcedureFormDialog({
    open,
    onClose,
    formData,
    onChange,
    onSubmit,
    isEditing,
}: ProcedureFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Editar Procedimento' : 'Novo Procedimento'}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha as informações do procedimento
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ProcedureFormFields formData={formData} onChange={onChange} />
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
