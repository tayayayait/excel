import { useState } from 'react';
import { useWorkLogs } from '@/hooks/useWorkLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/dashboard/KPICard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Clock, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const Weekly = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { weeklyLogs, lastWeekLogs } = useWorkLogs(selectedDate);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const lastWeekStart = startOfWeek(subWeeks(selectedDate, 1), { weekStartsOn: 1 });

  const prevWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const nextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));

  const thisWeekMinutes = weeklyLogs.reduce((sum, log) => sum + log.minutes, 0);
  const lastWeekMinutes = lastWeekLogs.reduce((sum, log) => sum + log.minutes, 0);
  const changePercent = lastWeekMinutes > 0 
    ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
    : 0;

  const thisWeekProjectMinutes = weeklyLogs.filter(log => log.category === 'P').reduce((sum, log) => sum + log.minutes, 0);
  const thisWeekRecurringMinutes = weeklyLogs.filter(log => log.category === 'R').reduce((sum, log) => sum + log.minutes, 0);

  const thisWeekDays = new Set(weeklyLogs.map(log => log.work_date)).size;
  const lastWeekDays = new Set(lastWeekLogs.map(log => log.work_date)).size;

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  // Prepare line chart data (daily comparison)
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const daysOfLastWeek = eachDayOfInterval({ start: lastWeekStart, end: subWeeks(weekEnd, 1) });

  const lineChartData = daysOfWeek.map((day, index) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const lastWeekDayStr = format(daysOfLastWeek[index], 'yyyy-MM-dd');
    
    const thisWeekDayMinutes = weeklyLogs
      .filter(log => log.work_date === dayStr)
      .reduce((sum, log) => sum + log.minutes, 0);
    
    const lastWeekDayMinutes = lastWeekLogs
      .filter(log => log.work_date === lastWeekDayStr)
      .reduce((sum, log) => sum + log.minutes, 0);

    return {
      day: format(day, 'EEE', { locale: ko }),
      이번주: Math.round(thisWeekDayMinutes / 60 * 10) / 10,
      지난주: Math.round(lastWeekDayMinutes / 60 * 10) / 10,
    };
  });

  // Prepare stacked bar chart data (by category)
  const stackedBarData = daysOfWeek.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayLogs = weeklyLogs.filter(log => log.work_date === dayStr);
    
    return {
      day: format(day, 'EEE', { locale: ko }),
      프로젝트: Math.round(dayLogs.filter(log => log.category === 'P').reduce((sum, log) => sum + log.minutes, 0) / 60 * 10) / 10,
      반복업무: Math.round(dayLogs.filter(log => log.category === 'R').reduce((sum, log) => sum + log.minutes, 0) / 60 * 10) / 10,
      기타: Math.round(dayLogs.filter(log => log.category === 'S').reduce((sum, log) => sum + log.minutes, 0) / 60 * 10) / 10,
    };
  });

  // Project changes
  const projectGroups = weeklyLogs.reduce((acc, log) => {
    if (log.category === 'P') {
      const key = log.project_id || log.description;
      if (!acc[key]) acc[key] = { name: log.description, minutes: 0 };
      acc[key].minutes += log.minutes;
    }
    return acc;
  }, {} as Record<string, { name: string; minutes: number }>);

  const lastProjectGroups = lastWeekLogs.reduce((acc, log) => {
    if (log.category === 'P') {
      const key = log.project_id || log.description;
      if (!acc[key]) acc[key] = { name: log.description, minutes: 0 };
      acc[key].minutes += log.minutes;
    }
    return acc;
  }, {} as Record<string, { name: string; minutes: number }>);

  const projectChanges = Object.entries(projectGroups).map(([key, data]) => {
    const lastWeekData = lastProjectGroups[key];
    const change = lastWeekData ? data.minutes - lastWeekData.minutes : data.minutes;
    return { ...data, change };
  }).sort((a, b) => b.change - a.change);

  const topIncreased = projectChanges.filter(p => p.change > 0).slice(0, 3);
  const topDecreased = projectChanges.filter(p => p.change < 0).sort((a, b) => a.change - b.change).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">
              {format(weekStart, 'M월 d일', { locale: ko })} - {format(weekEnd, 'M월 d일', { locale: ko })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="이번주 총시간"
          value={formatTime(thisWeekMinutes)}
          icon={Clock}
          variant="primary"
        />
        <KPICard
          title="지난주 총시간"
          value={formatTime(lastWeekMinutes)}
          icon={Clock}
        />
        <KPICard
          title="변화량"
          value={`${changePercent > 0 ? '+' : ''}${changePercent}%`}
          icon={changePercent >= 0 ? TrendingUp : TrendingDown}
          variant={changePercent >= 0 ? 'teal' : 'amber'}
        />
        <KPICard
          title="프로젝트 비중"
          value={thisWeekMinutes > 0 ? `${Math.round((thisWeekProjectMinutes / thisWeekMinutes) * 100)}%` : '0%'}
          subtitle={formatTime(thisWeekProjectMinutes)}
          variant="primary"
        />
        <KPICard
          title="반복업무 비중"
          value={thisWeekMinutes > 0 ? `${Math.round((thisWeekRecurringMinutes / thisWeekMinutes) * 100)}%` : '0%'}
          subtitle={formatTime(thisWeekRecurringMinutes)}
          variant="teal"
        />
        <KPICard
          title="기록 일수"
          value={`${thisWeekDays}일`}
          subtitle={`지난주 ${lastWeekDays}일`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Comparison Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>주간 비교 (이번주 vs 지난주)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `${v}h`} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    formatter={(value: number) => `${value}시간`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="이번주" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="지난주" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Stacked Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>일별 구분별 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickFormatter={(v) => `${v}h`} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    formatter={(value: number) => `${value}시간`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="프로젝트" stackId="a" fill="hsl(221, 83%, 53%)" />
                  <Bar dataKey="반복업무" stackId="a" fill="hsl(168, 76%, 32%)" />
                  <Bar dataKey="기타" stackId="a" fill="hsl(var(--muted-foreground))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              증가한 프로젝트 Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topIncreased.length === 0 ? (
              <EmptyState title="데이터 없음" description="증가한 프로젝트가 없습니다" />
            ) : (
              <div className="space-y-3">
                {topIncreased.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                    <span className="font-medium truncate">{project.name}</span>
                    <span className="text-success font-semibold">+{formatTime(project.change)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber" />
              감소한 프로젝트 Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDecreased.length === 0 ? (
              <EmptyState title="데이터 없음" description="감소한 프로젝트가 없습니다" />
            ) : (
              <div className="space-y-3">
                {topDecreased.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-amber/5 border border-amber/20">
                    <span className="font-medium truncate">{project.name}</span>
                    <span className="text-amber font-semibold">{formatTime(project.change)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weekly;
