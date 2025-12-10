import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SellerLayout } from '@/components/seller/navigation/SellerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '@/api/apiClient';

/**
 * Seller Application Submission Page
 * Allows sellers to submit their application for approval with required documents
 */

interface ApplicationFormData {
  businessName: string;
  businessAddress: string;
  gstNumber: string;
  panNumber: string;
}

interface DocumentFile {
  gstCertificate?: File;
  panCard?: File;
  addressProof?: File;
  cancelledCheque?: File;
}

export default function SellerApplicationPage() {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const [formData, setFormData] = useState<ApplicationFormData>({
    businessName: '',
    businessAddress: '',
    gstNumber: '',
    panNumber: '',
  });

  const [documents, setDocuments] = useState<DocumentFile>({});
  const [isUploading, setIsUploading] = useState(false);

  // Fetch existing application if any
  const { data: applicationData, isLoading } = useQuery({
    queryKey: ['seller-application', currentUser?.id],
    queryFn: async () => {
      const response = await apiClient.get('/seller/application');
      return response.data;
    },
    enabled: !!currentUser?.id,
  });

  const existingApplication = applicationData?.data;

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData & { documentsSubmitted: string[] }) => {
      const response = await apiClient.post('/seller/application/submit', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to submit application');
    },
  });

  // Upload document function
  const uploadDocument = async (file: File, documentType: string): Promise<string> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const response = await apiClient.post('/seller/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.documentUrl;
  };

  const handleFileChange = (documentType: keyof DocumentFile, file: File | null) => {
    if (file) {
      setDocuments((prev) => ({
        ...prev,
        [documentType]: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.businessName ||
      !formData.businessAddress ||
      !formData.gstNumber ||
      !formData.panNumber
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate required documents
    const requiredDocs = ['gstCertificate', 'panCard', 'cancelledCheque'];
    const missingDocs = requiredDocs.filter((doc) => !documents[doc as keyof DocumentFile]);

    if (missingDocs.length > 0) {
      toast.error('Please upload all required documents');
      return;
    }

    try {
      setIsUploading(true);

      // Upload all documents first
      const uploadPromises = Object.entries(documents).map(async ([type, file]) => {
        if (file) {
          await uploadDocument(file, type);
          return type;
        }
        return null;
      });

      const uploadedDocs = (await Promise.all(uploadPromises)).filter(Boolean) as string[];

      // Submit application with uploaded document info
      await submitApplicationMutation.mutateAsync({
        ...formData,
        documentsSubmitted: uploadedDocs,
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </SellerLayout>
    );
  }

  // If application already exists and is pending/approved
  if (existingApplication) {
    return (
      <SellerLayout>
        <div className="container mx-auto max-w-2xl py-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {existingApplication.status === 'approved' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Application Approved
                  </>
                ) : existingApplication.status === 'rejected' ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Application Rejected
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Application Pending Review
                  </>
                )}
              </CardTitle>
              <CardDescription>Your seller application status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingApplication.status === 'pending' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Under Review</AlertTitle>
                  <AlertDescription>
                    Your application is currently being reviewed by our team. This typically takes
                    1-2 business days.
                  </AlertDescription>
                </Alert>
              )}

              {existingApplication.status === 'approved' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">Congratulations!</AlertTitle>
                  <AlertDescription className="text-green-800">
                    Your seller application has been approved. You now have full access to all
                    seller features.
                  </AlertDescription>
                </Alert>
              )}

              {existingApplication.status === 'rejected' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Application Rejected</AlertTitle>
                  <AlertDescription>
                    {existingApplication.adminNotes ||
                      'Your application did not meet our requirements.'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <h4 className="font-semibold">Application Details</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Name:</span>
                    <span className="font-medium">{existingApplication.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST Number:</span>
                    <span className="font-medium">{existingApplication.gstNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PAN Number:</span>
                    <span className="font-medium">{existingApplication.panNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium">
                      {new Date(existingApplication.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SellerLayout>
    );
  }

  // Application form for new applications
  return (
    <SellerLayout>
      <div className="container mx-auto max-w-3xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Seller Application</CardTitle>
            <CardDescription>
              Complete your seller application to get approved and start selling on Quick-kart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>

                <div className="grid gap-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Your Business Name Pvt Ltd"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="businessAddress">
                    Business Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    placeholder="Complete business address with pincode"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="gstNumber">
                      GST Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="panNumber">
                      PAN Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Required Documents</h3>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Document Requirements</AlertTitle>
                  <AlertDescription>
                    Please upload clear, legible copies of all required documents. Accepted formats:
                    PDF, JPG, PNG (Max 5MB each)
                  </AlertDescription>
                </Alert>

                {/* GST Certificate */}
                <div className="grid gap-2">
                  <Label htmlFor="gstCertificate">
                    GST Certificate <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="gstCertificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange('gstCertificate', e.target.files?.[0] || null)
                      }
                      required
                    />
                    {documents.gstCertificate && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="grid gap-2">
                  <Label htmlFor="panCard">
                    PAN Card <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="panCard"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('panCard', e.target.files?.[0] || null)}
                      required
                    />
                    {documents.panCard && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </div>

                {/* Address Proof */}
                <div className="grid gap-2">
                  <Label htmlFor="addressProof">Address Proof (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="addressProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange('addressProof', e.target.files?.[0] || null)
                      }
                    />
                    {documents.addressProof && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </div>

                {/* Cancelled Cheque */}
                <div className="grid gap-2">
                  <Label htmlFor="cancelledCheque">
                    Cancelled Cheque / Bank Statement <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cancelledCheque"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange('cancelledCheque', e.target.files?.[0] || null)
                      }
                      required
                    />
                    {documents.cancelledCheque && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="submit"
                  disabled={isUploading || submitApplicationMutation.isPending}
                  size="lg"
                >
                  {isUploading || submitApplicationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? 'Uploading Documents...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
