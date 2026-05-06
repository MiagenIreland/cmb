import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole, ROLES, type Role } from "@/lib/roles";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export function LoginPage() {
  const { login } = useRole();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setError("Please fill in all fields and select a role.");
      return;
    }
    login(role as Role);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground mx-auto">
            <Ship className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CMB Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <svg className="h-4 w-4 text-blue-600 shrink-0" viewBox="0 0 21 21" fill="currentColor">
                <path d="M10.5 0C4.701 0 0 4.701 0 10.5S4.701 21 10.5 21 21 16.299 21 10.5 16.299 0 10.5 0zm0 4.2a3.15 3.15 0 110 6.3 3.15 3.15 0 010-6.3zm0 13.65a7.56 7.56 0 01-6.3-3.381c.033-2.079 4.2-3.22 6.3-3.22 2.1 0 6.267 1.141 6.3 3.22A7.56 7.56 0 0110.5 17.85z"/>
              </svg>
              <div>
                <p className="text-xs font-medium text-blue-800">Microsoft SSO coming soon</p>
                <p className="text-xs text-blue-600">Authentication will be handled via Microsoft Single Sign-On</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to CMB's terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
