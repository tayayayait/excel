import { useState } from 'react';
import { useWorkLogs } from '@/hooks/useWorkLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { KPICard } from '@/components/dashboard/KPICard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Clock, FolderKanban, RefreshCw, FileText, CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(168, 76%, 32%)', 'hsl(215, 16%, 47%)'];

const Daily = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { todayLogs, isLoading } = useWorkLogs(selectedDate);

  const totalMinutes = todayLogs.reduce((sum, log) => sum + log.minutes, 0);
  const projectMinutes = todayLogs.filter(log => log.category === 'P').reduce((sum, log) => sum + log.minutes, 0);
  const recurringMinutes = todayLogs.filter(log => log.category === 'R').reduce((sum, log) => sum + log.minutes, 0);
  const otherMinutes = todayLogs.filter(log => log.category === 'S').reduce((sum, log) => sum + log.minutes, 0);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const pieData = [
    { name: '프로젝트', value: projectMinutes, category: 'P' },
    { name: '반복업무', value: recurringMinutes, category: 'R' },
    { name: '기타', value: otherMinutes, category: 'S' },
  ].filter(d => d.value > 0);

  const topTasks = [...todayLogs]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  const barData = topTasks.map(log => ({
    name: log.description.length > 20 ? log.description.slice(0, 20) + '...' : log.description,
    시간: log.minutes,
    category: log.category,
  }));

  // Risk signals
  const hasNoRecurring = todayLogs.filter(log => log.category === 'R').length === 0;
  const hasLowHours = totalMinutes < 240; // Less than 4 hours

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Selection */}
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="총 업무 시간"
          value={formatTime(totalMinutes)}
          icon={Clock}
          variant="primary"
        />
        <KPICard
          title="프로젝트 시간"
          value={formatTime(projectMinutes)}
          subtitle={totalMinutes > 0 ? `${Math.round((projectMinutes / totalMinutes) * 100)}%` : '0%'}
          icon={FolderKanban}
          variant="primary"
        />
        <KPICard
          title="반복업무 시간"
          value={formatTime(recurringMinutes)}
          subtitle={totalMinutes > 0 ? `${Math.round((recurringMinutes / totalMinutes) * 100)}%` : '0%'}
          icon={RefreshCw}
          variant="teal"
        />
        <KPICard
          title="기록 건수"
          value={`${todayLogs.length}건`}
          icon={FileText}
        />
      </div>

      {/* Risk Alerts */}
      {(hasNoRecurring || hasLowHours) && todayLogs.length > 0 && (
        <Card className="border-amber/50 bg-amber/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber">
              <AlertTriangle className="w-5 h-5" />
              리스크 신호
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hasNoRecurring && (
              <div className="flex items-center gap-2">
                <StatusBadge status="warning" label="반복업무 누락" />
                <span className="text-sm text-muted-foreground">오늘 반복업무 기록이 없습니다</span>
              </div>
            )}
            {hasLowHours && (
              <div className="flex items-center gap-2">
                <StatusBadge status="warning" label="낮은 기록 시간" />
                <span className="text-sm text-muted-foreground">총 기록 시간이 4시간 미만입니다</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>시간 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <EmptyState title="데이터 없음" description="기록된 업무가 없습니다" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatTime(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Tasks Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>오늘 한 일 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <EmptyState title="데이터 없음" description="기록된 업무가 없습니다" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => `${v}분`} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => formatTime(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="시간" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>오늘 한 일 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {todayLogs.length === 0 ? (
            <EmptyState title="기록 없음" description="오늘 기록된 업무가 없습니다" />
          ) : (
            <div className="space-y-2">
              {todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${
                      log.category === 'P' ? 'bg-primary' :
                      log.category === 'R' ? 'bg-teal' : 'bg-muted-foreground'
                    }`} />
                    <span className="font-medium">{log.description}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatTime(log.minutes)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Daily;
