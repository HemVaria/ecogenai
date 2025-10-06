import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
    const getStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = getStrength(password);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];

    return (
        <div className="mt-2">
            <div className="h-2 rounded bg-gray-200">
                <div
                    className={`h-full rounded ${strengthColors[strength]} transition-all duration-300`}
                    style={{ width: `${(strength + 1) * 20}%` }}
                />
            </div>
            <p className={`mt-1 text-sm ${strengthColors[strength]}-600`}>
                {strengthLabels[strength]}
            </p>
        </div>
    );
};

export default PasswordStrengthMeter;