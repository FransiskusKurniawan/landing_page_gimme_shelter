import { AuditLog } from '../types/audit-log-type';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileJson } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';

interface AuditLogDetailProps {
    log: AuditLog | null;
}

export function AuditLogDetail({ log }: AuditLogDetailProps) {
    const { t } = useLanguage();

    if (!log) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(t('common.language.indonesian') === 'Indonesia' ? 'id-ID' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatJSON = (data: string | null) => {
        if (!data) return 'N/A';
        try {
            const parsed = JSON.parse(data);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return data;
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE':
                return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'UPDATE':
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'DELETE':
                return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            case 'LOGIN':
                return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
        }
    };

    return (
        <ScrollArea className="h-[calc(100vh)]">
            <div className="space-y-6 py-4 px-7">
                {/* Header Section */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-2xl bg-primary/10">
                            {log.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="text-2xl font-semibold">{log.username}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getActionColor(log.action)}>
                                {log.action.toUpperCase()}
                            </Badge>
                            <span className="text-muted-foreground">{t('admin_system.audit_log.detail.on_entity').replace('{entity}', log.entity)}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">{t('admin_system.audit_log.detail.basic_info')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t('admin_system.audit_log.detail.log_id')}</p>
                            <p className="font-medium">#{log.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t('admin_system.audit_log.detail.user_id')}</p>
                            <p className="font-medium">#{log.user_id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t('admin_system.audit_log.detail.action')}</p>
                            <Badge variant="outline" className={getActionColor(log.action)}>
                                {log.action}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{t('admin_system.audit_log.detail.entity')}</p>
                            <p className="font-medium">{log.entity}</p>
                        </div>
                        {log.entity_id && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{t('admin_system.audit_log.detail.entity_id')}</p>
                                <p className="font-medium">#{log.entity_id}</p>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Data Changes */}
                {(log.before_data || log.after_data) && (
                    <>
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold flex items-center gap-2">
                                <FileJson className="h-5 w-5" />
                                {t('admin_system.audit_log.detail.data_changes')}
                            </h4>

                            {log.before_data && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">{t('admin_system.audit_log.detail.before')}</p>
                                    <ScrollArea className="h-[200px] w-full rounded-md border bg-muted/50 p-4">
                                        <pre className="text-xs font-mono">{formatJSON(log.before_data)}</pre>
                                    </ScrollArea>
                                </div>
                            )}

                            {log.after_data && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">{t('admin_system.audit_log.detail.after')}</p>
                                    <ScrollArea className="h-[200px] w-full rounded-md border bg-muted/50 p-4">
                                        <pre className="text-xs font-mono">{formatJSON(log.after_data)}</pre>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                        <Separator />
                    </>
                )}

                {/* Timestamp */}
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{t('common.created_at')}</p>
                        <p className="text-base">{formatDate(log.created_at)}</p>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}
