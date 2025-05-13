/**
 * User agent generator for Google search
 */

/**
 * Generates a random user agent string mimicking the format of various software versions.
 * The user agent string is composed of:
 * - Lynx version: Lynx/x.y.z where x is 2-3, y is 8-9, and z is 0-2
 * - libwww version: libwww-FM/x.y where x is 2-3 and y is 13-15
 * - SSL-MM version: SSL-MM/x.y where x is 1-2 and y is 3-5
 * - OpenSSL version: OpenSSL/x.y.z where x is 1-3, y is 0-4, and z is 0-9
 * @returns {string} A randomly generated user agent string
 */
function getUserAgent() {
    const lynxVersion = `Lynx/${Math.floor(Math.random() * 2) + 2}.${Math.floor(Math.random() * 2) + 8}.${Math.floor(Math.random() * 3)}`;
    const libwwwVersion = `libwww-FM/${Math.floor(Math.random() * 2) + 2}.${Math.floor(Math.random() * 3) + 13}`;
    const sslMmVersion = `SSL-MM/${Math.floor(Math.random() * 2) + 1}.${Math.floor(Math.random() * 3) + 3}`;
    const opensslVersion = `OpenSSL/${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`;

    return `${lynxVersion} ${libwwwVersion} ${sslMmVersion} ${opensslVersion}`;
}

module.exports = { getUserAgent };