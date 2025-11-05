'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const [whatsappSettings, setWhatsappSettings] = useState({
    apiKey: '',
    apiUrl: '',
    senderId: '',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    fromAddress: '',
  });

  const [featureFlags, setFeatureFlags] = useState({
    socialLogin: true,
    publicTrees: true,
    userSearch: true,
    treeExports: false,
  });

  const [rateLimits, setRateLimits] = useState({
    loginAttempts: '5',
    loginWindow: '15',
    apiRequests: '100',
    apiWindow: '15',
    connectionRequests: '10',
    flagReports: '5',
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const handleSaveWhatsApp = () => {
    toast({
      title: 'Settings Saved',
      description: 'WhatsApp API settings updated successfully',
    });
  };

  const handleSaveEmail = () => {
    toast({
      title: 'Settings Saved',
      description: 'Email service settings updated successfully',
    });
  };

  const handleSaveFeatureFlags = () => {
    toast({
      title: 'Settings Saved',
      description: 'Feature flags updated successfully',
    });
  };

  const handleSaveRateLimits = () => {
    toast({
      title: 'Settings Saved',
      description: 'Rate limits updated successfully',
    });
  };

  const handleToggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode);
    toast({
      title: maintenanceMode ? 'Maintenance Mode Disabled' : 'Maintenance Mode Enabled',
      description: maintenanceMode
        ? 'Users can now access the platform'
        : 'Only admins can access the platform',
      variant: maintenanceMode ? 'default' : 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-2 text-gray-600">Configure platform settings and integrations</p>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* WhatsApp API */}
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp API Configuration</CardTitle>
              <CardDescription>
                Configure WhatsApp API for OTP delivery (Gupshup/Interakt/Twilio)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-api-key">API Key</Label>
                <Input
                  id="whatsapp-api-key"
                  type="password"
                  placeholder="Enter API key"
                  value={whatsappSettings.apiKey}
                  onChange={(e) =>
                    setWhatsappSettings({ ...whatsappSettings, apiKey: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-api-url">API URL</Label>
                <Input
                  id="whatsapp-api-url"
                  type="url"
                  placeholder="https://api.gupshup.io/..."
                  value={whatsappSettings.apiUrl}
                  onChange={(e) =>
                    setWhatsappSettings({ ...whatsappSettings, apiUrl: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-sender-id">Sender ID / Phone Number</Label>
                <Input
                  id="whatsapp-sender-id"
                  placeholder="+1234567890"
                  value={whatsappSettings.senderId}
                  onChange={(e) =>
                    setWhatsappSettings({ ...whatsappSettings, senderId: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveWhatsApp}>Save Settings</Button>
                <Button variant="outline">Test Connection</Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Service */}
          <Card>
            <CardHeader>
              <CardTitle>Email Service Configuration</CardTitle>
              <CardDescription>
                Configure SMTP or email service provider (SendGrid/Resend)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.gmail.com"
                  value={emailSettings.smtpHost}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  placeholder="587"
                  value={emailSettings.smtpPort}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input
                  id="smtp-user"
                  placeholder="your-email@gmail.com"
                  value={emailSettings.smtpUser}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  placeholder="Enter password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-address">From Address</Label>
                <Input
                  id="from-address"
                  type="email"
                  placeholder="noreply@keora.com"
                  value={emailSettings.fromAddress}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, fromAddress: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEmail}>Save Settings</Button>
                <Button variant="outline">Send Test Email</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable features platform-wide
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Social Login</p>
                  <p className="text-sm text-gray-500">Allow Google and Facebook login</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featureFlags.socialLogin}
                    onChange={(e) =>
                      setFeatureFlags({ ...featureFlags, socialLogin: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Public Trees</p>
                  <p className="text-sm text-gray-500">Allow users to make trees public</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featureFlags.publicTrees}
                    onChange={(e) =>
                      setFeatureFlags({ ...featureFlags, publicTrees: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">User Search</p>
                  <p className="text-sm text-gray-500">Enable user search functionality</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featureFlags.userSearch}
                    onChange={(e) =>
                      setFeatureFlags({ ...featureFlags, userSearch: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Tree Exports</p>
                  <p className="text-sm text-gray-500">Allow exporting trees as PDF/PNG</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={featureFlags.treeExports}
                    onChange={(e) =>
                      setFeatureFlags({ ...featureFlags, treeExports: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <Button onClick={handleSaveFeatureFlags}>Save Feature Flags</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>
                Configure rate limits to prevent abuse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Login Attempts</Label>
                  <Input
                    type="number"
                    value={rateLimits.loginAttempts}
                    onChange={(e) =>
                      setRateLimits({ ...rateLimits, loginAttempts: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">Max attempts per window</p>
                </div>

                <div className="space-y-2">
                  <Label>Window (minutes)</Label>
                  <Input
                    type="number"
                    value={rateLimits.loginWindow}
                    onChange={(e) =>
                      setRateLimits({ ...rateLimits, loginWindow: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">Time window for login attempts</p>
                </div>

                <div className="space-y-2">
                  <Label>API Requests</Label>
                  <Input
                    type="number"
                    value={rateLimits.apiRequests}
                    onChange={(e) =>
                      setRateLimits({ ...rateLimits, apiRequests: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">Max API calls per window</p>
                </div>

                <div className="space-y-2">
                  <Label>API Window (minutes)</Label>
                  <Input
                    type="number"
                    value={rateLimits.apiWindow}
                    onChange={(e) =>
                      setRateLimits({ ...rateLimits, apiWindow: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">Time window for API calls</p>
                </div>

                <div className="space-y-2">
                  <Label>Connection Requests (daily)</Label>
                  <Input
                    type="number"
                    value={rateLimits.connectionRequests}
                    onChange={(e) =>
                      setRateLimits({ ...rateLimits, connectionRequests: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">Max per user per day</p>
                </div>

                <div className="space-y-2">
                  <Label>Flag Reports (daily)</Label>
                  <Input
                    type="number"
                    value={rateLimits.flagReports}
                    onChange={(e) =>
                      setRateLimits({ ...rateLimits, flagReports: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">Max reports per user per day</p>
                </div>
              </div>

              <Button onClick={handleSaveRateLimits}>Save Rate Limits</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Enable maintenance mode to temporarily block user access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`p-4 rounded-lg border-2 ${
                  maintenanceMode
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <p className="font-semibold text-lg">
                  Status: {maintenanceMode ? '🔴 MAINTENANCE MODE ACTIVE' : '🟢 Platform Active'}
                </p>
                <p className="text-sm mt-1 text-gray-700">
                  {maintenanceMode
                    ? 'Only admins can access the platform'
                    : 'All users can access the platform normally'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Maintenance Message</Label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter message to display to users..."
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This message will be shown to users when they try to access the platform
                </p>
              </div>

              <Button
                onClick={handleToggleMaintenance}
                variant={maintenanceMode ? 'default' : 'destructive'}
              >
                {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
