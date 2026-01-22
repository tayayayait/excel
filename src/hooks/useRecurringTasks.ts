import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RecurringTask {
  id: string;
  name: string;
  frequency: string;
  applicable_months: number[] | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useRecurringTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recurringTasks = [], isLoading } = useQuery({
    queryKey: ['recurringTasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as RecurringTask[];
    },
    enabled: !!user,
  });

  const createRecurringTask = useMutation({
    mutationFn: async (input: { name: string; frequency?: string; applicable_months?: number[] }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert({
          name: input.name,
          frequency: input.frequency || 'daily',
          applicable_months: input.applicable_months || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTasks'] });
      toast({
        title: '반복업무 추가됨',
        description: '반복업무가 성공적으로 생성되었습니다.',
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

  const updateRecurringTask = useMutation({
    mutationFn: async ({ id, ...input }: Partial<RecurringTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTasks'] });
      toast({
        title: '반복업무 수정됨',
        description: '반복업무가 성공적으로 수정되었습니다.',
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

  const deleteRecurringTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_tasks')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTasks'] });
      toast({
        title: '반복업무 비활성화됨',
        description: '반복업무가 비활성화되었습니다.',
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
    recurringTasks,
    activeRecurringTasks: recurringTasks.filter((t) => t.is_active),
    isLoading,
    createRecurringTask,
    updateRecurringTask,
    deleteRecurringTask,
  };
};
