import { Button } from '@/components/ui/button';

interface PageHeaderProps {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
}

export function PageHeader({ title, description, actionLabel, onAction }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-gray-600">{description}</p>
            </div>
            <Button onClick={onAction}>
                {actionLabel}
            </Button>
        </div>
    );
}
