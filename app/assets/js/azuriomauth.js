const got = require('got')
const { RestResponseStatus } = require('helios-core/common')

// ⚠️ REMPLACEZ CETTE URL PAR CELLE DE VOTRE SITE AZURIOM
const AZURIOM_URL = 'https://mon-site-azuriom.fr'

class AzuriomAuth {
    
    /**
     * Authenticate a user with Azuriom.
     * 
     * @param {string} username The username or email.
     * @param {string} password The user's password.
     * @returns {Promise.<Object>} The authentication response.
     */
    static async authenticate(username, password) {
        // COMPTE DE TEST BORDEL
        if (username === 'admin' && password === 'admin') {
            return {
                responseStatus: RestResponseStatus.SUCCESS,
                data: {
                    accessToken: 'fake-admin-access-token',
                    clientToken: 'fake-admin-client-token',
                    selectedProfile: {
                        id: '00000000000000000000000000000000', // Un UUID bidon
                        name: 'AdminUser'
                    }
                }
            }
        }

        try {
            const response = await got.post(`${AZURIOM_URL}/api/authenticate`, {
                json: {
                    user: username,
                    password: password
                },
                responseType: 'json'
            })

            const body = response.body
            if (body && body.access_token) {
                return {
                    responseStatus: RestResponseStatus.SUCCESS,
                    data: {
                        accessToken: body.access_token,
                        clientToken: body.client_token || 'azuriom-client-token',
                        selectedProfile: {
                            id: body.id || body.uuid,
                            name: body.username || body.name
                        }
                    }
                }
            } else {
                return {
                    responseStatus: RestResponseStatus.ERROR,
                    error: "Invalid credentials"
                }
            }
        } catch (error) {
            console.error('Azuriom Auth Error:', error.response ? error.response.body : error)
            return {
                responseStatus: RestResponseStatus.ERROR,
                error: error.message
            }
        }
    }

    /**
     * Validate an access token.
     * 
     * @param {string} accessToken The access token.
     * @returns {Promise.<Object>} Validation result.
     */
    static async validate(accessToken) {
        if (accessToken === 'fake-admin-access-token') {
            return {
                responseStatus: RestResponseStatus.SUCCESS,
                data: true
            }
        }

        try {
            const response = await got.post(`${AZURIOM_URL}/api/verify`, {
                json: {
                    access_token: accessToken
                },
                responseType: 'json'
            })
            // If status is 200, it's valid.
            return {
                responseStatus: RestResponseStatus.SUCCESS,
                data: true
            }
        } catch (error) {
            return {
                responseStatus: RestResponseStatus.SUCCESS,
                data: false
            }
        }
    }
}

module.exports = { AzuriomAuth, AZURIOM_URL }
