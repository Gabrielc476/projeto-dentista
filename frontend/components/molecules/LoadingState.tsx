interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
    return (
        <p className="text-center py-8 text-gray-500">
            {message}
        </p>
    );
}
