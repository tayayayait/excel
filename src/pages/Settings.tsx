import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useRecurringTasks } from '@/hooks/useRecurringTasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { FolderKanban, RefreshCw, Settings as SettingsIcon, Plus, Pencil, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Settings = () => {
  const { isAdmin } = useAuth();
  const { projects, createProject, updateProject } = useProjects();
  const { recurringTasks, createRecurringTask, updateRecurringTask } = useRecurringTasks();

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskFrequency, setNewTaskFrequency] = useState('daily');
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof projects[0] | null>(null);
  const [editingTask, setEditingTask] = useState<typeof recurringTasks[0] | null>(null);

  // if (!isAdmin) {
  //   return <Navigate to="/" replace />;
  // }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    createProject.mutate({
      name: newProjectName,
      description: newProjectDesc,
    });
    setNewProjectName('');
    setNewProjectDesc('');
    setProjectDialogOpen(false);
  };

  const handleCreateTask = () => {
    if (!newTaskName.trim()) return;
    createRecurringTask.mutate({
      name: newTaskName,
      frequency: newTaskFrequency,
    });
    setNewTaskName('');
    setNewTaskFrequency('daily');
    setTaskDialogOpen(false);
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;
    updateProject.mutate({
      id: editingProject.id,
      name: newProjectName,
      description: newProjectDesc,
    });
    setEditingProject(null);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    updateRecurringTask.mutate({
      id: editingTask.id,
      name: newTaskName,
      frequency: newTaskFrequency,
    });
    setEditingTask(null);
    setNewTaskName('');
    setNewTaskFrequency('daily');
  };

  const openEditProject = (project: typeof projects[0]) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDesc(project.description || '');
  };

  const openEditTask = (task: typeof recurringTasks[0]) => {
    setEditingTask(task);
    setNewTaskName(task.name);
    setNewTaskFrequency(task.frequency);
  };

  const toggleProjectActive = (project: typeof projects[0]) => {
    updateProject.mutate({
      id: project.id,
      is_active: !project.is_active,
    });
  };

  const toggleTaskActive = (task: typeof recurringTasks[0]) => {
    updateRecurringTask.mutate({
      id: task.id,
      is_active: !task.is_active,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Badge */}
      <Card className="bg-gradient-to-r from-primary/10 to-teal/10 border-primary/20">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">관리자 설정</p>
            <p className="text-sm text-muted-foreground">프로젝트, 반복업무 및 시스템 설정을 관리합니다</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <FolderKanban className="w-4 h-4" />
            프로젝트 관리
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            반복업무 관리
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            시스템 설정
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>프로젝트 목록</CardTitle>
                <CardDescription>팀에서 사용하는 프로젝트를 관리합니다</CardDescription>
              </div>
              <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    프로젝트 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 프로젝트 추가</DialogTitle>
                    <DialogDescription>팀에서 사용할 새 프로젝트를 생성합니다</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">프로젝트 이름</Label>
                      <Input
                        id="project-name"
                        placeholder="예: 홈페이지 리뉴얼"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-desc">설명 (선택)</Label>
                      <Input
                        id="project-desc"
                        placeholder="프로젝트에 대한 간단한 설명"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleCreateProject} disabled={createProject.isPending}>
                      추가
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <EmptyState title="프로젝트 없음" description="첫 번째 프로젝트를 추가해보세요" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>프로젝트명</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead className="text-center">활성화</TableHead>
                      <TableHead className="w-20">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.description || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={project.is_active}
                            onCheckedChange={() => toggleProjectActive(project)}
                          />
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditProject(project)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>프로젝트 수정</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>프로젝트 이름</Label>
                                  <Input
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>설명</Label>
                                  <Input
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleUpdateProject} disabled={updateProject.isPending}>
                                  저장
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recurring Tasks Tab */}
        <TabsContent value="recurring">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>반복업무 목록</CardTitle>
                <CardDescription>정기적으로 수행해야 하는 업무를 관리합니다</CardDescription>
              </div>
              <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    반복업무 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 반복업무 추가</DialogTitle>
                    <DialogDescription>정기적으로 수행해야 하는 업무를 등록합니다</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-name">업무명</Label>
                      <Input
                        id="task-name"
                        placeholder="예: 일일 보고서 작성"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-frequency">주기</Label>
                      <Select value={newTaskFrequency} onValueChange={setNewTaskFrequency}>
                        <SelectTrigger>
                          <SelectValue placeholder="주기 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">매일</SelectItem>
                          <SelectItem value="weekly">매주</SelectItem>
                          <SelectItem value="monthly">매월</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleCreateTask} disabled={createRecurringTask.isPending}>
                      추가
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {recurringTasks.length === 0 ? (
                <EmptyState title="반복업무 없음" description="첫 번째 반복업무를 추가해보세요" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>업무명</TableHead>
                      <TableHead>주기</TableHead>
                      <TableHead className="text-center">활성화</TableHead>
                      <TableHead className="w-20">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recurringTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded bg-muted text-sm">
                            {task.frequency === 'daily' ? '매일' :
                             task.frequency === 'weekly' ? '매주' : '매월'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={task.is_active}
                            onCheckedChange={() => toggleTaskActive(task)}
                          />
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditTask(task)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>반복업무 수정</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>업무명</Label>
                                  <Input
                                    value={newTaskName}
                                    onChange={(e) => setNewTaskName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>주기</Label>
                                  <Select value={newTaskFrequency} onValueChange={setNewTaskFrequency}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="daily">매일</SelectItem>
                                      <SelectItem value="weekly">매주</SelectItem>
                                      <SelectItem value="monthly">매월</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleUpdateTask} disabled={updateRecurringTask.isPending}>
                                  저장
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>시스템 설정</CardTitle>
              <CardDescription>대시보드 동작에 영향을 주는 설정을 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stagnation-days">프로젝트 정체 기준 (일)</Label>
                  <Input
                    id="stagnation-days"
                    type="number"
                    defaultValue={7}
                    min={1}
                    max={30}
                  />
                  <p className="text-sm text-muted-foreground">
                    지정된 일수 동안 기록이 없으면 정체로 표시됩니다
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outlier-minutes">이상치 기준 (분)</Label>
                  <Input
                    id="outlier-minutes"
                    type="number"
                    defaultValue={480}
                    min={60}
                    max={1440}
                  />
                  <p className="text-sm text-muted-foreground">
                    단일 업무에 이 시간 이상 기록되면 경고를 표시합니다
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button disabled>설정 저장</Button>
                <p className="text-sm text-muted-foreground mt-2">
                  * 설정 저장 기능은 추후 업데이트 예정입니다
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
