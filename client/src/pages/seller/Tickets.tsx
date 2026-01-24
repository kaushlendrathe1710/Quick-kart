import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerTicketKeys } from '@/constants/seller/tickets.keys';
import * as sellerTicketsApi from '@/api/seller/tickets';
import type { CreateSellerTicketRequest } from '@/api/seller/tickets';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Ticket, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import {
  SELLER_ISSUE_TYPES,
  SELLER_ISSUE_TYPE_LABELS,
  TICKET_STATUS_LABELS,
} from '@shared/constants';
import type { SellerIssueType, TicketStatus } from '@shared/types';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';

export default function SellerTicketsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: sellerTicketKeys.list({ status: statusFilter !== 'all' ? statusFilter : undefined }),
    queryFn: () =>
      sellerTicketsApi.getMyTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  });

  // Create ticket mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSellerTicketRequest) => sellerTicketsApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerTicketKeys.all });
      toast.success('Ticket created successfully');
      setIsCreateOpen(false);
    },
    onError: () => {
      toast.error('Failed to create ticket');
    },
  });

  const tickets = ticketsData?.data || [];

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <SellerLayout>
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground">Manage your support tickets and get help</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <CreateTicketDialog onSubmit={createMutation.mutate} />
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-64">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Ticket className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No tickets found. Create a ticket to get support.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                        <Badge className={getStatusColor(ticket.status)}>
                          {TICKET_STATUS_LABELS[ticket.status]}
                        </Badge>
                      </div>
                      <CardDescription>
                        {SELLER_ISSUE_TYPE_LABELS[ticket.issueType]} • Created{' '}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Description</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                  </div>

                  {ticket.adminResponse && (
                    <div className="rounded-lg bg-muted p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <Label className="text-sm font-semibold">Admin Response</Label>
                      </div>
                      <p className="text-sm">{ticket.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}

function CreateTicketDialog({ onSubmit }: { onSubmit: (data: CreateSellerTicketRequest) => void }) {
  const [formData, setFormData] = useState<CreateSellerTicketRequest>({
    issueType: 'product_related' as SellerIssueType,
    subject: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>Describe your issue and we'll help you resolve it.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="issueType">Issue Type</Label>
            <Select
              value={formData.issueType}
              onValueChange={(value) =>
                setFormData({ ...formData, issueType: value as SellerIssueType })
              }
            >
              <SelectTrigger id="issueType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SELLER_ISSUE_TYPES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {SELLER_ISSUE_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of the issue"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about your issue"
              required
              minLength={10}
              maxLength={2000}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Ticket</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
