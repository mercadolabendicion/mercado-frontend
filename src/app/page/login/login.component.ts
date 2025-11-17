import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioLoginDTO } from 'src/app/dto/usuario/UsuarioLoginDTO';
import { GoogleLoginDTO } from 'src/app/dto/usuario/GoogleLoginDTO';
import { environment } from 'src/app/env/env';
import { HttpLoginService} from 'src/app/services/http-services/httpLogin.service';
import { AlertService } from 'src/app/utils/alert.service';
import { AuthService } from 'src/app/services/shared/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  mensajeLogin: string = '';

  loginForm!: FormGroup;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private httploginService: HttpLoginService = inject(HttpLoginService);
  private router: Router = inject(Router);
  private alert: AlertService = inject(AlertService);
  private authService: AuthService = inject(AuthService);
  public nombreNegocio: string = environment.nombreNegocio;
  private googleClientId: string = environment.googleClientId;

  ngOnInit(): void {
    this.buildForm();
    if(this.authService.isAuthenticated()){
      this.router.navigate(['/app/principal']);
    }
    this.initializeGoogleSignIn();
  }

  /**
   * Este método se encarga de construir el formulario de login
   */
  private buildForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Este método se encarga de abrir la página principal
   */
  protected abrir(){
    this.router.navigate(['/app/principal']);
  }

  /**
   * Este método se encarga de realizar el login
   */
  protected login(): void {
    if (this.loginForm.invalid) return;
    const { username , password } = this.loginForm.value;
    let usuarioLogin = UsuarioLoginDTO.crearUsuarioLogin(username, password);

    this.httploginService.login(usuarioLogin)
      .subscribe({
        next: response => {
          // Store JWT token as cookie
          if (response.token) {
            this.authService.setToken(response.token);
          }
          // Store full UsuarioDTO so other components can read name/photo
          try {
            localStorage.setItem('usuario', JSON.stringify(response));
          } catch (e) {
            // ignore storage errors
          }
          // Keep id in localStorage for backward compatibility if needed
          localStorage.setItem('id', response.id+""); 
          this.mensajeLogin = response+"";
          this.router.navigate(['/app/principal']);
          },
        error: (error) => {this.alert.simpleErrorAlert(error.error.mensaje);} 
      });
  }

  /**
   * Este método inicializa Google Sign-In
   */
  private initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: this.handleGoogleSignIn.bind(this)
      });
      
      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { 
          theme: 'outline', 
          size: 'large',
          width: 300,
          text: 'signin_with',
          logo_alignment: 'left'
        }
      );
    }
  }

  /**
   * Este método maneja la respuesta de Google Sign-In
   */
  private handleGoogleSignIn(response: any): void {
    const googleToken = response.credential;
    const googleLoginData = GoogleLoginDTO.crearGoogleLogin(googleToken);

    this.httploginService.googleLogin(googleLoginData)
      .subscribe({
        next: response => {
          if (response.token) {
            this.authService.setToken(response.token);
          }
          // Save full user object too
          try { localStorage.setItem('usuario', JSON.stringify(response)); } catch (e) {}
          localStorage.setItem('id', response.id+"");
          this.router.navigate(['/app/principal']);
        },
        error: (error) => {
          this.alert.simpleErrorAlert(error.error?.mensaje || 'Error al iniciar sesión con Google');
        }
      });
  }

}