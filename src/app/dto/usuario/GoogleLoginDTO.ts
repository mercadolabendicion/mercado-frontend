export class GoogleLoginDTO {
    googleToken!: string;

    static crearGoogleLogin(googleToken: string): GoogleLoginDTO {
        let googleLogin = new GoogleLoginDTO();
        googleLogin.googleToken = googleToken;
        return googleLogin;
    }
}
