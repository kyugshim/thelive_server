module.exports = {
    googleConfig: { // google Strategy의 환경을 설정합니다.
        clientID: ' ',
        clientSecret: ``,
        callbackURL: `서버주소/auth/google/redirect` // Google Page에서 인증이 끝나면 서버의 "/auth/google/redirect"로 Get 요청을 보냅니다. 
    }
}