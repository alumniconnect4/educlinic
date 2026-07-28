import { StatCard } from './StatCard';

interface PlatformAnalyticsProps {
  stats: {
    users: number;
    alumni: number;
    admins: number;
    total: number;
  };
  user: any;
}

export function PlatformAnalytics({ stats, user }: PlatformAnalyticsProps) {
  const createChartData = (value: number, _: string, label: string) => [
    { name: label, value: value },
    { name: 'Other', value: stats.total - value > 0 ? stats.total - value : 1 },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">
        Platform Analytics
      </h2>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${user?.role === 'SUPER_ADMIN' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
      >
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
      </div>
    </div>
  );
}
