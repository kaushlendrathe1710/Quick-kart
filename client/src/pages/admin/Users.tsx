import { useState } from 'react';
import { AdminLayout } from '@/components/admin/navigation/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UserFilters,
  UserTable,
  UserDetailsDialog,
  EditUserDialog,
  DeleteUserDialog,
} from '@/components/admin/users';
import {
  useBuyers,
  useSellers,
  useDeliveryPartners,
  useUserStats,
  useUpdateUser,
  useDeleteUser,
  useRecoverUser,
} from '@/hooks/admin/useAdminUsers';
import type { User, UpdateUserRequest } from '@/api/admin/users';
import {
  Users,
  ShoppingBag,
  Truck,
  TrendingUp,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * Admin Users Management Page
 * Manage buyers, sellers, and delivery partners with tabs
 */

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('buyers');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isApproved, setIsApproved] = useState<boolean | 'all'>('all');
  const limit = 20;

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Build filters
  const filters = {
    page,
    limit,
    search: search || undefined,
    isApproved: isApproved === 'all' ? undefined : isApproved,
  };

  // Fetch data based on active tab
  const buyersQuery = useBuyers(activeTab === 'buyers' ? filters : { page: 1, limit: 1 });
  const sellersQuery = useSellers(activeTab === 'sellers' ? filters : { page: 1, limit: 1 });
  const deliveryQuery = useDeliveryPartners(
    activeTab === 'delivery' ? filters : { page: 1, limit: 1 }
  );
  const statsQuery = useUserStats();

  // Mutations
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const recoverUserMutation = useRecoverUser();

  // Get active query based on tab
  const getActiveQuery = () => {
    switch (activeTab) {
      case 'buyers':
        return buyersQuery;
      case 'sellers':
        return sellersQuery;
      case 'delivery':
        return deliveryQuery;
      default:
        return buyersQuery;
    }
  };

  const activeQuery = getActiveQuery();
  const users = activeQuery.data?.data || [];
  const pagination = activeQuery.data?.pagination;
  const isLoading = activeQuery.isLoading;

  // Handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleRecoverUser = (user: User) => {
    recoverUserMutation.mutate(user.id, {
      onSuccess: () => {
        setSelectedUser(null);
      },
    });
  };

  const handleUpdateUser = (id: number, data: UpdateUserRequest) => {
    updateUserMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleConfirmDelete = (userId: number) => {
    deleteUserMutation.mutate(userId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setIsApproved('all');
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
    setSearch('');
    setIsApproved('all');
  };

  // Stats cards data
  const stats = statsQuery.data?.data;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage buyers, sellers, and delivery partners</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buyers</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : stats?.buyers || 0}
              </div>
              <p className="text-xs text-muted-foreground">Regular customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sellers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsQuery.isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  `${stats?.approvedSellers || 0}/${stats?.sellers || 0}`
                )}
              </div>
              <p className="text-xs text-muted-foreground">Approved / Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Partners</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsQuery.isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  `${stats?.approvedDeliveryPartners || 0}/${stats?.deliveryPartners || 0}`
                )}
              </div>
              <p className="text-xs text-muted-foreground">Approved / Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="buyers" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Buyers
            </TabsTrigger>
            <TabsTrigger value="sellers" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Sellers
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-2">
              <Truck className="h-4 w-4" />
              Delivery Partners
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'buyers'
                    ? 'Buyers'
                    : activeTab === 'sellers'
                      ? 'Sellers'
                      : 'Delivery Partners'}
                </CardTitle>
                <CardDescription>
                  Manage and view all{' '}
                  {activeTab === 'buyers'
                    ? 'buyer'
                    : activeTab === 'sellers'
                      ? 'seller'
                      : 'delivery partner'}{' '}
                  accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <UserFilters
                  search={search}
                  onSearchChange={setSearch}
                  isApproved={isApproved}
                  onIsApprovedChange={setIsApproved}
                  onReset={handleResetFilters}
                  showApprovalFilter={activeTab !== 'buyers'}
                />

                {/* Users Table */}
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <UserTable
                    users={users}
                    onView={handleViewUser}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onRecover={handleRecoverUser}
                    showRole={false}
                  />
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Show first page, last page, current page and adjacent pages
                        const showPage =
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          Math.abs(pageNum - page) <= 2;

                        if (!showPage) {
                          // Show ellipsis between page groups
                          if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                            return (
                              <span key={pageNum} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* No results message */}
                {!isLoading && users.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <UserX className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No users found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your filters or search criteria
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <UserDetailsDialog
          user={selectedUser}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />

        <EditUserDialog
          user={selectedUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdateUser}
          isLoading={updateUserMutation.isPending}
        />

        <DeleteUserDialog
          user={selectedUser}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          isLoading={deleteUserMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}
