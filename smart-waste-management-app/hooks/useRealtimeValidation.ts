import { useState } from 'react';

const useRealtimeValidation = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8; // Example: Password must be at least 8 characters
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });

        let newErrors = { ...errors };

        if (name === 'email') {
            if (!validateEmail(value)) {
                newErrors.email = 'Invalid email address';
            } else {
                delete newErrors.email;
            }
        }

        if (name === 'password') {
            if (!validatePassword(value)) {
                newErrors.password = 'Password must be at least 8 characters';
            } else {
                delete newErrors.password;
            }
        }

        setErrors(newErrors);
        setIsValid(Object.keys(newErrors).length === 0);
    };

    return {
        values,
        errors,
        isValid,
        handleChange,
    };
};

export default useRealtimeValidation;