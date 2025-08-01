import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('https://lauratek.in:8000/admin/login', { email, password });
      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem("access_token", access_token);
        toast({
          title: "Login Successful",
          description: "Welcome to the Course Platform Dashboard!",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: response.data?.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-info rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Course Platform</CardTitle>
          <p className="text-muted-foreground">Sign in to your admin account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Please use your admin credentials
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;