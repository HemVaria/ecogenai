import React from 'react';
import SignupForm from '../../../components/auth/SignupForm';
import { Card } from '../../../components/ui/Card';

const SignupPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-blue-500">
            <Card className="p-8 shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-white">Create an Account</h1>
                <SignupForm />
            </Card>
        </div>
    );
};

export default SignupPage;