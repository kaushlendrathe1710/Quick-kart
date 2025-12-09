import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Delivery Partner App Download Page
 * Instructs delivery partners to download the mobile app
 */
export default function AppDownloadPage() {
  const appStoreUrl = 'https://apps.apple.com/app/quickkart-delivery'; // Replace with actual URL
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.quickkart.delivery'; // Replace with actual URL

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Smartphone className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl">Welcome, Delivery Partner!</CardTitle>
          <CardDescription className="text-lg">
            Download our mobile app to start accepting deliveries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Why Download Section */}
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 text-xl font-semibold">Why Download the App?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Real-time Order Notifications</p>
                  <p className="text-sm text-gray-600">
                    Get instant alerts for new delivery requests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">GPS Navigation</p>
                  <p className="text-sm text-gray-600">
                    Turn-by-turn directions to pickup and delivery locations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Earnings Tracker</p>
                  <p className="text-sm text-gray-600">
                    Monitor your daily, weekly, and monthly earnings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Easy Communication</p>
                  <p className="text-sm text-gray-600">
                    Chat with customers and support team directly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => window.open(playStoreUrl, '_blank')}
            >
              <Download className="mr-2 h-5 w-5" />
              Download for Android
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => window.open(appStoreUrl, '_blank')}
            >
              <Download className="mr-2 h-5 w-5" />
              Download for iOS
            </Button>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
            <p className="font-medium text-blue-900">📱 Already have the app installed?</p>
            <p className="mt-1 text-blue-700">
              Open the app and log in with the email address you just registered with.
            </p>
          </div>

          {/* Support */}
          <div className="text-center text-sm text-gray-600">
            <p>
              Need help?{' '}
              <a href="mailto:support@quickkart.com" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
