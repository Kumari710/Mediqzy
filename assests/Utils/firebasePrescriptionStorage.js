/**
 * Firebase Prescription Storage Service
 * 
 * Manages prescription uploads and metadata in Firebase
 */

import { getCurrentUser } from './firebaseAuth';
import { db, pushData, createNotification } from './firebaseDatabase';

/**
 * Save prescription metadata to Firebase
 * @param {Array} files - Array of picked file objects
 * @returns {Promise<{success: boolean, key?: string, error?: string}>}
 */
export const savePrescription = async (files) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'No user logged in' };
    }

    try {
        const userId = user.uid;
        const prescriptionData = {
            userId: userId,
            userEmail: user.email || user.phoneNumber || 'Anonymous',
            files: files.map(file => ({
                name: file.name,
                size: file.size,
                // In a real app, we would upload to Firebase Storage and store the URL here.
                // For now, we store the metadata and a placeholder for the file path.
                status: 'uploaded',
                uploadedAt: new Date().toISOString(),
            })),
            status: 'pending_analysis',
            createdAt: new Date().toISOString(),
        };

        // Save to Realtime Database
        const result = await pushData(`prescriptions/${userId}`, prescriptionData);

        if (result.success) {
            // Create notification for user
            await createNotification(userId, {
                type: 'order', // Using 'order' type for prescription updates
                title: 'Prescription Submitted',
                message: 'Your prescription has been received and is being analyzed by our pharmacists.',
                data: { prescriptionId: result.key, type: 'prescription_upload' }
            });

            // Also save to a global prescriptions list for admin view
            await db().ref(`allPrescriptions/${result.key}`).set({
                ...prescriptionData,
                prescriptionId: result.key
            });
        }

        return result;
    } catch (error) {
        console.error('[PrescriptionStorage] Error saving prescription:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user's submitted prescriptions
 * @returns {Promise<Array>}
 */
export const getPrescriptions = async () => {
    const user = getCurrentUser();
    if (!user) return [];

    try {
        const snapshot = await db().ref(`prescriptions/${user.uid}`).once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value
            })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return [];
    } catch (error) {
        console.error('[PrescriptionStorage] Error fetching prescriptions:', error);
        return [];
    }
};

/**
 * Get all available products (Drug Details) from Firebase
 * @returns {Promise<Array>}
 */
export const getPharmacyProducts = async () => {
    try {
        const snapshot = await db().ref('pharmacyProducts').once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data)
                .map(([key, value]) => ({
                    id: key,
                    ...value
                }))
                .filter(p => p.name && p.price !== undefined);
        }
        return [];
    } catch (error) {
        console.error('[PrescriptionStorage] Error fetching products:', error);
        return [];
    }
};

/**
 * Initial helper to populate products if empty
 * @param {Array} products 
 */
export const seedPharmacyProducts = async (products) => {
    try {
        const existing = await getPharmacyProducts();
        if (existing.length === 0) {
            const productsData = {};
            products.forEach(p => {
                productsData[p.id || Date.now() + Math.random()] = {
                    name: p.name,
                    desc: p.desc || p.description,
                    price: p.price,
                    imageName: p.imageName || 'drug1.png', // Reference to local asset name
                    category: p.category || 'General',
                };
            });
            await db().ref('pharmacyProducts').set(productsData);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[PrescriptionStorage] Error seeding products:', error);
        return false;
    }
};

/**
 * Update existing products in Firebase with correct imageName
 * @param {Array} defaultProducts - Array of products with correct imageName
 */
export const updatePharmacyProductImages = async (defaultProducts) => {
    try {
        const existing = await getPharmacyProducts();
        if (existing.length > 0) {
            const updates = {};
            existing.forEach(product => {
                // Find matching default product by name
                const defaultProduct = defaultProducts.find(
                    dp => dp.name.toLowerCase() === product.name?.toLowerCase()
                );
                if (defaultProduct && defaultProduct.imageName) {
                    updates[`pharmacyProducts/${product.id}/imageName`] = defaultProduct.imageName;
                }
            });

            if (Object.keys(updates).length > 0) {
                await db().ref().update(updates);
                console.log('[PrescriptionStorage] Updated product images in Firebase');
            }
        }
    } catch (error) {
        console.error('[PrescriptionStorage] Error updating product images:', error);
    }
};
