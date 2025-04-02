
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, LogOut, RefreshCcw } from "lucide-react";
import { breezeApi, BreezeSession } from '@/lib/breezeApi';
import { toast } from "sonner";

interface BreezeLoginFormProps {
  onLogin: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const BreezeLoginForm: React.FC<BreezeLoginFormProps> = ({ 
  onLogin, 
  onLogout, 
  onRefresh, 
  isRefreshing 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [session, setSession] = useState<BreezeSession>(breezeApi.getSession());
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check authentication status on mount
    setSession(breezeApi.getSession());
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await breezeApi.login(apiKey, secretKey);
      if (success) {
        setSession(breezeApi.getSession());
        onLogin();
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    breezeApi.logout();
    setSession(breezeApi.getSession());
    onLogout();
    toast.info("Logged out successfully");
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound size={20} />
          ICICI Direct Breeze API
        </CardTitle>
        <CardDescription>
          {session.isAuthenticated 
            ? "You are connected to the Breeze API" 
            : "Connect to ICICI Direct Breeze API to fetch real-time market data"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!session.isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Breeze API key"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your Breeze secret key"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Status: Connected</p>
              <p className="text-xs text-muted-foreground mt-1">User ID: {session.userId}</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCcw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex-1"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {session.isAuthenticated 
            ? "Your API keys are securely stored in your browser" 
            : "Your credentials are stored locally and never sent to our servers"}
        </p>
      </CardFooter>
    </Card>
  );
};

export default BreezeLoginForm;
