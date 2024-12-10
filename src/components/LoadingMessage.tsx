import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingMessage: React.FC = () => {
  const dots = [1, 2, 3];
  
  return (
    <Card className="mb-4 p-4 bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {dots.map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 bg-blue-500 rounded-full mx-0.5 opacity-75 animate-bounce"
              style={{
                animationDelay: `${dot * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">
          AI is thinking...
        </span>
      </div>
    </Card>
  );
};

export default LoadingMessage;
