import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "student",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Full name is required";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = "Invalid email address";
        break;
      case "password":
        if (value.length < 8) error = "Password must be at least 8 characters";
        break;
      case "password_confirmation":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role, // Make sure this is included
      };

    // Reset all errors
    setErrors({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    });

    // Final validation before submit
    let hasError = false;
    const newErrors = { ...errors };

    // Validate all fields
    for (const field in formData) {
      validateField(field, formData[field as keyof typeof formData]);
      if (newErrors[field as keyof typeof newErrors]) {
        hasError = true;
      }
    }

    if (hasError) {
      // Show error toast if there are validation errors
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await register(submissionData);

      toast({
        title: "Success",
        description:
          formData.role === "lecturer"
            ? "Your lecturer account request has been submitted. Please wait for admin approval."
            : "Account created successfully! You are now logged in.",
      });

      if (formData.role === "student") {
        navigate("/welcome");
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      let errorMessage = "Failed to create account";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join("\n");
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-primary/10 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent p-7 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/5"></div>
        <div className="absolute -left-5 -bottom-5 w-20 h-20 rounded-full bg-white/5"></div>
        <div className="relative z-10">
          <div className="w-12 h-1.5 bg-white/30 rounded-full mb-4"></div>
          <h2 className="text-2xl font-bold text-white">Create an Account</h2>
          <p className="text-primary-foreground/90">
            Enter your details to create a new account
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password ? (
                <p className="text-sm text-red-500">{errors.password}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={errors.password_confirmation ? "border-red-500" : ""}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">
                  {errors.password_confirmation}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
                <Label className="block">Registering As</Label>
                <div className="flex items-center gap-6">
                <label className="flex items-center space-x-2">
                    <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === "student"}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="form-radio text-primary"
                    />
                    <span className="text-sm text-gray-700">Student</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                    type="radio"
                    name="role"
                    value="lecturer"
                    checked={formData.role === "lecturer"}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="form-radio text-primary"
                    />
                    <span className="text-sm text-gray-700">Lecturer</span>
                </label>
                </div>
            </div>
        </div>

        </CardContent>
        <CardFooter className="flex flex-col space-y-4 p-10">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-primary hover:underline"
            >
              Log in
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
