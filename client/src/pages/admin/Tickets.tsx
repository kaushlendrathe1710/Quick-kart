import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/navigation/AdminLayout';
import {
  useAllTickets,
  useAddAdminResponse,
  useResolveTicket,
  useCloseTicket,
  useDeleteTicket,
} from '@/hooks/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Ticket } from '@/api/admin/tickets';
import { AdminSellerTicketsTab } from '@/components/admin/AdminSellerTicketsTab';

/**
 * Admin Tickets Management Page
 * View and manage all support tickets from sellers and delivery partners
 */

const TICKET_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const ISSUE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'account_related', label: 'Account' },
  { value: 'payment_issue', label: 'Payment' },
  { value: 'vehicle_issue', label: 'Vehicle' },
  { value: 'delivery_issue', label: 'Delivery' },
  { value: 'technical_problem', label: 'Technical' },
  { value: 'other', label: 'Other' },
];

export default function AdminTicketsPage() {
  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Dialog states
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState<string>('in_progress');

  // Build filters for API call
  const filters = useMemo(() => {
    const f: any = { page, limit };
    if (statusFilter !== 'all') f.status = statusFilter;
    if (issueTypeFilter !== 'all') f.issueType = issueTypeFilter;
    return f;
  }, [statusFilter, issueTypeFilter, page, limit]);

  // Fetch tickets
  const { data: ticketsData, isLoading } = useAllTickets(filters);
  const tickets = ticketsData?.data || [];

  // Mutations
  const addResponseMutation = useAddAdminResponse();
  const resolveTicketMutation = useResolveTicket();
  const closeTicketMutation = useCloseTicket();
  const deleteTicketMutation = useDeleteTicket();

  // Filter tickets by search query (client-side)
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const query = searchQuery.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.id.toString().includes(query)
    );
  }, [tickets, searchQuery]);

  // Handlers
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const handleOpenResponseDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAdminResponse('');
    setResponseStatus('in_progress');
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedTicket || !adminResponse.trim()) return;

    addResponseMutation.mutate(
      {
        id: selectedTicket.id,
        data: { adminResponse, status: responseStatus },
      },
      {
        onSuccess: () => {
          setResponseDialogOpen(false);
          setAdminResponse('');
        },
      }
    );
  };

  const handleResolveTicket = (ticket: Ticket) => {
    resolveTicketMutation.mutate(ticket.id);
  };

  const handleCloseTicket = (ticket: Ticket) => {
    closeTicketMutation.mutate(ticket.id);
  };

  const handleDeleteTicket = () => {
    if (!selectedTicket) return;

    deleteTicketMutation.mutate(selectedTicket.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedTicket(null);
      },
    });
  };

  const handleOpenDeleteDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDeleteDialogOpen(true);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      open: 'destructive',
      in_progress: 'default',
      resolved: 'secondary',
      closed: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const renderIssueTypeBadge = (issueType: string) => {
    const colors: Record<string, string> = {
      account_related: 'bg-blue-100 text-blue-800',
      payment_issue: 'bg-green-100 text-green-800',
      vehicle_issue: 'bg-purple-100 text-purple-800',
      delivery_issue: 'bg-yellow-100 text-yellow-800',
      technical_problem: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      account_related: 'Account',
      payment_issue: 'Payment',
      vehicle_issue: 'Vehicle',
      delivery_issue: 'Delivery',
      technical_problem: 'Technical',
      other: 'Other',
    };

    return (
      <Badge variant="outline" className={`capitalize ${colors[issueType] || ''}`}>
        {labels[issueType] || issueType}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage support tickets from sellers and delivery partners
          </p>
        </div>
        {/* Tabs for Delivery Partner and Seller Tickets */}
        <Tabs defaultValue="delivery-partners" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="delivery-partners">Delivery Partner Tickets</TabsTrigger>
            <TabsTrigger value="sellers">Seller Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="delivery-partners" className="space-y-6">
            {/* Delivery Partner Tickets - Original Content */}
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by ID, subject, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Issue Type Filter */}
                  <Select value={issueTypeFilter} onValueChange={setIssueTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            {/* Tickets Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">No tickets found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                              <TableCell className="font-medium">#{ticket.id}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{ticket.subject}</span>
                                  <span className="line-clamp-1 text-sm text-muted-foreground">
                                    {ticket.description}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{renderIssueTypeBadge(ticket.issueType)}</TableCell>
                              <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                              <TableCell>
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenResponseDialog(ticket)}
                                    >
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      Add Response
                                    </DropdownMenuItem>
                                    {ticket.status !== 'resolved' && (
                                      <DropdownMenuItem onClick={() => handleResolveTicket(ticket)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark Resolved
                                      </DropdownMenuItem>
                                    )}
                                    {ticket.status !== 'closed' && (
                                      <DropdownMenuItem onClick={() => handleCloseTicket(ticket)}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Close Ticket
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleOpenDeleteDialog(ticket)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredTickets.length} ticket(s)
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">Page {page}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={filteredTickets.length < limit}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>{' '}
          </TabsContent>

          <TabsContent value="sellers">
            {/* Seller Tickets Tab */}
            <AdminSellerTicketsTab />
          </TabsContent>
        </Tabs>{' '}
      </div>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details #{selectedTicket?.id}</DialogTitle>
            <DialogDescription>
              {selectedTicket && renderIssueTypeBadge(selectedTicket.issueType)}{' '}
              {selectedTicket && renderStatusBadge(selectedTicket.status)}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Subject</Label>
                <p className="mt-1 text-sm">{selectedTicket.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Description</Label>
                <p className="mt-1 whitespace-pre-wrap text-sm">{selectedTicket.description}</p>
              </div>
              {selectedTicket.adminResponse && (
                <div>
                  <Label className="text-sm font-semibold">Admin Response</Label>
                  <p className="mt-1 whitespace-pre-wrap rounded bg-muted p-3 text-sm">
                    {selectedTicket.adminResponse}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-semibold">Created</Label>
                  <p className="mt-1 text-sm">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedTicket.resolvedAt && (
                  <div>
                    <Label className="text-sm font-semibold">Resolved</Label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedTicket.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Response</DialogTitle>
            <DialogDescription>Respond to ticket #{selectedTicket?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Response Message</Label>
              <Textarea
                id="response"
                placeholder="Enter your response..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="status">Update Status</Label>
              <Select value={responseStatus} onValueChange={setResponseStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!adminResponse.trim() || addResponseMutation.isPending}
            >
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket #{selectedTicket?.id}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTicket} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
