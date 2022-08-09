// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs');
const path = require('path');
var electron_notarize = require('electron-notarize');

module.exports = async function (params) {
    // Only notarize the app on Mac OS only.

    if (params.electronPlatformName !== 'darwin') {
        return;
    }
    console.log('afterSign hook triggered', params);

    const envkeyLoader = require('envkey/loader');

    envkeyLoader.load({
      dotEnvFile: "../envkey-react/.env.development",
      permitted: ["APPLE_ID", "APPLE_ID_PASSWORD"]
    });

    // Same appId in electron-builder.
    let appId = "com.envkey.EnvKeyApp"

    let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
    if (!fs.existsSync(appPath)) {
        throw new Error(`Cannot find application at: ${appPath}`);
    }

    console.log(`Notarizing ${appId} found at ${appPath}`);

    try {
        await electron_notarize.notarize({
            appBundleId: appId,
            appPath: appPath,
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_ID_PASSWORD,
        });
    } catch (error) {
        console.error(error);
    }

    console.log(`Done notarizing ${appId}`);
};

