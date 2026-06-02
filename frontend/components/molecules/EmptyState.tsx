interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <p className="text-center py-8 text-gray-500">
            {message}
        </p>
    );
}
