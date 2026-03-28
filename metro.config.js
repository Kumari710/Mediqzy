const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: {
        // Unstable settings to handle export maps in node_modules
        unstable_enablePackageExports: false,
        resolveRequest: (context, moduleName, platform) => {
            // If the module name ends with .js, try to resolve it without the extension if it fails
            if (moduleName.endsWith('.js') && (moduleName.startsWith('./') || moduleName.startsWith('../'))) {
                try {
                    return context.resolveRequest(context, moduleName.slice(0, -3), platform);
                } catch (e) {
                    // fallback to default
                }
            }
            return context.resolveRequest(context, moduleName, platform);
        },
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

