export class UsuarioLoginDTO {
    email!: string;
    contrasena!: string;


    static crearUsuarioLogin(email: string, contrasena: string): UsuarioLoginDTO {
        let usuarioLogin = new UsuarioLoginDTO();
        usuarioLogin.email = email;
        usuarioLogin.contrasena = contrasena;
        return usuarioLogin;
    }
}