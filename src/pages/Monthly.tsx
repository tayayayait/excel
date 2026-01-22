import { useState } from 'react';
import { useWorkLogs } from '@/hooks/useWorkLogs';
import { useRecurringTasks } from '@/hooks/useRecurringTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameMonth, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(168, 76%, 32%)', 'hsl(215, 16%, 47%)'];

const Monthly = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { monthlyLogs } = useWorkLogs(selectedDate);
  const { activeRecurringTasks } = useRecurringTasks();

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const currentMonth = selectedDate.getMonth() + 1;

  const prevMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const nextMonth = () => setSelectedDate(addMonths(selectedDate, 1));

  const totalMinutes = monthlyLogs.reduce((sum, log) => sum + log.minutes, 0);
  const projectMinutes = monthlyLogs.filter(log => log.category === 'P').reduce((sum, log) => sum + log.minutes, 0);
  const recurringMinutes = monthlyLogs.filter(log => log.category === 'R').reduce((sum, log) => sum + log.minutes, 0);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  // Recurring task completion check
  const applicableTasks = activeRecurringTasks.filter(task => 
    task.applicable_months?.includes(currentMonth)
  );

  const completedTasks = applicableTasks.filter(task => 
    monthlyLogs.some(log => 
      log.category === 'R' && 
      (log.recurring_task_id === task.id || log.description.toLowerCase().includes(task.name.toLowerCase()))
    )
  );

  const completionRate = applicableTasks.length > 0 
    ? Math.round((completedTasks.length / applicableTasks.length) * 100)
    : 100;

  const incompleteTasks = applicableTasks.filter(task => 
    !monthlyLogs.some(log => 
      log.category === 'R' && 
      (log.recurring_task_id === task.id || log.description.toLowerCase().includes(task.name.toLowerCase()))
    )
  );

  // Calendar heatmap data
  const daysOfMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const logsByDate = monthlyLogs.reduce((acc, log) => {
    if (!acc[log.work_date]) acc[log.work_date] = 0;
    acc[log.work_date] += log.minutes;
    return acc;
  }, {} as Record<string, number>);

  const maxMinutes = Math.max(...Object.values(logsByDate), 1);

  const getHeatmapColor = (minutes: number) => {
    if (minutes === 0) return 'bg-muted';
    const intensity = minutes / maxMinutes;
    if (intensity > 0.7) return 'bg-primary';
    if (intensity > 0.4) return 'bg-primary/60';
    if (intensity > 0) return 'bg-primary/30';
    return 'bg-muted';
  };

  // Pie chart data
  const pieData = [
    { name: '프로젝트', value: projectMinutes },
    { name: '반복업무', value: recurringMinutes },
    { name: '기타', value: totalMinutes - projectMinutes - recurringMinutes },
  ].filter(d => d.value > 0);

  // Get the first day offset
  const firstDayOffset = getDay(monthStart);
  const adjustedOffset = firstDayOffset === 0 ? 6 : firstDayOffset - 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <CalendarIcon className="w-4 h-4" />
            <span className="font-medium">
              {format(selectedDate, 'yyyy년 M월', { locale: ko })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="월간 총시간"
          value={formatTime(totalMinutes)}
          icon={Clock}
          variant="primary"
        />
        <KPICard
          title="프로젝트 시간"
          value={formatTime(projectMinutes)}
          subtitle={totalMinutes > 0 ? `${Math.round((projectMinutes / totalMinutes) * 100)}%` : '0%'}
          variant="primary"
        />
        <KPICard
          title="반복업무 이행률"
          value={`${completionRate}%`}
          subtitle={`${completedTasks.length}/${applicableTasks.length} 완료`}
          icon={RefreshCw}
          variant={completionRate >= 80 ? 'teal' : completionRate >= 50 ? 'amber' : 'destructive'}
        />
        <KPICard
          title="기록일수"
          value={`${Object.keys(logsByDate).length}일`}
          subtitle={`총 ${daysOfMonth.length}일 중`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>월간 기록 히트맵</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground mb-2">
                {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: adjustedOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {/* Day cells */}
                {daysOfMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const minutes = logsByDate[dateStr] || 0;
                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        'aspect-square rounded flex items-center justify-center text-xs transition-all',
                        getHeatmapColor(minutes),
                        minutes > 0 && 'text-primary-foreground'
                      )}
                      title={`${format(day, 'M월 d일')}: ${formatTime(minutes)}`}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>적음</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded bg-muted" />
                  <div className="w-4 h-4 rounded bg-primary/30" />
                  <div className="w-4 h-4 rounded bg-primary/60" />
                  <div className="w-4 h-4 rounded bg-primary" />
                </div>
                <span>많음</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>월간 시간 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <EmptyState title="데이터 없음" description="이 달에 기록된 업무가 없습니다" />
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
      </div>

      {/* Recurring Task Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            반복업무 이행 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicableTasks.length === 0 ? (
            <EmptyState title="반복업무 없음" description="이 달에 적용되는 반복업무가 없습니다" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applicableTasks.map((task) => {
                const isCompleted = completedTasks.includes(task);
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      isCompleted 
                        ? 'bg-success/5 border-success/20' 
                        : 'bg-destructive/5 border-destructive/20'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">{task.frequency}</p>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Monthly;
