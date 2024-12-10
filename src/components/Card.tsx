import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    const classes = ['card', className].filter(Boolean).join(' ');
    return <div className={classes} {...props}>{children}</div>;
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    const classes = ['card-header', className].filter(Boolean).join(' ');
    return <div className={classes} {...props}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    const classes = ['card-title', className].filter(Boolean).join(' ');
    return <h3 className={classes} {...props}>{children}</h3>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    const classes = ['card-content', className].filter(Boolean).join(' ');
    return <div className={classes} {...props}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    const classes = ['card-footer', className].filter(Boolean).join(' ');
    return <div className={classes} {...props}>{children}</div>;
};
