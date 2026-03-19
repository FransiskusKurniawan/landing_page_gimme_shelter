import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLogStatsData } from '../types/audit-log-type';
import { Database, ActivitySquare, BarChart3, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/providers/language-provider';

interface AuditLogStatsProps {
    stats: AuditLogStatsData | null;
    isLoading: boolean;
}

export function AuditLogStats({ stats, isLoading }: AuditLogStatsProps) {
    const { t } = useLanguage();
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
                return 'bg-green-500/10 text-green-500';
            case 'update':
                return 'bg-blue-500/10 text-blue-500';
            case 'delete':
                return 'bg-red-500/10 text-red-500';
            case 'login':
                return 'bg-purple-500/10 text-purple-500';
            default:
                return 'bg-slate-500/10 text-slate-500';
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Logs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin_system.audit_log.stats.total_logs')}</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_logs}</div>
                    <p className="text-xs text-muted-foreground">{t('admin_system.audit_log.stats.total_logs_desc')}</p>
                </CardContent>
            </Card>

            {/* Logs Today */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin_system.audit_log.stats.logs_today')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.logs_today}</div>
                    <p className="text-xs text-muted-foreground">{t('admin_system.audit_log.stats.logs_today_desc')}</p>
                </CardContent>
            </Card>

            {/* Top Entities */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin_system.audit_log.stats.top_entities')}</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stats.entity_counts.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{item.Entity}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {item.Count}
                                </Badge>
                            </div>
                        ))}
                        {stats.entity_counts.length === 0 && (
                            <p className="text-xs text-muted-foreground">{t('admin_system.audit_log.stats.no_data')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Top Actions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin_system.audit_log.stats.top_actions')}</CardTitle>
                    <ActivitySquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stats.action_counts.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <Badge variant="outline" className={getActionColor(item.Action)}>
                                    {item.Action}
                                </Badge>
                                <span className="font-medium">{item.Count}</span>
                            </div>
                        ))}
                        {stats.action_counts.length === 0 && (
                            <p className="text-xs text-muted-foreground">{t('admin_system.audit_log.stats.no_data')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
