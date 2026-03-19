/**
 * Dynamic Action Button Component
 * Renders dynamic actions with permission checks
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Settings, 
  MoreVertical, 
  Plus,
  Download,
  Upload,
  Copy,
  Archive,
  RefreshCw,
  LucideIcon
} from 'lucide-react';
import type { ActionConfig, ActionData } from '@/lib/services/action-service';

// Icon mapping for action icons
const ICON_MAP: Record<string, LucideIcon> = {
  Eye,
  Edit,
  Trash2,
  Settings,
  MoreVertical,
  Plus,
  Download,
  Upload,
  Copy,
  Archive,
  RefreshCw,
};

interface DynamicActionButtonProps<T = ActionData> {
  action: ActionConfig<T>;
  data?: T;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export const DynamicActionButton = <T extends ActionData = ActionData>({
  action,
  data,
  size = 'default',
  variant = 'default',
  className,
}: DynamicActionButtonProps<T>): React.JSX.Element => {
  const Icon = action.icon ? ICON_MAP[action.icon] : null;
  
  // Check if action is disabled
  const isDisabled = typeof action.disabled === 'function' 
    ? action.disabled(data) 
    : action.disabled;

  const handleClick = () => {
    if (!isDisabled) {
      action.onClick(data);
    }
  };

  const buttonContent = (
    <Button
      size={size}
      variant={variant}
      disabled={isDisabled}
      onClick={action.requiresConfirmation ? undefined : handleClick}
      className={className}
    >
      {Icon && <Icon className={size === 'icon' ? 'h-4 w-4' : 'h-4 w-4 mr-2'} />}
      {size !== 'icon' && action.label}
    </Button>
  );

  // If requires confirmation, wrap in AlertDialog
  if (action.requiresConfirmation) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {buttonContent}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action.confirmationTitle || `Confirm ${action.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action.confirmationMessage || 
               `Are you sure you want to ${action.label.toLowerCase()}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClick}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return buttonContent;
};

interface DynamicActionDropdownProps<T = ActionData> {
  actions: ActionConfig<T>[];
  data?: T;
  triggerLabel?: string;
  triggerIcon?: LucideIcon;
  className?: string;
}

export const DynamicActionDropdown = <T extends ActionData = ActionData>({
  actions,
  data,
  triggerLabel = 'Actions',
  triggerIcon: TriggerIcon = MoreVertical,
  className,
}: DynamicActionDropdownProps<T>): React.JSX.Element | null => {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionConfig<T> | null>(null);

  // Filter out disabled actions and actions that don't pass show conditions
  const availableActions = actions.filter(action => {
    // Check show condition
    if (action.showCondition && !action.showCondition(data)) {
      return false;
    }
    
    // Check if disabled
    const isDisabled = typeof action.disabled === 'function' 
      ? action.disabled(data) 
      : action.disabled;
    
    return !isDisabled;
  });

  const handleActionClick = (action: ActionConfig<T>) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setConfirmationOpen(true);
    } else {
      action.onClick(data);
    }
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction.onClick(data);
      setPendingAction(null);
    }
    setConfirmationOpen(false);
  };

  const handleCancel = () => {
    setPendingAction(null);
    setConfirmationOpen(false);
  };

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <TriggerIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableActions.map((action, index) => {
            const Icon = action.icon ? ICON_MAP[action.icon] : null;
            
            return (
              <DropdownMenuItem
                key={action.code}
                onClick={() => handleActionClick(action)}
                className={action.variant === 'destructive' ? 'text-destructive' : ''}
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Separate confirmation dialog outside the dropdown */}
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.confirmationTitle || `Confirm ${pendingAction?.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.confirmationMessage || 
               `Are you sure you want to ${pendingAction?.label.toLowerCase()}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
