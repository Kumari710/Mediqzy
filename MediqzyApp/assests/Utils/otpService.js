import { EMAILJS_CONFIG } from './apiConfig';

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit code
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send an OTP to a target email using EmailJS REST API
 * @param {string} targetEmail - The destination email address
 * @param {string} code - The 6-digit OTP code
 * @returns {Promise<boolean>}
 */
export const sendOTP = async (targetEmail, code) => {
    console.log(`[OTP SERVICE] Sending code ${code} to ${targetEmail}`);

    // Fallback if not configured
    if (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID') {
        console.warn('EMAILJS is not configured. Please get keys from emailjs.com');
        return false;
    }

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: EMAILJS_CONFIG.SERVICE_ID,
                template_id: EMAILJS_CONFIG.TEMPLATE_ID,
                user_id: EMAILJS_CONFIG.PUBLIC_KEY,
                template_params: {
                    otp_code: code,
                    user_email: targetEmail,
                    app_name: 'Smart Health',
                },
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

/**
 * Verify if the entered code matches the sent code
 * @param {string} enteredCode 
 * @param {string} sentCode 
 * @returns {boolean}
 */
export const verifyCode = (enteredCode, sentCode) => {
    return enteredCode === sentCode;
};

export default {
    generateOTP,
    sendOTP,
    verifyCode,
};
