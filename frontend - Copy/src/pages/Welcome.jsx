import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";

const Welcome = () => {
    const [mode, setMode] = useState("login");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "student",
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setFormError("");

        try {
            if (mode === "login") {
                const { email, password } = formData;
                const response = await loginUser({ email, password });
                const role = response?.data?.user?.role;
                navigate(
                    role === "admin" ? "/admin/dashboard" : "/student/dashboard"
                );
            } else {
                await registerUser(formData);
                alert("Registration successful! Please login.");
                setMode("login");
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    password_confirmation: "",
                    role: "student",
                });
            }
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
                setFormError("Please correct the errors below.");
            } else {
                setFormError("Unexpected error. Try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-30" />
                <div className="absolute -left-40 bottom-0 w-80 h-80 rounded-full bg-accent/10 blur-3xl opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="w-full gap-10 items-stretch relative z-10 min-h-screen">
                {/* Left: Brand */}
                <motion.div
                    className="h-full flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 group">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primary">
                                    EduNexus
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    COURSE MANAGEMENT SYSTEM
                                </p>
                            </div>
                        </div>
                        <h2 className="text-5xl font-bold text-foreground leading-tight">
                            University{" "}
                            <span className="text-primary">
                                Course Management
                            </span>{" "}
                            System
                        </h2>
                        <p className="text-muted-foreground max-w-md text-lg">
                            Streamline course offerings, manage student
                            registrations, and track academic results – all in
                            one powerful platform.
                        </p>
                        <div className="flex items-center space-x-4 pt-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="h-11 w-11 rounded-full border-2 flex items-center justify-center shadow-sm"
                                        style={{
                                            backgroundColor: `hsl(151 64% ${
                                                90 - i * 5
                                            }%)`,
                                            borderColor: `hsl(151 64% ${
                                                85 - i * 3
                                            }%)`,
                                        }}
                                    >
                                        <span className="text-sm font-medium text-primary">
                                            E{i}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Trusted by universities and educational
                                institutions
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right: Auth Form */}
            <div className="w-full gap-10 items-stretch relative z-10 min-h-screen">
                <motion.div
                    className="h-full flex items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border border-primary shadow-xl rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-accent p-6 text-white space-y-1">
                            <div className="w-12 h-1.5 bg-white/30 rounded-full mb-2" />
                            <h3 className="text-2xl font-bold">
                                {mode === "login"
                                    ? "University Access"
                                    : "Register Account"}
                            </h3>
                            <p className="text-white/90 text-sm">
                                {mode === "login"
                                    ? "Sign in to manage courses and student data"
                                    : "Create an account to get started"}
                            </p>
                        </div>

                        <CardContent className="p-6 space-y-6">
                            {formError && (
                                <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
                                    {formError}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {mode === "register" && (
                                    <div className="space-y-1">
                                        <Label>Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-muted-foreground" />
                                            <Input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-sm text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <Label>Email address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-muted-foreground" />
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            placeholder="you@university.edu"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label>Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-muted-foreground" />
                                        <Input
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {mode === "register" && (
                                    <>
                                        <div className="space-y-1">
                                            <Label>Confirm Password</Label>
                                            <Input
                                                name="password_confirmation"
                                                type="password"
                                                value={
                                                    formData.password_confirmation
                                                }
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-600">
                                                    {
                                                        errors.password_confirmation
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Role</Label>
                                            <div className="flex gap-4 mt-1">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="student"
                                                        checked={
                                                            formData.role ===
                                                            "student"
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                    <span>Student</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="role"
                                                        value="admin"
                                                        checked={
                                                            formData.role ===
                                                            "admin"
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                    <span>Admin</span>
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-base font-semibold"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? mode === "login"
                                            ? "Signing in..."
                                            : "Registering..."
                                        : mode === "login"
                                        ? "Sign In"
                                        : "Register"}
                                </Button>
                            </form>

                            <p className="text-sm text-center text-muted-foreground">
                                {mode === "login" ? (
                                    <>
                                        Don’t have an account?{" "}
                                        <button
                                            type="button"
                                            className="text-primary hover:underline"
                                            onClick={() => setMode("register")}
                                        >
                                            Register
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already registered?{" "}
                                        <button
                                            type="button"
                                            className="text-primary hover:underline"
                                            onClick={() => setMode("login")}
                                        >
                                            Login
                                        </button>
                                    </>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Welcome;
