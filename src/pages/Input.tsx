import { useState } from 'react';
import { useWorkLogs, CreateWorkLogInput } from '@/hooks/useWorkLogs';
import { useProjects } from '@/hooks/useProjects';
import { useRecurringTasks } from '@/hooks/useRecurringTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KPICard } from '@/components/dashboard/KPICard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Clock, FileText, FolderKanban, RefreshCw, Plus, Trash2, CalendarIcon, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const workLogSchema = z.object({
  description: z.string().min(1, '업무 내용을 입력하세요').max(500, '업무 내용은 500자 이하로 입력하세요'),
  minutes: z.number().min(1, '시간은 1분 이상이어야 합니다').max(1440, '시간은 24시간(1440분) 이하여야 합니다'),
});

const InputPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [recurringTaskId, setRecurringTaskId] = useState<string>('');
  const [errors, setErrors] = useState<{ description?: string; minutes?: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const { todayLogs, createWorkLog, updateWorkLog, deleteWorkLog, isLoading } = useWorkLogs(selectedDate);
  const { activeProjects } = useProjects();
  const { activeRecurringTasks } = useRecurringTasks();

  const parseDescription = (desc: string) => {
    const prefixMatch = desc.match(/^([PRS]):/i);
    if (prefixMatch) {
      const category = prefixMatch[1].toUpperCase();
      const cleanDesc = desc.slice(2).trim();
      return { category, description: cleanDesc };
    }
    return { category: 'S', description: desc };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedMinutes = parseInt(minutes);
    const validation = workLogSchema.safeParse({ 
      description, 
      minutes: parsedMinutes 
    });

    if (!validation.success) {
      const fieldErrors: { description?: string; minutes?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'description') fieldErrors.description = err.message;
        if (err.path[0] === 'minutes') fieldErrors.minutes = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const { category, description: cleanDesc } = parseDescription(description);

    const input: CreateWorkLogInput = {
      description: cleanDesc,
      minutes: parsedMinutes,
      work_date: format(selectedDate, 'yyyy-MM-dd'),
      category,
      project_id: projectId === '_none' ? undefined : (projectId || undefined),
      recurring_task_id: recurringTaskId || undefined,
    };

    if (editingId) {
      updateWorkLog.mutate({ id: editingId, ...input });
      setEditingId(null);
    } else {
      createWorkLog.mutate(input);
    }

    setDescription('');
    setMinutes('');
    setProjectId('');
    setRecurringTaskId('');
  };

  const handleEdit = (log: typeof todayLogs[0]) => {
    const prefix = log.category === 'P' ? 'P:' : log.category === 'R' ? 'R:' : '';
    setDescription(`${prefix}${log.description}`);
    setMinutes(log.minutes.toString());
    setProjectId(log.project_id || '');
    setRecurringTaskId(log.recurring_task_id || '');
    setEditingId(log.id);
  };

  const cancelEdit = () => {
    setDescription('');
    setMinutes('');
    setProjectId('');
    setRecurringTaskId('');
    setEditingId(null);
  };

  const totalMinutes = todayLogs.reduce((sum, log) => sum + log.minutes, 0);
  const projectMinutes = todayLogs.filter(log => log.category === 'P').reduce((sum, log) => sum + log.minutes, 0);
  const recurringMinutes = todayLogs.filter(log => log.category === 'R').reduce((sum, log) => sum + log.minutes, 0);

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'P':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">프로젝트</span>;
      case 'R':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal/10 text-teal">반복</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">기타</span>;
    }
  };

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

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? '업무 수정' : '업무 기록 추가'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">업무 내용</Label>
                <Input
                  id="description"
                  placeholder="예: P:홈페이지 리뉴얼 - 메인 페이지 디자인"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(errors.description && 'border-destructive')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes">소요 시간 (분)</Label>
                <Input
                  id="minutes"
                  type="number"
                  placeholder="30"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className={cn(errors.minutes && 'border-destructive')}
                />
                {errors.minutes && (
                  <p className="text-sm text-destructive">{errors.minutes}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>프로젝트 (선택)</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="프로젝트 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">없음</SelectItem>
                    {activeProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createWorkLog.isPending || updateWorkLog.isPending}>
                {editingId ? '수정' : '추가'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  취소
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Today's KPIs */}
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

      {/* Today's Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {format(selectedDate, 'M월 d일', { locale: ko })} 기록 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayLogs.length === 0 ? (
            <EmptyState
              title="기록이 없습니다"
              description="위 폼에서 업무를 기록해보세요"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>구분</TableHead>
                  <TableHead>업무 내용</TableHead>
                  <TableHead className="text-right">소요 시간</TableHead>
                  <TableHead className="w-24">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getCategoryBadge(log.category)}</TableCell>
                    <TableCell className="font-medium">{log.description}</TableCell>
                    <TableCell className="text-right">{formatTime(log.minutes)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(log)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>삭제 확인</AlertDialogTitle>
                              <AlertDialogDescription>
                                이 업무 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteWorkLog.mutate(log.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InputPage;
