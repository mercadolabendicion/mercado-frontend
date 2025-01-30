export class ActualizarClienteDTO{
   

    cedula!: string;
    direccion!: string;
    correo!: string;
    nombre!: string;

    actualizarCliente(cedula:string, nombre:string, direccion:string, correo:string):ActualizarClienteDTO {
        this.cedula = cedula;
        this.nombre = nombre;
        this.direccion = direccion;
        this.correo = correo;
        return this;
    }

    static crearActualizarClienteDTO(cedula:string, nombre:string, direccion:string, correo:string):ActualizarClienteDTO {
        let cliente = new ActualizarClienteDTO();
        return cliente.actualizarCliente(cedula, nombre, direccion, correo); 
      }
}