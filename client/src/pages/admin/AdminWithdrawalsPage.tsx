import { Wallet } from 'lucide-react';
import { AdminWithdrawalManagement } from '@/components/admin/withdrawal/AdminWithdrawalManagement';
import { AdminLayout } from '@/components/admin/navigation/AdminLayout';

export function AdminWithdrawalsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Withdrawal Management</h1>
            <p className="text-muted-foreground">
              Review and process withdrawal requests from sellers and delivery partners
            </p>
          </div>
        </div>

        <AdminWithdrawalManagement />
      </div>
    </AdminLayout>
  );
}

export default AdminWithdrawalsPage;
