import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scaled width based on screen width percentage
 * @param {number} widthPercent 
 * @returns {number}
 */
export const wp = (widthPercent) => {
    const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel(SCREEN_WIDTH * elemWidth / 100);
};

/**
 * Scaled height based on screen height percentage
 * @param {number} heightPercent 
 * @returns {number}
 */
export const hp = (heightPercent) => {
    const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel(SCREEN_HEIGHT * elemHeight / 100);
};

/**
 * Scale based on width (useful for horizontal spacing, widths)
 * @param {number} size 
 * @returns {number}
 */
export const scale = (size) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scale based on height (useful for vertical spacing, heights)
 * @param {number} size 
 * @returns {number}
 */
export const verticalScale = (size) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Moderated scale for fonts and moderate sizing
 * @param {number} size 
 * @param {number} factor 
 * @returns {number}
 */
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Get screen width
 */
export const screenWidth = SCREEN_WIDTH;

/**
 * Get screen height
 */
export const screenHeight = SCREEN_HEIGHT;

/**
 * Device check for iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Device check for Android
 */
export const isAndroid = Platform.OS === 'android';
