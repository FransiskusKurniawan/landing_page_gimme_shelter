import { cn } from '@/lib/utils/utils';
import React from 'react';

interface SidePanelLayoutProps extends React.HTMLAttributes<HTMLDivElement | HTMLFormElement> {
    children: React.ReactNode;
    footer?: React.ReactNode;
    asForm?: boolean;
    bodyClassName?: string;
    footerClassName?: string;
}

export function SidePanelLayout({
    children,
    footer,
    asForm = false,
    className,
    bodyClassName,
    footerClassName,
    ...props
}: SidePanelLayoutProps) {
    const Component = asForm ? 'form' : 'div';

    return (
        <Component
            className={cn('flex flex-col h-full', className)}
            {...(asForm ? { ...props as React.FormHTMLAttributes<HTMLFormElement> } : props)}
        >
            {/* Scrollable body */}
            <div className={cn('flex-1 overflow-y-auto p-6 space-y-6', bodyClassName)}>
                {children}
            </div>

            {/* Fixed footer */}
            {footer && (
                <div className={cn('border-t p-4 bg-background flex justify-end gap-4', footerClassName)}>
                    {footer}
                </div>
            )}
        </Component>
    );
}
