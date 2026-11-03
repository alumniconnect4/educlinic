import { StatCard } from './StatCard';
import { Skeleton } from './ui/Skeleton';

interface PlatformAnalyticsProps {
  stats: {
    users: number;
    alumni: number;
    admins: number;
    total: number;
  };
  user: any;
  isLoading?: boolean;
}

export function PlatformAnalytics({
  stats,
  user,
  isLoading,
}: PlatformAnalyticsProps) {
  const createChartData = (value: number, _: string, label: string) => [
    { name: label, value: value },
    { name: 'Other', value: stats.total - value > 0 ? stats.total - value : 1 },
  ];

  const cardCount = user?.role === 'SUPER_ADMIN' ? 3 : 2;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">
        Platform Analytics
      </h2>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${user?.role === 'SUPER_ADMIN' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
      >
        {isLoading ? (
          Array.from({ length: cardCount }).map((_, i) => (
            <div
              key={`skeleton-analytics-${i}`}
              className="bg-white border border-gray-200 rounded-sm p-4 flex flex-col space-y-4 shadow-sm animate-pulse h-[280px]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex flex-col items-center space-y-2 py-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="w-28 h-28 rounded-full mx-auto" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Registered Students"
              value={stats.users}
              total={stats.total}
              data={createChartData(stats.users, '#84749f', 'Students')}
              linkTo="/analytics/USER"
            />
            <StatCard
              title="Registered Alumni"
              value={stats.alumni}
              total={stats.total}
              data={createChartData(stats.alumni, '#84749f', 'Alumni')}
              linkTo="/analytics/ALUMNI"
            />
            {user?.role === 'SUPER_ADMIN' && (
              <StatCard
                title="Platform Admins"
                value={stats.admins}
                total={stats.total}
                data={createChartData(stats.admins, '#84749f', 'Admins')}
                linkTo="/analytics/ADMIN"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
