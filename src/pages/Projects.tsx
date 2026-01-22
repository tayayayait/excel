import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { FolderKanban, Clock, Calendar } from 'lucide-react';
import { format, differenceInDays, eachDayOfInterval, subDays, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProjectWithLogs {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  totalMinutes: number;
  lastActivity: string | null;
  activityDates: string[];
  status: 'active' | 'stagnant';
}

const Projects = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [stagnationDays] = useState(7);

  // Fetch all work logs for projects
  const { data: projectLogs = [] } = useQuery({
    queryKey: ['projectLogs'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'P')
        .order('work_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const projectsWithStats: ProjectWithLogs[] = useMemo(() => {
    const today = startOfDay(new Date());
    
    return projects.map(project => {
      const logs = projectLogs.filter(log => 
        log.project_id === project.id || 
        log.description.toLowerCase().includes(project.name.toLowerCase())
      );

      const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);
      const lastActivity = logs.length > 0 ? logs[0].work_date : null;
      const activityDates = [...new Set(logs.map(log => log.work_date))];

      const daysSinceActivity = lastActivity 
        ? differenceInDays(today, new Date(lastActivity))
        : Infinity;

      const status: 'active' | 'stagnant' = daysSinceActivity <= stagnationDays ? 'active' : 'stagnant';

      return {
        ...project,
        totalMinutes,
        lastActivity,
        activityDates,
        status,
      };
    }).filter(p => p.is_active || p.totalMinutes > 0);
  }, [projects, projectLogs, stagnationDays]);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  // Generate last 30 days for gantt chart
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  const activeCount = projectsWithStats.filter(p => p.status === 'active').length;
  const stagnantCount = projectsWithStats.filter(p => p.status === 'stagnant').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FolderKanban className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 프로젝트</p>
              <p className="text-2xl font-bold">{projectsWithStats.length}개</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Clock className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">활동 중</p>
              <p className="text-2xl font-bold">{activeCount}개</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber/10">
              <Calendar className="w-6 h-6 text-amber" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">정체 ({stagnationDays}일+)</p>
              <p className="text-2xl font-bold">{stagnantCount}개</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectsWithStats.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              title="프로젝트 없음" 
              description="아직 프로젝트 기록이 없습니다. 업무 입력 시 P: 접두어를 사용하세요." 
            />
          </div>
        ) : (
          projectsWithStats.map((project) => (
            <Card key={project.id} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <StatusBadge status={project.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">총 투입 시간</span>
                  <span className="font-medium">{formatTime(project.totalMinutes)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">마지막 활동</span>
                  <span className="font-medium">
                    {project.lastActivity 
                      ? format(new Date(project.lastActivity), 'M월 d일', { locale: ko })
                      : '기록 없음'
                    }
                  </span>
                </div>
                
                {/* Mini Gantt Chart */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">최근 30일 활동</p>
                  <div className="flex gap-0.5">
                    {last30Days.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const hasActivity = project.activityDates.includes(dateStr);
                      const daysSince = project.lastActivity 
                        ? differenceInDays(day, new Date(project.lastActivity))
                        : Infinity;
                      const isStagnantPeriod = daysSince >= 0 && daysSince < stagnationDays;

                      return (
                        <div
                          key={dateStr}
                          className={cn(
                            'h-3 flex-1 rounded-sm transition-colors',
                            hasActivity ? 'bg-primary' :
                            isStagnantPeriod && project.lastActivity && new Date(dateStr) > new Date(project.lastActivity) ? 'bg-amber/40' :
                            'bg-muted'
                          )}
                          title={format(day, 'M월 d일')}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>30일 전</span>
                    <span>오늘</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed Gantt Chart */}
      {projectsWithStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 활동 타임라인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="flex border-b border-border pb-2 mb-2">
                  <div className="w-40 flex-shrink-0 font-medium">프로젝트</div>
                  <div className="flex-1 flex">
                    {last30Days.map((day, i) => (
                      <div 
                        key={i} 
                        className="flex-1 text-center text-xs text-muted-foreground"
                      >
                        {i % 7 === 0 ? format(day, 'M/d') : ''}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rows */}
                {projectsWithStats.map((project) => (
                  <div key={project.id} className="flex items-center py-2 border-b border-border/50 last:border-0">
                    <div className="w-40 flex-shrink-0 truncate pr-2 font-medium text-sm">
                      {project.name}
                    </div>
                    <div className="flex-1 flex h-6">
                      {last30Days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const hasActivity = project.activityDates.includes(dateStr);
                        const daysSinceLastActivity = project.lastActivity && new Date(dateStr) > new Date(project.lastActivity)
                          ? differenceInDays(new Date(dateStr), new Date(project.lastActivity))
                          : 0;
                        const isStagnantPeriod = daysSinceLastActivity >= stagnationDays;

                        return (
                          <div
                            key={dateStr}
                            className={cn(
                              'flex-1 mx-0.5 rounded-sm transition-colors',
                              hasActivity ? 'bg-primary' :
                              isStagnantPeriod ? 'bg-amber/30' :
                              'bg-muted/50'
                            )}
                            title={`${format(day, 'M월 d일')}: ${hasActivity ? '활동 있음' : '활동 없음'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span>기록 있음</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber/30" />
                <span>정체 구간 ({stagnationDays}일+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted/50" />
                <span>기록 없음</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Projects;
