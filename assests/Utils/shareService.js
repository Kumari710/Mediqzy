/**
 * Share Service
 * 
 * Provides consistent share functionality across the entire Mediqzy app
 * for sharing prescriptions, test details, reports, orders, etc.
 */

import { Share, Platform } from 'react-native';

/**
 * Share types for different content categories
 */
export const SHARE_TYPES = {
    PRESCRIPTION: 'prescription',
    LAB_TEST: 'lab_test',
    LAB_REPORT: 'lab_report',
    APPOINTMENT: 'appointment',
    ORDER: 'order',
    PHARMACY: 'pharmacy',
    HEALTH_REPORT: 'health_report',
    GENERAL: 'general',
};

/**
 * Generate share content based on type and data
 * @param {string} type - Share type from SHARE_TYPES
 * @param {object} data - Data to share
 * @returns {object} - { title, message, url }
 */
const generateShareContent = (type, data) => {
    switch (type) {
        case SHARE_TYPES.PRESCRIPTION:
            return {
                title: 'Prescription from Mediqzy',
                message: `📋 Prescription Details\n\n` +
                    `Doctor: ${data.doctorName || 'N/A'}\n` +
                    `Date: ${data.date || 'N/A'}\n` +
                    `Patient: ${data.patientName || 'N/A'}\n\n` +
                    `Medicines:\n${data.medicines?.map(m => `• ${m.name} - ${m.dosage || ''}`).join('\n') || 'See attached prescription'}\n\n` +
                    `Downloaded from Mediqzy Healthcare App`,
                url: data.downloadUrl || null,
            };

        case SHARE_TYPES.LAB_TEST:
            return {
                title: 'Lab Test Details - Mediqzy',
                message: `🧪 Lab Test Booking\n\n` +
                    `Test: ${data.testName || 'N/A'}\n` +
                    `Lab: ${data.labName || 'N/A'}\n` +
                    `Price: ₹${data.price || 'N/A'}\n` +
                    `Parameters: ${data.parameters || 'Multiple'}\n` +
                    `Booking ID: ${data.bookingId || 'N/A'}\n\n` +
                    `Book your lab tests on Mediqzy App`,
            };

        case SHARE_TYPES.LAB_REPORT:
            return {
                title: 'Lab Report - Mediqzy',
                message: `📊 Lab Report\n\n` +
                    `Test: ${data.testName || 'N/A'}\n` +
                    `Lab: ${data.labName || 'N/A'}\n` +
                    `Date: ${data.date || 'N/A'}\n` +
                    `Report ID: ${data.reportId || 'N/A'}\n` +
                    `Status: ${data.status || 'Completed'}\n\n` +
                    `View your health reports on Mediqzy App`,
                url: data.reportUrl || null,
            };

        case SHARE_TYPES.APPOINTMENT:
            return {
                title: 'Appointment Details - Mediqzy',
                message: `👨‍⚕️ Doctor Appointment\n\n` +
                    `Doctor: ${data.doctorName || 'N/A'}\n` +
                    `Specialty: ${data.specialty || 'N/A'}\n` +
                    `Date: ${data.date || 'N/A'}\n` +
                    `Time: ${data.time || 'N/A'}\n` +
                    `Type: ${data.type === 'online' ? '📹 Online Consultation' : '🏥 Clinic Visit'}\n` +
                    `Booking ID: ${data.bookingId || 'N/A'}\n\n` +
                    `Booked via Mediqzy Healthcare App`,
            };

        case SHARE_TYPES.ORDER:
            return {
                title: 'Order Details - Mediqzy',
                message: `📦 Order Details\n\n` +
                    `Order ID: ${data.orderId || 'N/A'}\n` +
                    `Type: ${data.orderType || 'N/A'}\n` +
                    `Status: ${data.status || 'Processing'}\n` +
                    `Amount: ₹${data.amount || 'N/A'}\n` +
                    `Date: ${data.date || 'N/A'}\n\n` +
                    `Track your orders on Mediqzy App`,
            };

        case SHARE_TYPES.PHARMACY:
            return {
                title: 'Pharmacy Order - Mediqzy',
                message: `💊 Pharmacy Order\n\n` +
                    `Order ID: ${data.orderId || 'N/A'}\n` +
                    `Items: ${data.itemCount || 0} item(s)\n` +
                    `Total: ₹${data.total || 'N/A'}\n` +
                    `Status: ${data.status || 'Processing'}\n` +
                    `Delivery: ${data.deliveryDate || 'N/A'}\n\n` +
                    `Order medicines on Mediqzy App`,
            };

        case SHARE_TYPES.HEALTH_REPORT:
            return {
                title: 'Health Report - Mediqzy',
                message: `📈 Health Report\n\n` +
                    `Report: ${data.reportName || 'Health Summary'}\n` +
                    `Date: ${data.date || 'N/A'}\n` +
                    `Details:\n${data.details || 'See attached report'}\n\n` +
                    `Track your health on Mediqzy App`,
                url: data.reportUrl || null,
            };

        case SHARE_TYPES.GENERAL:
        default:
            return {
                title: data.title || 'Mediqzy Healthcare',
                message: data.message || 'Check out Mediqzy - Your Complete Healthcare Companion!',
                url: data.url || null,
            };
    }
};

