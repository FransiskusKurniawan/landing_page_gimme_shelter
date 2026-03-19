/**
 * Dynamic Table Actions Component
 * Integrates with existing table components to show dynamic actions
 */

import React from 'react';
import {
  DynamicActionButton,
  DynamicActionDropdown,
} from './dynamic-action-button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ActionConfig, ActionData } from '@/lib/services/action-service';

interface DynamicTableActionsProps<T = ActionData> {
  actions: ActionConfig<T>[];
  data?: T;
  className?: string;
  maxVisibleActions?: number;
}

export const DynamicTableActions = <T extends ActionData = ActionData>({
  actions,
  data,
  className,
  maxVisibleActions = 3,
}: DynamicTableActionsProps<T>): React.JSX.Element | null => {
  const passesCondition = (action: ActionConfig<T>) =>
    action.showCondition ? action.showCondition(data as T) : true;

  // Separate visible actions and dropdown-only actions
  // Visible actions: showInTable !== false AND showCondition passes (if exists)
  const visibleActions = actions.filter(action => {
    // If showInTable is explicitly false, this is a dropdown-only action
    if (action.showInTable === false) {
      return false;
    }

    // Global rule: DELETE should always be in dropdown (View more)
    if (action.code === 'DELETE') {
      return false;
    }

    // Check showCondition for visible actions
    return passesCondition(action);
  });

  // Dropdown-only actions: showInTable === false (always included in dropdown regardless of showCondition)
  const dropdownOnlyActions = actions.filter(
    action => action.showInTable === false && passesCondition(action)
  );

  // Always-dropdown actions: enforce DELETE goes to dropdown regardless of showInTable
  const alwaysDropdownActions = actions.filter(
    action => action.code === 'DELETE' && passesCondition(action)
  );

  // If no visible actions and no dropdown actions, return null
  if (visibleActions.length === 0 && dropdownOnlyActions.length === 0 && alwaysDropdownActions.length === 0) {
    return null;
  }

  // If visible actions are maxVisibleActions or fewer AND no dropdown-only actions
  // AND no always-dropdown actions (like DELETE), show all as icon buttons
  if (
    visibleActions.length <= maxVisibleActions &&
    dropdownOnlyActions.length === 0 &&
    alwaysDropdownActions.length === 0
  ) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {visibleActions.map((action, index) => (
          <TooltipProvider key={action.code || `action-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DynamicActionButton
                  action={action}
                  data={data}
                  size='icon'
                  variant='ghost'
                  className='border border-transparent'
                />
              </TooltipTrigger>
              <TooltipContent side='top' className='text-xs'>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  // Determine which visible actions to show as icons and which to put in dropdown
  const iconActions = visibleActions.slice(0, maxVisibleActions);
  const overflowActions = visibleActions.slice(maxVisibleActions);
  
  // Combine overflow actions with dropdown-only and always-dropdown actions
  const dropdownActions = [
    ...overflowActions,
    ...dropdownOnlyActions,
    ...alwaysDropdownActions,
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Show icon buttons for primary actions */}
      {iconActions.map((action, index) => (
        <TooltipProvider key={action.code || `action-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DynamicActionButton
                action={action}
                data={data}
                size='icon'
                variant='ghost'
                className='border border-transparent'
              />
            </TooltipTrigger>
            <TooltipContent side='top' className='text-xs'>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Show dropdown for overflow and dropdown-only actions */}
      {dropdownActions.length > 0 && (
        <DynamicActionDropdown
          actions={dropdownActions}
          data={data}
        />
      )}
    </div>
  );
};

// Export default for easier imports
export default DynamicTableActions;
