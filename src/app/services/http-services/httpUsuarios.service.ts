import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/env';
import { UsuarioDTO } from '../../dto/usuario/UsuarioDTO';
import { CrearUsuarioDTO } from '../../dto/usuario/CrearUsuarioDTO';
import { ActualizarUsuarioDTO } from '../../dto/usuario/ActualizarUsuarioDTO';

@Injectable({
  providedIn: 'root'
})
export class HttpUsuariosService {
  private URL_API: string = environment.ApiUrl;
  private http: HttpClient = inject(HttpClient);

  public obtenerUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.URL_API}/usuarios`);
  }

  public obtenerUsuarioPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.URL_API}/usuarios/${id}`);
  }

  public crearUsuario(usuario: CrearUsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.URL_API}/usuarios`, usuario);
  }

  public actualizarUsuario(usuario: ActualizarUsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.URL_API}/usuarios`, usuario);
  }

  public eliminarUsuario(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.URL_API}/usuarios/${id}`);
  }
}
