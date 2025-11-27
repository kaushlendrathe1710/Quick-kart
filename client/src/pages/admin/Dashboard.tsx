import { AdminLayout } from '@/components/admin/navigation/AdminLayout';
import { useOpenTickets } from '@/hooks/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

/**
 * Admin Dashboard Page
 * Main dashboard showing overview and quick access to admin features
 */

export default function AdminDashboardPage() {
  const { data: openTicketsData, isLoading, error } = useOpenTickets();

  const openTickets = openTicketsData?.data || [];
  const openTicketsCount = openTickets.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage support tickets and monitor platform activity
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load dashboard data. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Open Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{openTicketsCount}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/tickets">
                  <Button variant="outline" className="gap-2">
                    <LifeBuoy className="h-4 w-4" />
                    View All Tickets
                  </Button>
                </Link>
                <Link href="/admin/tickets?status=open">
                  <Button variant="outline" className="gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Open Tickets
                  </Button>
                </Link>
                <Link href="/admin/tickets?status=in_progress">
                  <Button variant="outline" className="gap-2">
                    <Clock className="h-4 w-4" />
                    In Progress
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Open Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : openTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-3 h-12 w-12 text-green-500" />
                <p className="text-muted-foreground">No open tickets at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openTickets.slice(0, 5).map((ticket) => (
                  <Link key={ticket.id} href={`/admin/tickets`}>
                    <div className="flex cursor-pointer items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            #{ticket.id} - {ticket.subject}
                          </p>
                          <Badge
                            variant={
                              ticket.issueType === 'technical_problem'
                                ? 'destructive'
                                : ticket.issueType === 'payment_issue'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {ticket.issueType === 'account_related'
                              ? 'Account'
                              : ticket.issueType === 'payment_issue'
                                ? 'Payment'
                                : ticket.issueType === 'vehicle_issue'
                                  ? 'Vehicle'
                                  : ticket.issueType === 'delivery_issue'
                                    ? 'Delivery'
                                    : ticket.issueType === 'technical_problem'
                                      ? 'Technical'
                                      : 'Other'}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {ticket.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                  </Link>
                ))}
                {openTickets.length > 5 && (
                  <Link href="/admin/tickets">
                    <Button variant="ghost" className="w-full">
                      View all {openTicketsCount} open tickets
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Welcome to Admin Panel</AlertTitle>
          <AlertDescription>
            Manage support tickets from sellers and delivery partners. Use the navigation menu to
            access different sections.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
}
