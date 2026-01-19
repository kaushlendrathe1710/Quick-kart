import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

/**
 * User Filters Component
 * Provides search and filtering for user lists
 */

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  isApproved?: boolean | 'all';
  onIsApprovedChange: (value: boolean | 'all') => void;
  onReset: () => void;
  showApprovalFilter?: boolean;
}

export function UserFilters({
  search,
  onSearchChange,
  isApproved = 'all',
  onIsApprovedChange,
  onReset,
  showApprovalFilter = true,
}: UserFiltersProps) {
  const hasFilters = search || isApproved !== 'all';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-4">
        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Approval Status Filter */}
        {showApprovalFilter && (
          <Select
            value={isApproved === 'all' ? 'all' : isApproved ? 'approved' : 'pending'}
            onValueChange={(value) => {
              if (value === 'all') {
                onIsApprovedChange('all');
              } else {
                onIsApprovedChange(value === 'approved');
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Reset Filters Button */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
      )}

      {/* Active Filters Badge */}
      {hasFilters && (
        <Badge variant="secondary" className="ml-auto sm:ml-0">
          <Filter className="mr-1 h-3 w-3" />
          {[search && 'Search', isApproved !== 'all' && 'Status'].filter(Boolean).length} active
        </Badge>
      )}
    </div>
  );
}