/**
 * Share content using native share sheet
 * @param {string} type - Share type from SHARE_TYPES
 * @param {object} data - Data to share
 * @returns {Promise<{success: boolean, action?: string, error?: string}>}
 */
export const shareContent = async (type, data) => {
    try {
        const content = generateShareContent(type, data);

        const shareOptions = {
            title: content.title,
            message: content.message,
        };

        // Add URL for iOS
        if (content.url && Platform.OS === 'ios') {
            shareOptions.url = content.url;
        } else if (content.url) {
            // For Android, append URL to message
            shareOptions.message += `\n\n🔗 ${content.url}`;
        }

        const result = await Share.share(shareOptions, {
            dialogTitle: content.title,
        });

        if (result.action === Share.sharedAction) {
            return {
                success: true,
                action: 'shared',
                activityType: result.activityType,
            };
        } else if (result.action === Share.dismissedAction) {
            return {
                success: true,
                action: 'dismissed',
            };
        }

        return { success: true };

    } catch (error) {
        console.error('[ShareService] Error sharing content:', error);
        return {
            success: false,
            error: error.message || 'Failed to share content',
        };
    }
};

/**
 * Quick share helpers for common use cases
 */
export const sharePrescription = (prescriptionData) =>
    shareContent(SHARE_TYPES.PRESCRIPTION, prescriptionData);

export const shareLabTest = (testData) =>
    shareContent(SHARE_TYPES.LAB_TEST, testData);

export const shareLabReport = (reportData) =>
    shareContent(SHARE_TYPES.LAB_REPORT, reportData);

export const shareAppointment = (appointmentData) =>
    shareContent(SHARE_TYPES.APPOINTMENT, appointmentData);

export const shareOrder = (orderData) =>
    shareContent(SHARE_TYPES.ORDER, orderData);

export const sharePharmacyOrder = (orderData) =>
    shareContent(SHARE_TYPES.PHARMACY, orderData);

export const shareHealthReport = (reportData) =>
    shareContent(SHARE_TYPES.HEALTH_REPORT, reportData);

export const shareGeneral = (data) =>
    shareContent(SHARE_TYPES.GENERAL, data);

/**
 * Share app download link
 */
export const shareApp = async () => {
    return shareContent(SHARE_TYPES.GENERAL, {
        title: 'Download Mediqzy App',
        message: '📱 Download Mediqzy - Your Complete Healthcare Companion!\n\n' +
            '✅ Book Doctor Appointments\n' +
            '✅ Order Lab Tests\n' +
            '✅ Buy Medicines Online\n' +
            '✅ Track Your Health\n' +
            '✅ AI Health Assistant\n\n' +
            'Download now and get 100 Health Coins FREE!',
        url: 'https://play.google.com/store/apps/details?id=com.mediqzyapp',
    });
};

export default {
    SHARE_TYPES,
    shareContent,
    sharePrescription,
    shareLabTest,
    shareLabReport,
    shareAppointment,
    shareOrder,
    sharePharmacyOrder,
    shareHealthReport,
    shareGeneral,
    shareApp,
};
