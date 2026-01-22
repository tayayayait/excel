import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkLogs } from '@/hooks/useWorkLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PenSquare,
  Calendar,
  CalendarDays,
  CalendarRange,
  FolderKanban,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const quickLinks = [
  {
    title: '업무 입력',
    description: '오늘의 업무를 기록하세요',
    icon: PenSquare,
    path: '/input',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: '일간 대시보드',
    description: '오늘의 업무 현황',
    icon: Calendar,
    path: '/daily',
    color: 'bg-info/10 text-info',
  },
  {
    title: '주간 대시보드',
    description: '이번 주 업무 비교',
    icon: CalendarDays,
    path: '/weekly',
    color: 'bg-teal/10 text-teal',
  },
  {
    title: '월간 대시보드',
    description: '월간 반복업무 이행률',
    icon: CalendarRange,
    path: '/monthly',
    color: 'bg-amber/10 text-amber',
  },
  {
    title: '프로젝트 현황',
    description: '프로젝트별 진행 상태',
    icon: FolderKanban,
    path: '/projects',
    color: 'bg-chart-4/10 text-chart-4',
  },
];

const Home = () => {
  const { user } = useAuth();
  const { todayLogs } = useWorkLogs();

  const todayMinutes = todayLogs.reduce((sum, log) => sum + log.minutes, 0);
  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-4 p-8 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요{user?.email ? `, ${user.email.split('@')[0]}님` : ''}! 👋
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            {format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko })}
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute left-1/2 bottom-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">오늘 총 업무 시간</p>
              <p className="text-2xl font-bold">
                {todayHours > 0 ? `${todayHours}시간 ` : ''}{todayMins}분
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">오늘 기록 건수</p>
              <p className="text-2xl font-bold">{todayLogs.length}건</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber/10">
              <AlertCircle className="w-6 h-6 text-amber" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">프로젝트 업무</p>
              <p className="text-2xl font-bold">
                {todayLogs.filter(log => log.category === 'P').length}건
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">바로가기</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Card className="card-hover h-full group cursor-pointer">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {link.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{link.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Input Rules */}
      <Card>
        <CardHeader>
          <CardTitle>📝 입력 규칙 안내</CardTitle>
          <CardDescription>업무 기록 시 접두어를 사용하면 자동으로 분류됩니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-sm font-mono">P:</span>
                <span className="font-medium">프로젝트 업무</span>
              </div>
              <p className="text-sm text-muted-foreground">
                예: P:홈페이지 리뉴얼 - 메인 페이지 디자인
              </p>
            </div>
            <div className="p-4 rounded-lg bg-teal/5 border border-teal/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-teal text-teal-foreground text-sm font-mono">R:</span>
                <span className="font-medium">반복 업무</span>
              </div>
              <p className="text-sm text-muted-foreground">
                예: R:일일 보고서 작성
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-muted-foreground/20 text-foreground text-sm font-mono">S:</span>
                <span className="font-medium">기타 업무</span>
              </div>
              <p className="text-sm text-muted-foreground">
                예: S:팀 미팅 참석 (또는 접두어 생략)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
