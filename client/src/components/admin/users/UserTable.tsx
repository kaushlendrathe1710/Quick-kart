import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Edit, Trash2, RefreshCcw, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/api/admin/users';
import { formatDistanceToNow } from 'date-fns';

/**
 * User Table Component
 * Displays a table of users with action buttons
 */

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRecover?: (user: User) => void;
  isLoading?: boolean;
  showRole?: boolean;
}

export function UserTable({
  users,
  onView,
  onEdit,
  onDelete,
  onRecover,
  isLoading = false,
  showRole = false,
}: UserTableProps) {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { label: 'Buyer', variant: 'default' as const },
      seller: { label: 'Seller', variant: 'secondary' as const },
      deliveryPartner: { label: 'Delivery', variant: 'outline' as const },
      admin: { label: 'Admin', variant: 'destructive' as const },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return (
      <Badge variant={config.variant} className="font-medium">
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (user.rejected) {
      return (
        <Badge variant="destructive" className="font-medium">
          Deleted
        </Badge>
      );
    }
    if (user.isApproved) {
      return (
        <Badge variant="default" className="bg-green-600 font-medium hover:bg-green-700">
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-medium">
        Pending
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

  if (users.length === 0 && !isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">User</TableHead>
            <TableHead>Contact</TableHead>
            {showRole && <TableHead>Role</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              {/* User Info */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name || user.email} />
                    <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name || 'No name'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>

              {/* Contact */}
              <TableCell>
                <div className="text-sm">{user.contactNumber || 'N/A'}</div>
              </TableCell>

              {/* Role */}
              {showRole && <TableCell>{getRoleBadge(user.role)}</TableCell>}

              {/* Status */}
              <TableCell>{getStatusBadge(user)}</TableCell>

              {/* Joined Date */}
              <TableCell>
                <div className="text-sm">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {!user.rejected && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.rejected && onRecover && (
                      <DropdownMenuItem onClick={() => onRecover(user)} className="text-green-600">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Recover User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
