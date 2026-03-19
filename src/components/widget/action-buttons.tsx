import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Settings, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionButtonProps {
  onClick: () => void;
  title: string;
  className?: string;
}

export function ViewButton({ onClick, title }: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      className="h-8 w-8"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}

export function EditButton({ onClick, title }: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      className="h-8 w-8"
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}

export function DeleteButton({ onClick, title }: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      className="h-8 w-8"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}

export function SettingsButton({ onClick, title }: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={title}
      className="h-8 w-8"
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
}

interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className={item.variant === 'destructive' ? 'text-destructive' : ''}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ActionButtonsContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionButtonsContainer({ children, className }: ActionButtonsContainerProps) {
  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      {children}
    </div>
  );
}
