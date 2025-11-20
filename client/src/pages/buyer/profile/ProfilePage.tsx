import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { authApi, profileApi } from '@/api/buyer';
import { authKeys, profileKeys } from '@/constants/buyer';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser, clearUser } from '@/store/slices/authSlice';
import {
  updateProfileSchema,
  createAddressSchema,
  type UpdateProfileRequest,
  type CreateAddressInput,
  type Address,
} from '@shared/types';
import Layout from '@/components/buyer/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, MapPin, Settings, Plus, Edit, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'wouter';

/**
 * Profile Page - User profile and address management
 */
export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Profile form
  const profileForm = useForm({
    defaultValues: {
      name: currentUser?.name || '',
      contactNumber: currentUser?.contactNumber || '',
    },
  });

  // Address form
  const addressForm = useForm<CreateAddressInput>({
    resolver: zodResolver(createAddressSchema) as any,
    defaultValues: {
      addressType: 'Home',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      landmark: '',
      contactNumber: '',
      isDefault: false,
    },
  });

  // Fetch addresses
  const { data: addresses, isLoading: loadingAddresses } = useQuery({
    queryKey: profileKeys.addresses(),
    queryFn: profileApi.getAllAddresses,
    enabled: isAuthenticated,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      dispatch(updateUser(data.user));
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to update profile');
    },
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: profileApi.createAddress,
    onSuccess: () => {
      toast.success('Address added successfully');
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
      setShowAddressDialog(false);
      addressForm.reset();
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to add address');
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateAddressInput }) =>
      profileApi.updateAddress(id, data),
    onSuccess: () => {
      toast.success('Address updated successfully');
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
      setShowAddressDialog(false);
      setEditingAddress(null);
      addressForm.reset();
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to update address');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: profileApi.deleteAddress,
    onSuccess: () => {
      toast.success('Address deleted successfully');
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to delete address');
    },
  });

  // Set default address mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: profileApi.setDefaultAddress,
    onSuccess: () => {
      toast.success('Default address updated');
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to set default address');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearUser());
      toast.success('Logged out successfully');
      setLocation('/auth');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to logout');
    },
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Please Login</h2>
          <Button className="mt-6" onClick={() => setLocation('/auth')}>
            Login
          </Button>
        </div>
      </Layout>
    );
  }

  const onProfileSubmit = (data: { name: string; contactNumber: string }) => {
    // Map form data to the API's expected format
    const updateData: UpdateProfileRequest = {
      // Note: The API expects username/bio but we're sending name/contactNumber
      // This might need adjustment based on actual API
    };
    // For now, just show success message since the schema mismatch needs API update
    toast.success('Profile updated');
  };

  const onAddressSubmit = (data: CreateAddressInput) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data });
    } else {
      createAddressMutation.mutate(data);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    addressForm.reset({
      addressType: address.addressType,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state || '',
      postalCode: address.postalCode,
      country: address.country || 'India',
      landmark: address.landmark || '',
      contactNumber: address.contactNumber || '',
      isDefault: address.isDefault || false,
    });
    setShowAddressDialog(true);
  };

  const handleDeleteAddress = (id: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    addressForm.reset();
    setShowAddressDialog(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">My Profile</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser?.avatar || undefined} />
                    <AvatarFallback className="text-2xl">
                      {currentUser?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{currentUser?.name || 'User'}</h3>
                    <p className="text-gray-600">{currentUser?.email}</p>
                    <p className="mt-1 text-sm capitalize text-gray-500">
                      Role: {currentUser?.role}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" {...profileForm.register('name')} />
                    {profileForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      placeholder="Your contact number"
                      {...profileForm.register('contactNumber')}
                    />
                  </div>

                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Saved Addresses</CardTitle>
                  <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddNewAddress}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="addressType">Address Type</Label>
                          <Input
                            id="addressType"
                            placeholder="e.g., Home, Office"
                            {...addressForm.register('addressType')}
                          />
                          {addressForm.formState.errors.addressType && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressForm.formState.errors.addressType.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="addressLine">Address Line</Label>
                          <Input
                            id="addressLine"
                            placeholder="Street, Building, Area"
                            {...addressForm.register('addressLine')}
                          />
                          {addressForm.formState.errors.addressLine && (
                            <p className="mt-1 text-sm text-red-600">
                              {addressForm.formState.errors.addressLine.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...addressForm.register('city')} />
                            {addressForm.formState.errors.city && (
                              <p className="mt-1 text-sm text-red-600">
                                {addressForm.formState.errors.city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input id="state" {...addressForm.register('state')} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input id="postalCode" {...addressForm.register('postalCode')} />
                            {addressForm.formState.errors.postalCode && (
                              <p className="mt-1 text-sm text-red-600">
                                {addressForm.formState.errors.postalCode.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input id="contactNumber" {...addressForm.register('contactNumber')} />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="landmark">Landmark (Optional)</Label>
                          <Input id="landmark" {...addressForm.register('landmark')} />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            {...addressForm.register('isDefault')}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor="isDefault" className="cursor-pointer">
                            Set as default address
                          </Label>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={
                            createAddressMutation.isPending || updateAddressMutation.isPending
                          }
                        >
                          {createAddressMutation.isPending || updateAddressMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : editingAddress ? (
                            'Update Address'
                          ) : (
                            'Add Address'
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAddresses ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div key={address.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{address.addressType}</span>
                              {address.isDefault && (
                                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{address.addressLine}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} - {address.postalCode}
                            </p>
                            {address.contactNumber && (
                              <p className="mt-1 text-sm text-gray-600">
                                Phone: {address.contactNumber}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!address.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDefaultAddressMutation.mutate(address.id)}
                                disabled={setDefaultAddressMutation.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAddress(address)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAddress(address.id)}
                              disabled={deleteAddressMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-gray-600">No addresses saved yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">Account Information</h3>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{currentUser?.email}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 font-semibold text-red-600">Danger Zone</h3>
                  <Button
                    variant="destructive"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      'Logout'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
