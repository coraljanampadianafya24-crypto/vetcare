# VetCare — gestión de clínica veterinaria

Aplicación web académica para digitalizar el registro de mascotas, la agenda de citas y el historial médico de una clínica veterinaria. Incluye acceso para una cuenta administrativa preconfigurada y registro de clientes. Está construida con Angular 17, TypeScript y Bootstrap, y guarda los cambios en el almacenamiento local del navegador.

## Requisitos

- Node.js 18.13 o superior (se recomienda Node 20 LTS).
- npm 9 o superior.

## Instalación y ejecución

1. Descomprime el ZIP y abre en VS Code la carpeta que contiene `package.json`.
2. Instala las dependencias: `npm install`.
3. Inicia el servidor: `npm start`.
4. Abre `http://localhost:4200` si el navegador no se abre automáticamente.
5. Para generar la versión de producción: `npm run build`. Los archivos se generan en `dist/vetcare`.

## Flujo de la aplicación

- La ruta inicial muestra la portada pública con los cuatro servicios.
- Cada servicio abre una ficha con información breve y opciones.
- El botón de reserva solicita acceso y conserva el servicio seleccionado.
- Después de iniciar sesión o registrarse, el cliente elige mascota, fecha y horario en la reserva.
- Las rutas de gestión están protegidas por `AuthGuard`; el panel se abre bajo `/app`.
- El administrador accede al panel de clínica; el cliente ve únicamente sus mascotas, citas e historiales.

## Funciones disponibles

- Inicio de sesión, cierre de sesión y protección de las rutas internas.
- Registro de cuentas de cliente; el administrador ya está preconfigurado y no se registra desde la pantalla pública.
- Los clientes crean su propia cuenta desde la portada. El administrador inicia sesión desde la portada y accede al panel protegido.
- Los clientes solo consultan sus propias mascotas, citas e historiales; el administrador gestiona la información de toda la clínica.
- Contraseñas de cuentas cliente guardadas como hash SHA-256 con sal en el navegador.
- Panel de inicio con indicadores y próximas citas.
- Registro de mascotas y dueños con validaciones reactivas.
- Búsqueda de pacientes y acceso al historial desde cada mascota.
- Agenda con horarios disponibles; evita reservar dos veces la misma fecha y hora.
- Confirmación y cancelación de citas, además del filtro por estado.
- Consulta y registro de atenciones con diagnóstico, tratamiento y profesional responsable.
- Persistencia en `localStorage`; los datos de ejemplo se cargan al iniciar por primera vez.
- Diseño adaptable a pantallas de computadora y celular.

## Organización del código

```text
src/app/
├── features/
│   ├── public/        # Portada pública y fichas de servicios
│   ├── appointments/  # Agenda y reserva de citas
│   ├── dashboard/     # Inicio e indicadores
│   ├── history/       # Historial y registro de atenciones
│   └── pets/          # Registro y búsqueda de mascotas
├── models/            # Interfaces y tipos de TypeScript
├── services/          # Persistencia y reglas de negocio
└── shared/            # Pipe de estados y directiva de próximas citas
```

Las funcionalidades se separan en módulos de Angular cargados por ruta. `ClinicDataService` concentra las operaciones sobre los datos; los componentes se encargan de la presentación y el manejo de formularios. Los formularios reactivos validan campos obligatorios, edad, correo y teléfono. El pipe `appointmentStatus` presenta etiquetas legibles, y `appUpcomingAppointment` resalta las citas próximas.

## Verificación manual

1. En el primer inicio, VetCare abre la portada pública. Para entrar como administrador, selecciona **Iniciar sesión** y usa `admin@vetcare.pe` / `VetCare2026!`.
2. Desde una ventana nueva o después de cerrar sesión, crea una cuenta desde **Registrarse** en la portada.
3. Inicia sesión con la cuenta de cliente y registra una mascota. La mascota debe quedar asociada a esa cuenta.
4. Intenta guardar el formulario de mascota vacío; deben aparecer mensajes junto a los campos obligatorios.
5. Reserva un horario y vuelve a intentar reservar la misma fecha y hora; el horario debe quedar deshabilitado.
6. Cancela una cita y verifica que su horario se habilite nuevamente.
7. Vuelve a ingresar como administrador, registra una atención y confirma que aparece en el historial.
8. Actualiza el navegador y confirma que la sesión y los datos guardados continúan disponibles.
9. Reduce el ancho de la ventana y revisa que las pantallas se adapten a móvil.

## Alcance de esta versión

Es una demostración académica de frontend. La cuenta administrativa y el almacenamiento de cuentas y datos funcionan en el navegador; no existe servidor de autenticación ni sincronización entre dispositivos. La clave administrativa de demostración está en el código fuente. Este mecanismo sirve para sustentar el flujo y no debe usarse como seguridad en producción.
