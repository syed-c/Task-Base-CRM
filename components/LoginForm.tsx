"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCRMStore } from "@/lib/store";
import { Building2, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { authenticateUser, setCurrentUser } = useCRMStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Login attempt:", { email, password });

    // Simulate API call with authentication
    setTimeout(() => {
      const authenticatedUser = authenticateUser(email, password);
      if (authenticatedUser) {
        console.log(
          "Authentication successful, logging in:",
          authenticatedUser
        );
        setCurrentUser(authenticatedUser);
      } else {
        console.log("Authentication failed for:", email);
        alert("Invalid email or password");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white">
        <CardHeader className="text-center space-y-4 bg-brand-coffee text-white rounded-t-lg">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-white">
            H - S Management
          </CardTitle>
          <CardDescription className="text-white/80">
            Enter your credentials to access the management system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-coffee/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@crm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee bg-white text-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-coffee/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee bg-white text-black"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-coffee hover:bg-brand-coffee-dark text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-black/70">
            <p className="font-medium">Demo credentials:</p>
            <div className="font-mono text-xs bg-brand-offwhite p-3 rounded mt-2 border border-brand-coffee/10">
              <div className="text-black">admin@crm.com</div>
              <div className="text-black">admin123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
