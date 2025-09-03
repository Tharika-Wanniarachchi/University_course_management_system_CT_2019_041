import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password, () => {
        // This callback runs after successful login
        navigate('/dashboard');
      });

      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Failed to log in';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <div className="flex items-center justify-center py-20">
    // <Card className="w-full max-w-md border-none">
    //   <CardHeader className="space-y-1">
    //     <CardTitle className="text-2xl font-bold text-center">
    //       Login
    //     </CardTitle>
    //     <CardDescription className="text-center">
    //       Enter your email and password to access your account
    //     </CardDescription>
    //   </CardHeader>
    <Card className="border border-primary/10 shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-7 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/5"></div>
              <div className="absolute -left-5 -bottom-5 w-20 h-20 rounded-full bg-white/5"></div>
              <div className="relative z-10">
                <div className="w-12 h-1.5 bg-white/30 rounded-full mb-4"></div>
                <h2 className="text-2xl font-bold text-white">Login</h2>
                <p className="text-primary-foreground/90">Enter your email and password to access your account</p>
              </div>
            </div>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-10">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 ">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-10">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-sm text-center text-gray-500">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>

  );
}
