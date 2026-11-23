import { useEffect, useState } from 'react';
import {
  Users, UserCheck, UserX, Shield, Activity, UserPlus,
  Briefcase, FolderKanban, BookOpen, Star, Mail, TrendingUp,
} from 'lucide-react';
import dashboardService from '@/services/dashboard.service';
import PageHeader, { StatCard, AlertMessage } from '@/components/admin/PageHeader';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getStats();
      setStats(response.data || {});
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of coaching services, client inquiries, and website activity"
        onRefresh={fetchStats}
        isRefreshing={loading}
      />

      <AlertMessage message={error} />

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Content Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Services" value={loading ? '...' : stats?.total_services} icon={Briefcase} tone="blue" />
        <StatCard title="Projects" value={loading ? '...' : stats?.total_projects} icon={FolderKanban} tone="purple" />
        <StatCard title="Blogs" value={loading ? '...' : stats?.total_blogs} icon={BookOpen} tone="green" />
        <StatCard title="Testimonials" value={loading ? '...' : stats?.total_testimonials} icon={Star} tone="amber" />
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">Lead Management</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Total Inquiries" value={loading ? '...' : stats?.total_inquiries} icon={Mail} tone="blue" />
        <StatCard title="New Leads" value={loading ? '...' : stats?.new_inquiries} icon={TrendingUp} tone="amber" />
        <StatCard title="Converted Leads" value={loading ? '...' : stats?.converted_leads} icon={UserCheck} tone="green" />
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">User Activity</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={loading ? '...' : stats?.total_users} icon={Users} tone="blue" />
        <StatCard title="Active Users" value={loading ? '...' : stats?.active_users} icon={UserCheck} tone="green" />
        <StatCard title="Pending Approval" value={loading ? '...' : stats?.pending_users} icon={UserPlus} tone="amber" />
        <StatCard title="Blocked Users" value={loading ? '...' : stats?.blocked_users} icon={UserX} tone="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        <StatCard title="Total Roles" value={loading ? '...' : stats?.total_roles} icon={Shield} tone="purple" />
        <StatCard title="Logins Today" value={loading ? '...' : stats?.total_logins_today} icon={Activity} tone="blue" />
        <StatCard title="Registrations Today" value={loading ? '...' : stats?.total_registrations_today} icon={UserPlus} tone="green" />
      </div>
    </div>
  );
}
