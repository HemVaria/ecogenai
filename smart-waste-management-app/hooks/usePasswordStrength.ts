import { useState, useEffect } from 'react';

const usePasswordStrength = (password) => {
    const [strength, setStrength] = useState(0);
    const [strengthText, setStrengthText] = useState('');

    useEffect(() => {
        const calculateStrength = () => {
            let score = 0;
            const lengthCriteria = password.length >= 8;
            const numberCriteria = /[0-9]/.test(password);
            const uppercaseCriteria = /[A-Z]/.test(password);
            const lowercaseCriteria = /[a-z]/.test(password);
            const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (lengthCriteria) score += 1;
            if (numberCriteria) score += 1;
            if (uppercaseCriteria) score += 1;
            if (lowercaseCriteria) score += 1;
            if (specialCharCriteria) score += 1;

            setStrength(score);

            switch (score) {
                case 0:
                case 1:
                    setStrengthText('Very Weak');
                    break;
                case 2:
                    setStrengthText('Weak');
                    break;
                case 3:
                    setStrengthText('Moderate');
                    break;
                case 4:
                    setStrengthText('Strong');
                    break;
                case 5:
                    setStrengthText('Very Strong');
                    break;
                default:
                    setStrengthText('');
            }
        };

        calculateStrength();
    }, [password]);

    return { strength, strengthText };
};

export default usePasswordStrength;