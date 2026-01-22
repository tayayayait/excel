import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks } from 'date-fns';

export interface WorkLog {
  id: string;
  user_id: string;
  work_date: string;
  description: string;
  minutes: number;
  category: string;
  project_id: string | null;
  recurring_task_id: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkLogInput {
  description: string;
  minutes: number;
  work_date?: string;
  category?: string;
  project_id?: string;
  recurring_task_id?: string;
  tags?: string[];
}

export const useWorkLogs = (date?: Date) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const workDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  const { data: todayLogs = [], isLoading: isLoadingToday } = useQuery({
    queryKey: ['workLogs', 'today', workDate],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('work_date', workDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkLog[];
    },
    enabled: !!user,
  });

  const { data: weeklyLogs = [], isLoading: isLoadingWeekly } = useQuery({
    queryKey: ['workLogs', 'weekly', workDate],
    queryFn: async () => {
      if (!user) return [];
      const weekStart = format(startOfWeek(date || new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(date || new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('work_date', weekStart)
        .lte('work_date', weekEnd)
        .order('work_date', { ascending: true });

      if (error) throw error;
      return data as WorkLog[];
    },
    enabled: !!user,
  });

  const { data: lastWeekLogs = [] } = useQuery({
    queryKey: ['workLogs', 'lastWeek', workDate],
    queryFn: async () => {
      if (!user) return [];
      const lastWeekDate = subWeeks(date || new Date(), 1);
      const weekStart = format(startOfWeek(lastWeekDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(lastWeekDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('work_date', weekStart)
        .lte('work_date', weekEnd)
        .order('work_date', { ascending: true });

      if (error) throw error;
      return data as WorkLog[];
    },
    enabled: !!user,
  });

  const { data: monthlyLogs = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['workLogs', 'monthly', workDate],
    queryFn: async () => {
      if (!user) return [];
      const monthStart = format(startOfMonth(date || new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(date || new Date()), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('work_date', monthStart)
        .lte('work_date', monthEnd)
        .order('work_date', { ascending: true });

      if (error) throw error;
      return data as WorkLog[];
    },
    enabled: !!user,
  });

  const createWorkLog = useMutation({
    mutationFn: async (input: CreateWorkLogInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('work_logs')
        .insert({
          user_id: user.id,
          work_date: input.work_date || workDate,
          description: input.description,
          minutes: input.minutes,
          category: input.category || 'S',
          project_id: input.project_id || null,
          recurring_task_id: input.recurring_task_id || null,
          tags: input.tags || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      toast({
        title: '업무 기록 추가됨',
        description: '업무가 성공적으로 기록되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateWorkLog = useMutation({
    mutationFn: async ({ id, ...input }: Partial<WorkLog> & { id: string }) => {
      const { data, error } = await supabase
        .from('work_logs')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      toast({
        title: '업무 기록 수정됨',
        description: '업무가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteWorkLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      toast({
        title: '업무 기록 삭제됨',
        description: '업무가 성공적으로 삭제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    todayLogs,
    weeklyLogs,
    lastWeekLogs,
    monthlyLogs,
    isLoading: isLoadingToday || isLoadingWeekly || isLoadingMonthly,
    createWorkLog,
    updateWorkLog,
    deleteWorkLog,
  };
};
