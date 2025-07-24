"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Shield, 
  Bell, 
  Database,
  Globe,
  Key,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Wallora',
    siteDescription: 'Wall Aura Creator',
    maintenanceMode: false,
    registrationEnabled: true,
    
    // Security Settings
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    requireEmailVerification: true,
    twoFactorAuth: false,
    
    // Content Settings
    maxFileSize: 5,
    allowedFileTypes: ['jpg', 'png', 'gif'],
    autoModeration: true,
    profanityFilter: true,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    
    // Payment Settings
    currency: 'USD',
    taxRate: 0.08,
    subscriptionEnabled: true,
    
    // Analytics Settings
    googleAnalytics: '',
    trackingEnabled: true,
    dataRetention: 90
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  const [emailSettings, setEmailSettings] = useState({
    activity_alert_enabled: true,
    welcome_email_enabled: true,
    plan_update_enabled: true,
  });
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailSaveStatus, setEmailSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Custom email state
  const [customSubject, setCustomSubject] = useState("");
  const [customHtml, setCustomHtml] = useState("");
  const [customSending, setCustomSending] = useState(false);
  const [customStatus, setCustomStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [customResult, setCustomResult] = useState<string | null>(null);

  const [customTo, setCustomTo] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Fetch email settings from backend
    const fetchEmailSettings = async () => {
      setEmailLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/admin/email-settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmailSettings(data);
        }
      } catch (e) {
        // ignore
      }
      setEmailLoading(false);
    };
    fetchEmailSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      const token = localStorage.getItem("token");
      
      // This would call the actual settings update endpoint
      console.log('Saving settings:', settings);
      
      // Simulate API call
      setTimeout(() => {
        setSaving(false);
        setSaveStatus('success');
        setHasChanges(false);
        
        // Reset success status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Settings save error:', error);
      setSaving(false);
      setSaveStatus('error');
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const handleEmailToggle = async (key: 'activity_alert_enabled' | 'welcome_email_enabled' | 'plan_update_enabled', value: boolean) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
    setEmailSaveStatus('idle');
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/email-settings`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailSettings,
          [key]: value
        })
      });
      if (res.ok) {
        setEmailSaveStatus('success');
      } else {
        setEmailSaveStatus('error');
      }
    } catch (e) {
      setEmailSaveStatus('error');
    }
    setTimeout(() => setEmailSaveStatus('idle'), 2000);
  };

  const handleSendCustomEmail = async () => {
    setCustomSending(true);
    setCustomStatus('idle');
    setCustomResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/send-custom-email`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: customSubject,
          htmlContent: customHtml
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCustomStatus('success');
        setCustomResult(`Sent to ${data.sent} users. Failed: ${data.failed}`);
        setCustomSubject("");
        setCustomHtml("");
      } else {
        setCustomStatus('error');
        setCustomResult('Failed to send email');
      }
    } catch (e) {
      setCustomStatus('error');
      setCustomResult('Failed to send email');
    }
    setCustomSending(false);
    setTimeout(() => setCustomStatus('idle'), 3000);
  };

  const handleSendCustomEmailToUser = async () => {
    setCustomSending(true);
    setCustomStatus('idle');
    setCustomResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/send-custom-email`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: customTo,
          subject: customSubject,
          htmlContent: customHtml
        })
      });
      if (res.ok) {
        setCustomStatus('success');
        setCustomResult(`Sent to ${customTo}`);
        setCustomTo("");
        setCustomSubject("");
        setCustomHtml("");
      } else {
        setCustomStatus('error');
        setCustomResult('Failed to send email');
      }
    } catch (e) {
      setCustomStatus('error');
      setCustomResult('Failed to send email');
    }
    setCustomSending(false);
    setTimeout(() => setCustomStatus('idle'), 3000);
  };

  const handleUserSearch = async () => {
    setUserResults([]);
    if (!userSearch) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/users?search=${encodeURIComponent(userSearch)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserResults(data.users.map((u: any) => u.email));
      }
    } catch {}
  };

  const getSaveButtonContent = () => {
    if (saving) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Saving...
        </>
      );
    }
    
    if (saveStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4" />
          Saved Successfully
        </>
      );
    }
    
    if (saveStatus === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4" />
          Save Failed
        </>
      );
    }
    
    return (
      <>
        <Save className="h-4 w-4" />
        Save Settings
      </>
    );
  };

  const getSaveButtonVariant = () => {
    if (saveStatus === 'success') return 'default';
    if (saveStatus === 'error') return 'destructive';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FDEBD0] flex flex-col">
      <div className="max-w-7xl w-full py-12 px-4 mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow mb-2">Admin Settings</h1>
          {/* Add any top-level actions here if needed */}
        </div>
        {/* General Settings */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Temporarily disable the site for maintenance</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registrationEnabled">Allow User Registration</Label>
                <p className="text-sm text-gray-500">Enable or disable new user registrations</p>
              </div>
              <Switch
                id="registrationEnabled"
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Enable 2FA for enhanced security</p>
              </div>
              <Switch
                id="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Content Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes.join(', ')}
                  onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                  placeholder="jpg, png, gif"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoModeration">Auto Moderation</Label>
                <p className="text-sm text-gray-500">Automatically flag inappropriate content</p>
              </div>
              <Switch
                id="autoModeration"
                checked={settings.autoModeration}
                onCheckedChange={(checked) => handleSettingChange('autoModeration', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profanityFilter">Profanity Filter</Label>
                <p className="text-sm text-gray-500">Filter inappropriate language from user content</p>
              </div>
              <Switch
                id="profanityFilter"
                checked={settings.profanityFilter}
                onCheckedChange={(checked) => handleSettingChange('profanityFilter', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggles for admin control */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activityAlertToggle">Activity Alert Emails</Label>
                <p className="text-sm text-gray-500">Send activity alert emails to users</p>
              </div>
              <Switch
                id="activityAlertToggle"
                checked={emailSettings.activity_alert_enabled}
                disabled={emailLoading}
                onCheckedChange={checked => handleEmailToggle('activity_alert_enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="welcomeEmailToggle">Welcome Emails</Label>
                <p className="text-sm text-gray-500">Send welcome emails to new users</p>
              </div>
              <Switch
                id="welcomeEmailToggle"
                checked={emailSettings.welcome_email_enabled}
                disabled={emailLoading}
                onCheckedChange={checked => handleEmailToggle('welcome_email_enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="planUpdateToggle">Plan Update Emails</Label>
                <p className="text-sm text-gray-500">Send an email to users when their plan is updated by admin</p>
              </div>
              <Switch
                id="planUpdateToggle"
                checked={emailSettings.plan_update_enabled}
                disabled={emailLoading}
                onCheckedChange={checked => handleEmailToggle('plan_update_enabled', checked)}
              />
            </div>
            {emailSaveStatus === 'success' && <div className="text-green-600 text-sm">Settings updated!</div>}
            {emailSaveStatus === 'error' && <div className="text-red-600 text-sm">Failed to update settings.</div>}
            <hr className="my-4" />
            {/* Custom email form */}
            <div>
              <h3 className="text-lg font-bold mb-2">Send Custom Email to All Users</h3>
              <div className="mb-2">
                <Label htmlFor="customSubject">Subject</Label>
                <Input
                  id="customSubject"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="mb-2"
                />
                <Label htmlFor="customHtml">HTML Content</Label>
                <textarea
                  id="customHtml"
                  value={customHtml}
                  onChange={e => setCustomHtml(e.target.value)}
                  placeholder="Enter HTML content for the email"
                  className="w-full min-h-[120px] border rounded p-2"
                />
              </div>
              <Button onClick={handleSendCustomEmail} disabled={customSending || !customSubject || !customHtml}>
                {customSending ? 'Sending...' : 'Send Email'}
              </Button>
              {customStatus === 'success' && <div className="text-green-600 text-sm mt-2">{customResult}</div>}
              {customStatus === 'error' && <div className="text-red-600 text-sm mt-2">{customResult}</div>}
            </div>
            <hr className="my-4" />
            <div>
              <h3 className="text-lg font-bold mb-2">Send Custom Email to a Specific User</h3>
              <div className="mb-2 flex flex-col gap-2 relative">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor="customTo">User Email</Label>
                    <Input
                      id="customTo"
                      value={customTo}
                      onChange={e => setCustomTo(e.target.value)}
                      placeholder="Enter user email or search..."
                      className="mb-0"
                      onFocus={handleUserSearch}
                      onBlur={() => setTimeout(() => setUserResults([]), 200)}
                      onInput={e => { setUserSearch(e.currentTarget.value); setCustomTo(e.currentTarget.value); }}
                    />
                    {userResults.length > 0 && (
                      <div className="bg-white border rounded shadow absolute z-10 w-72 max-h-40 overflow-y-auto mt-1">
                        {userResults.map(email => (
                          <div key={email} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => { setCustomTo(email); setUserResults([]); }}>{email}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button size="sm" className="h-10 mt-5" onClick={handleUserSearch} disabled={!userSearch}>Search Users</Button>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <Label htmlFor="customSubjectUser">Subject</Label>
                  <Input
                    id="customSubjectUser"
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="mb-0"
                  />
                  <Label htmlFor="customHtmlUser">HTML Content</Label>
                  <textarea
                    id="customHtmlUser"
                    value={customHtml}
                    onChange={e => setCustomHtml(e.target.value)}
                    placeholder="Enter HTML content for the email"
                    className="w-full min-h-[80px] border rounded p-2"
                  />
                </div>
              </div>
              <Button onClick={handleSendCustomEmailToUser} disabled={customSending || !customTo || !customSubject || !customHtml} className="mt-2">
                {customSending ? 'Sending...' : 'Send Email'}
              </Button>
              {customStatus === 'success' && <div className="text-green-600 text-sm mt-2">{customResult}</div>}
              {customStatus === 'error' && <div className="text-red-600 text-sm mt-2">{customResult}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="subscriptionEnabled">Enable Subscriptions</Label>
                <p className="text-sm text-gray-500">Allow users to subscribe to premium plans</p>
              </div>
              <Switch
                id="subscriptionEnabled"
                checked={settings.subscriptionEnabled}
                onCheckedChange={(checked) => handleSettingChange('subscriptionEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics Settings */}
        <Card className="rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#FFF8E1] to-[#FDEBD0] border-2 border-[#FFD700]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Analytics Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
              <Input
                id="googleAnalytics"
                value={settings.googleAnalytics}
                onChange={(e) => handleSettingChange('googleAnalytics', e.target.value)}
                placeholder="GA-XXXXXXXXX"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="trackingEnabled">Enable Tracking</Label>
                <p className="text-sm text-gray-500">Collect analytics data for platform insights</p>
              </div>
              <Switch
                id="trackingEnabled"
                checked={settings.trackingEnabled}
                onCheckedChange={(checked) => handleSettingChange('trackingEnabled', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 