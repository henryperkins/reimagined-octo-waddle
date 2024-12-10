import React from 'react';
import { Card, CardContent } from './Card';

interface LoadingMessageProps {
    message?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ 
    message = 'Processing...' 
}) => {
    return (
        <Card className="loading-message">
            <CardContent>
                <div className="loading-spinner"></div>
                <div className="loading-text">{message}</div>
            </CardContent>
        </Card>
    );
};
