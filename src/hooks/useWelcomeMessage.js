import { useMemo } from 'react';
import { WELCOME_MESSAGES } from '../utils/helpers';

export const useWelcomeMessage = (userRole) => {
    const welcomeMessage = useMemo(() => {
        // Default to 'student' if role is not found, though userRole should typically be valid
        const messages = WELCOME_MESSAGES[userRole] || WELCOME_MESSAGES.student;
        return messages[Math.floor(Math.random() * messages.length)];
    }, [userRole]);

    return welcomeMessage;
};
