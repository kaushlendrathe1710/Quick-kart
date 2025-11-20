import { useState } from 'react';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import { useAppSelector } from '@/store/hooks';
import { useSellerProfile } from '@/hooks/seller/useSellerProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, Building2, Mail, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { data: profileData, isLoading } = useSellerProfile();

  const profile = profileData?.data;

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Profile</h1>
          <p className="text-muted-foreground">Manage your business and account information</p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{currentUser?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{currentUser?.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{currentUser?.contactNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {currentUser?.createdAt
                          ? new Date(currentUser.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Approval Status</Label>
                  <div className="flex items-center gap-2">
                    {currentUser?.isApproved ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approved
                      </Badge>
                    ) : currentUser?.rejected ? (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>Your registered business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : profile ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.businessName || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.businessType || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.gstNumber || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.panNumber || 'Not provided'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No business information available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Banking Information</CardTitle>
            <CardDescription>For payment settlements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : profile ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.accountHolderName || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.accountNumber ? '••••••' + profile.accountNumber.slice(-4) : 'Not provided'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.bankName || 'Not provided'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <div className="rounded-md border px-3 py-2">
                    {profile.ifscCode || 'Not provided'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No banking information available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}

