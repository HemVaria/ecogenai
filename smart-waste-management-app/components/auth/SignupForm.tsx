import React, { useState } from 'react';
import { useRealtimeValidation } from '../../hooks/useRealtimeValidation';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import ValidationMessages from './ValidationMessages';
import { Mail, Lock, User } from '../icons';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
    });

    const { usernameError, emailError, passwordError, isFormValid } = useRealtimeValidation(formData, touched);
    const passwordStrength = usePasswordStrength(formData.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) {
            // Handle signup logic here
        }
    };

    return (
        <Card className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={<User />}
                        className={usernameError ? 'border-red-500' : ''}
                    />
                    <ValidationMessages message={usernameError} />
                </div>
                <div className="mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={<Mail />}
                        className={emailError ? 'border-red-500' : ''}
                    />
                    <ValidationMessages message={emailError} />
                </div>
                <div className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={<Lock />}
                        className={passwordError ? 'border-red-500' : ''}
                    />
                    <PasswordStrengthMeter strength={passwordStrength} />
                    <ValidationMessages message={passwordError} />
                </div>
                <Button type="submit" className="w-full mt-4" disabled={!isFormValid}>
                    Sign Up
                </Button>
            </form>
        </Card>
    );
};

export default SignupForm;