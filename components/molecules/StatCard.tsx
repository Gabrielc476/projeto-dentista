import { Card } from '@/components/ui/card';

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    iconColor: string;
    trend?: string;
}

export function StatCard({ icon, label, value, iconColor, trend }: StatCardProps) {
    return (
        <Card className="stat-card">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                    {trend && (
                        <p className="text-xs text-muted-foreground mt-2">{trend}</p>
                    )}
                </div>
                <div className={`icon-circle ${iconColor}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </Card>
    );
}
