import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/api/admin/users';
import { format } from 'date-fns';
import { Mail, Phone, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';

/**
 * User Details Dialog Component
 * Shows detailed information about a user
 */

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { label: 'Buyer', variant: 'default' as const },
      seller: { label: 'Seller', variant: 'secondary' as const },
      deliveryPartner: { label: 'Delivery Partner', variant: 'outline' as const },
      admin: { label: 'Admin', variant: 'destructive' as const },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return (
      <Badge variant={config.variant} className="font-medium">
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View detailed information about this user</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-semibold">{user.name || 'No name set'}</h3>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
              </div>
              <div className="flex gap-2">
                {getRoleBadge(user.role)}
                {user.rejected ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : user.isApproved ? (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Contact Information</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {user.contactNumber || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Account Information</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">
                    {user.role === 'user'
                      ? 'Buyer'
                      : user.role === 'deliveryPartner'
                        ? 'Delivery Partner'
                        : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), 'PPP')}
                  </p>
                </div>
              </div>
              {user.updatedAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(user.updatedAt), 'PPP')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Reason (if applicable) */}
          {user.rejected && user.rejectionReason && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive">Deletion Reason</h4>
                <p className="text-sm text-muted-foreground">{user.rejectionReason}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
