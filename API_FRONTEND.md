# API Frontend — E&M ANIMACIONES

> **Backend:** `http://localhost:8080`  
> **Auth:** `Authorization: Bearer <token>`  
> **Paginacion:** `?page=0&size=10&sort=nombre,asc`  
> **Fechas:** `yyyy-MM-dd` (LocalDate) · `HH:mm:ss` (LocalTime)

---

## 1. AUTENTICACION

### 1.1 Registrar empresa (dueño/admin — solo 1ra vez)

```
POST /api/auth/register-empresa

Body:
{
  "nombreEmpresa": "E&M ANIMACIONES",
  "ruc": "1972492254405",
  "nombreGerente": "Naysha Morales",
  "direccion": "los rosales 1395",
  "telefono": "906761926",
  "adminNombre": "Naysha",
  "adminApellido": "Morales",
  "adminEmail": "naysha@gmail.com",
  "adminPassword": "123456"
}

Response 201:
{
  "proveedorId": 1,
  "nombreEmpresa": "E&M ANIMACIONES",
  "ruc": "1972492254405",
  "token": "eyJ...",
  "adminEmail": "naysha@gmail.com"
}
```

### 1.2 Registrar gerentes/encargados (varias veces, mismo RUC)

```
POST /api/auth/register

Body:
{
  "nombre": "Luis",
  "apellido": "Miguel",
  "email": "luis@gmail.com",
  "password": "123456",
  "telefono": "906761926",
  "ruc": "1972492254405"
}

Response 201:
{
  "token": "eyJ...",
  "email": "luis@gmail.com",
  "nombre": "Luis",
  "apellido": "Miguel",
  "rol": "PROVEEDOR",
  "proveedorId": 1
}
```

### 1.3 Login (ambos flujos)

```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response 200: { "token", "email", "nombre", "apellido", "rol", "proveedorId" }
```

### 1.4 Otros endpoints auth

```
GET  /api/auth/me              → { id, email, nombre, apellido, rol, proveedorId }
GET  /api/auth/proveedor       → datos de la empresa
PUT  /api/auth/proveedor       → editar empresa (logo, terminos, gerente...)
POST /api/auth/change-password → { oldPassword, newPassword }
```

---

## 2. CATEGORIAS Y TEMATICAS

### 2.1 Categorias (CRUD completo)

```
GET    /api/categorias                        → List<Categoria>
GET    /api/categorias/{id}                   → Categoria
GET    /api/categorias/{id}/tematicas          → tematicas de una categoria
POST   /api/categorias                        → crear (JWT)
PUT    /api/categorias/{id}                   → editar (JWT)
DELETE /api/categorias/{id}                   → eliminar (JWT)

Body POST/PUT:
{ "nombre": "Show Infantil", "descripcion": "Fiestas de cumpleaños" }

Response:
{ "id": 1, "nombre": "Show Infantil", "descripcion": "Fiestas de cumpleaños" }
```

### 2.2 Tematicas (CRUD completo)

```
GET    /api/tematicas                          → List<Tematica>
GET    /api/tematicas?categoriaId=1            → filtrar por categoria
GET    /api/tematicas/{id}                     → Tematica
POST   /api/tematicas?categoriaId=1            → crear (JWT)
PUT    /api/tematicas/{id}?categoriaId=1       → editar (JWT)
DELETE /api/tematicas/{id}                     → eliminar (JWT)

Body POST/PUT:
{ "nombre": "Mario Bross", "imagenReferencial": null }

Response:
{ "id": 5, "nombre": "Mario Bross", "imagenReferencial": null }
```

> IMPORTANTE: La respuesta NO incluye el objeto `categoria` anidado. La relacion se pasa por query param `?categoriaId=`.

---

## 3. INVENTARIO (recursos del proveedor)

```
GET    /api/inventario                         → Page<InventarioResponse>
GET    /api/inventario/search?q=muñeco         → List<InventarioResponse> (autocomplete)
GET    /api/inventario/{id}                    → InventarioResponse
POST   /api/inventario                         → crear
PUT    /api/inventario/{id}                    → editar
PATCH  /api/inventario/{id}/deactivate         → soft-delete
DELETE /api/inventario/{id}                    → hard-delete

Body POST/PUT:
{ "nombre": "Muñeco Mario", "descripcion": "2m", "cantidadDisponible": 1, "precioReferencial": 80.00 }

Response:
{ "id": 3, "nombre": "Muñeco Mario", "descripcion": "2m", "cantidadDisponible": 1, "precioReferencial": 80.00, "estado": "ACTIVO" }
```

---

## 4. PAQUETES

### 4.1 Endpoints

```
GET    /api/paquetes                           → Page<PaqueteResponse>
GET    /api/paquetes?categoriaId=1             → filtrar por categoria
GET    /api/paquetes/{id}                      → PaqueteResponse con array "detalles"
POST   /api/paquetes                           → crear con detalles
PUT    /api/paquetes/{id}                      → editar
PATCH  /api/paquetes/{id}/deactivate           → soft-delete
```

### 4.2 Crear paquete

```json
POST /api/paquetes
Body:
{
  "nombre": "PAQUETE PREMIUM",
  "descripcion": "Show completo con animadora, muñeco y DJ",
  "categoriaId": 1,
  "precioBase": 525.00,
  "duracionBaseHoras": 2.0,
  "detalles": [
    {
      "inventarioId": 1,
      "cantidadIncluida": 1,
      "precioUnitario": 50.00,
      "esObsequio": false,
      "orden": 1
    },
    {
      "inventarioId": 3,
      "cantidadIncluida": 1,
      "precioUnitario": 80.00,
      "esObsequio": false,
      "orden": 2
    },
    {
      "inventarioId": 7,
      "cantidadIncluida": 1,
      "precioUnitario": 0.00,
      "esObsequio": true,
      "orden": 9
    },
    {
      "inventarioId": 8,
      "cantidadIncluida": 1,
      "precioUnitario": 0.00,
      "esObsequio": true,
      "orden": 10
    }
  ]
}
```

### 4.3 Respuesta

```json
{
  "id": 1,
  "nombre": "PAQUETE PREMIUM",
  "descripcion": "Show completo",
  "precioBase": 525.00,
  "duracionBaseHoras": 2.0,
  "estado": "ACTIVO",
  "categoriaId": 1,
  "categoriaNombre": "Show Infantil",
  "detalles": [
    { "id": 10, "inventarioId": 1, "inventarioNombre": "Animadora", "cantidadIncluida": 1, "precioUnitario": 50.00, "esObsequio": false, "orden": 1 },
    { "id": 11, "inventarioId": 3, "inventarioNombre": "Muñeco Mario", "cantidadIncluida": 1, "precioUnitario": 80.00, "esObsequio": false, "orden": 2 },
    { "id": 12, "inventarioId": 7, "inventarioNombre": "Bazooka burbujas", "cantidadIncluida": 1, "precioUnitario": 0.00, "esObsequio": true, "orden": 9 },
    { "id": 13, "inventarioId": 8, "inventarioNombre": "Bolita de luz", "cantidadIncluida": 1, "precioUnitario": 0.00, "esObsequio": true, "orden": 10 }
  ]
}
```

### 4.4 UI — Formulario de creacion

Dos secciones separadas por `esObsequio`:

```
┌──────────────────────────────────────────────┐
│ Crear Paquete                                 │
│ ┌──────────────────────────────────────────┐ │
│ │ Nombre: [PAQUETE PREMIUM]                 │ │
│ │ Categoria: [Show Infantil ▼]              │ │
│ │ Precio Base: [525.00]                     │ │
│ │ Duracion (hrs): [2.0]                     │ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ RECURSOS BASICOS  (es_obsequio: false)       │
│ ┌──────────────────────────────────────────┐ │
│ │ [Buscar inventario...]         [Agregar]  │ │
│ ├─────┬───────────────────────────────────┤ │
│ │ 01  │ Animadora                         │ │
│ │ 01  │ Bailarina                         │ │
│ │ 01  │ Muñeco Mario                      │ │
│ │ 01  │ Equipo de sonido                  │ │
│ │ 01  │ DJ + micrófono                    │ │
│ └─────┴───────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ OBSEQUIOS  (es_obsequio: true)               │
│ ┌──────────────────────────────────────────┐ │
│ │ [Buscar inventario...]         [Agregar]  │ │
│ ├─────┬───────────────────────────────────┤ │
│ │ 01  │ Bazooka de burbujas               │ │
│ │ 01  │ Bolita de luz                     │ │
│ │ 01  │ Globos pencil                     │ │
│ │ 01  │ Tarjeta virtual                   │ │
│ └─────┴───────────────────────────────────┘ │
│                                              │
│ [Crear Paquete]                              │
└──────────────────────────────────────────────┘
```

> El autocomplete usa: `GET /api/inventario/search?q=muñeco`  
> Cada item agregado envia `es_obsequio: false` (Recursos) o `true` (Obsequios)  
> NO hay selector de tematica. Eso va en el evento.

---

## 5. EVENTOS (cronograma / calendario)

### 5.1 Endpoints

```
POST   /api/eventos                             → crear
PUT    /api/eventos/{id}                        → editar
GET    /api/eventos/{id}                        → ver detalle
GET    /api/eventos/calendario?inicio=&fin=     → Page<EventoResponse> (rango de fechas)
GET    /api/eventos/cliente/{clienteId}          → eventos de un cliente
PATCH  /api/eventos/{id}/estado?estado=CONFIRMADO → cambiar estado
DELETE /api/eventos/{id}                        → eliminar
```

Estados: `PROGRAMADO` → `CONFIRMADO` → `COMPLETADO` / `CANCELADO`

### 5.2 Crear evento

```json
POST /api/eventos
Body:
{
  "clienteId": 1,
  "categoriaId": 1,
  "paqueteId": 2,
  "tematicaId": 5,
  "tipoEvento": "SHOW INFANTIL",
  "nombreCumpleanero": "Lucca Matias",
  "edadCumpleanero": 4,
  "fechaEvento": "2026-08-15",
  "horaInicio": "17:00:00",
  "horaFinEstimada": "19:00:00",
  "direccion": "Pasaje 1 Mz D lote 16 - Urb. Los Girasoles",
  "referencia": "Casa de rejas blancas",
  "aforoEstimado": 30,
  "colorCalendario": "#3B82F6",
  "notasInternas": "Cliente pidio tematica Mario Bross"
}
```

### 5.3 Respuesta

```json
{
  "id": 20,
  "clienteId": 1,
  "clienteNombre": "Iris Giovanna Reyes Herrada",
  "categoriaId": 1,
  "categoriaNombre": "Show Infantil",
  "paqueteId": 2,
  "paqueteNombre": "PAQUETE PREMIUM",
  "paquetePrecio": 525.00,
  "tematicaId": 5,
  "tematicaNombre": "Mario Bross",
  "tipoEvento": null,
  "nombreCumpleanero": "Lucca Matias",
  "edadCumpleanero": 4,
  "fechaEvento": "2026-08-15",
  "horaInicio": "17:00:00",
  "horaFinEstimada": "19:00:00",
  "direccion": "Pasaje 1 Mz D lote 16",
  "referencia": "Casa de rejas blancas",
  "aforoEstimado": 30,
  "colorCalendario": "#3B82F6",
  "notasInternas": null,
  "estado": "PROGRAMADO"
}
```

### 5.4 Flujo al crear evento

```
1. Elegir cliente
   → GET /api/clientes?q=Maria

2. Elegir categoria
   → GET /api/categorias
   → al seleccionar, se cargan los paquetes y tematicas

3. Elegir paquete
   → GET /api/paquetes?categoriaId=1
   → dropdown: "BÁSICO S/350", "MEDIUM S/450", "PREMIUM S/525"
   → al seleccionar, opcional: mostrar vista previa GET /api/paquetes/{id}

4. Elegir tematica (opcional)
   → GET /api/tematicas?categoriaId=1

5. Fecha, hora, direccion...
```

---

## 6. CONTRATOS

### 6.1 Endpoints

```
POST   /api/contratos                               → crear (hereda paquete del evento)
GET    /api/contratos                               → Page<ContratoResponse>
GET    /api/contratos/{id}                          → ver detalle con array "detalles"
GET    /api/contratos/evento/{eventoId}              → contrato de un evento
POST   /api/contratos/{contratoId}/detalles          → AGREGAR ITEM ADICIONAL
DELETE /api/contratos/detalles/{detalleId}           → quitar item
PATCH  /api/contratos/{id}/estado?estado=CONFIRMADO  → cambiar estado
```

Estados: `BORRADOR` → `PENDIENTE` → `CONFIRMADO` → `COMPLETADO` / `CANCELADO`

### 6.2 Crear contrato

```json
POST /api/contratos
Body:
{
  "eventoId": 20,
  "costoMovilidad": 50.00,
  "montoAdelanto": 100.00,
  "duracion": "2 horas de show + 30 min caritas pintadas",
  "observaciones": "Cliente frecuente"
}
```

> NO se envia `paqueteId`. El paquete se hereda del evento.
> Los items del paquete se copian automaticamente al contrato.

### 6.3 Agregar item adicional al contrato

```json
POST /api/contratos/{contratoId}/detalles
Body:
{
  "inventarioId": 12,
  "cantidad": 1,
  "precioUnitario": 30.00,
  "esObsequio": false,
  "tipoDetalle": "ADICIONAL",
  "orden": 100
}
```

- `tipoDetalle: "ADICIONAL"` = item extra no incluido en el paquete original
- `tipoDetalle: "INCLUYE"` = (default) item del paquete
- `tipoDetalle: "OBSEQUIO"` = lo pone el backend si `es_obsequio = true`

### 6.4 Respuesta de contrato

```json
{
  "id": 15,
  "eventoId": 20,
  "eventoTipo": "SHOW INFANTIL",
  "estado": "BORRADOR",
  "montoTotal": 525.00,
  "costoMovilidad": 50.00,
  "montoAdelanto": 100.00,
  "montoPendiente": 425.00,
  "duracion": "2 horas de show + 30 min caritas pintadas",
  "observaciones": "Cliente frecuente",
  "fechaCreacion": "2026-08-15T14:30:00",
  "detalles": [
    {
      "id": 30, "inventarioId": 1, "inventarioNombre": "Animadora",
      "cantidad": 1, "precioUnitario": 50.00, "subtotal": 50.00,
      "esObsequio": false, "tipoDetalle": "INCLUYE", "orden": 1
    },
    {
      "id": 35, "inventarioId": 7, "inventarioNombre": "Bazooka burbujas",
      "cantidad": 1, "precioUnitario": 0.00, "subtotal": 0.00,
      "esObsequio": true, "tipoDetalle": "OBSEQUIO", "orden": 9
    },
    {
      "id": 36, "inventarioId": 12, "inventarioNombre": "Mesa de dulces",
      "cantidad": 1, "precioUnitario": 30.00, "subtotal": 30.00,
      "esObsequio": false, "tipoDetalle": "ADICIONAL", "orden": 100
    }
  ]
}
```

### 6.5 UI — Contrato con items adicionales

```
┌──────────────────────────────────────────────┐
│ Contrato — Show Infantil                      │
│ Evento: 21/02/2026 — Lucca Matias            │
│ Paquete: PAQUETE PREMIUM (S/525.00)          │
├──────────────────────────────────────────────┤
│ RECURSOS BASICOS (del paquete)                │
│ ┌─────┬────────────────────────────────────┐ │
│ │ 01  │ Animadora                         │ │
│ │ 01  │ Bailarina                         │ │
│ │ 01  │ Muñeco Mario                      │ │
│ └─────┴────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ OBSEQUIOS (del paquete)                       │
│ ┌─────┬────────────────────────────────────┐ │
│ │ OB  │ Bazooka de burbujas                │ │
│ │ OB  │ Bolita de luz                      │ │
│ └─────┴────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ ITEMS ADICIONALES                            │
│ ┌──────────────────────────────────────────┐ │
│ │ [Buscar inventario...] [Agregar]          │ │
│ ├─────┬───────────────────────────────────┤ │
│ │ 01  │ Mesa de dulces         [Quitar]    │ │
│ │ 01  │ Piñata extra           [Quitar]    │ │
│ └─────┴───────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ Movilidad: 50.00                              │
│ Adelanto: 100.00                              │
│ Pendiente: 425.00                             │
│ Estado: BORRADOR                              │
└──────────────────────────────────────────────┘
```

> El autocomplete de items adicionales usa: `GET /api/inventario/search?q=mesa`  
> Se agregan via `POST /api/contratos/{contratoId}/detalles` con `tipoDetalle: "ADICIONAL"`

---

## 7. PAGOS

```
POST   /api/pagos                      → multipart: contratoId, tipoPago, monto, metodoPago, comprobante(opcional)
GET    /api/pagos/{id}                 → PagoResponse
GET    /api/pagos/contrato/{contratoId} → Page<PagoResponse>
GET    /api/pagos/pendientes           → Page<PagoResponse>
PATCH  /api/pagos/{id}/verificar       → marcar VERIFICADO
PATCH  /api/pagos/{id}/rechazar?motivo= → marcar RECHAZADO

Tipos:  ADELANTO | SALDO | PAGO_TOTAL
Metodos: YAPE | PLIN | TRANSFERENCIA | EFECTIVO
Estados: PENDIENTE | VERIFICADO | RECHAZADO
```

---

## 8. PLANTILLAS Y PDF

### 8.1 Plantillas (CRUD)

```
GET    /api/plantillas                          → Page<PlantillaResponse>
POST   /api/plantillas                          → crear
PUT    /api/plantillas/{id}                     → editar
PATCH  /api/plantillas/{id}/deactivate          → soft-delete
DELETE /api/plantillas/{id}                     → hard-delete
POST   /api/plantillas/reload-default            → recargar HTML desde archivo

Body POST:
{
  "nombre": "Mi Plantilla",
  "descripcion": null,
  "tipo": "CONTRATO",
  "contenidoHtml": "<html>...</html>",
  "placeholders": ["{{PROVEEDOR_NOMBRE}}", "{{CLIENTE_NOMBRE}}"],
  "esDefault": false
}
```

### 8.2 Generar y descargar PDF

```javascript
const token = localStorage.getItem('token');

// 1. Generar PDF
const genRes = await fetch(`http://localhost:8080/api/documentos/generar/${contratoId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await genRes.json();

// 2. Descargar
const dlRes = await fetch(`http://localhost:8080/api/documentos/descargar/${data.id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const blob = await dlRes.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `contrato_${contratoId}_v${data.version}.pdf`;
a.click();
window.URL.revokeObjectURL(url);
```

### 8.3 Que genera el PDF

```
CONTRATO E&M ANIMACIONES
Lima, 21 DE FEBRERO DEL 2026

I. DATOS DEL SOLICITANTE
   NOMBRE: Iris Giovanna Reyes Herrada
   DNI: 07257839
   ...

II. DETALLES DEL EVENTO
   TIPO DE EVENTO: SHOW INFANTIL        ← categoria.nombre
   TEMATICA: MARIO BROSS
   FECHA: 21 DE FEBRERO DEL 2026
   ...

III. SHOW INFANTIL                       ← categoria.nombre
   CANTIDAD    DESCRIPCION
   01          Animadora vestida de los colores de la tematica
   01          Muñeco Mario
   
   INCLUYE     Canto al cumpleañero
   INCLUYE     Juegos segun la edad
   
   OBSEQUIO    Bazooka de burbujas
   OBSEQUIO    Bolita de luz
   
   ADICIONAL   Mesa de dulces           ← items agregados manualmente
   
   MOVILIDAD   S/.50.00
   DURACION    2 horas de show

   TOTAL: S/.525.00
   ADELANTO: S/.100.00
   SALDO: S/.425.00

   TERMINOS Y CONDICIONES:
   ...

________________________          ________________________
Naysha Morales                     Iris Giovanna Reyes Herrada
GERENTE GENERAL                    SOLICITANTE
```

---

## 9. DASHBOARD

```
GET /api/dashboard

Response:
{
  "totalClientes": 45,
  "totalInventarioActivo": 120,
  "totalPaquetesActivos": 8,
  "totalEventosProgramados": 12,
  "totalContratos": 30,
  "contratosPorEstado": { "BORRADOR": 5, "PENDIENTE": 10, "CONFIRMADO": 8, "COMPLETADO": 5, "CANCELADO": 2 },
  "ingresosTotales": 15000.00,
  "pagosPendientes": 3,
  "montoPendienteCobrar": 5000.00,
  "proximosEventos": [...],
  "eventosDelMes": [...]
}
```

---

## 10. CLIENTES

```
GET    /api/clientes?page=0&size=10      → Page<ClienteResponse>
GET    /api/clientes?q=Maria             → buscar por nombre
GET    /api/clientes?dni=12345678        → buscar por DNI
GET    /api/clientes/{id}                → ClienteResponse
POST   /api/clientes                     → crear
PUT    /api/clientes/{id}                → editar
DELETE /api/clientes/{id}                → eliminar

Body POST/PUT:
{
  "nombreCompleto": "Iris Giovanna Reyes Herrada",
  "dni": "07257839",
  "telefono": "993405103",
  "direccion": "Pasaje 1 Mz D lote 16",
  "referencia": "Frente al parque",
  "email": "iris@gmail.com"
}
```

---

## 11. FLUJO COMPLETO DE PANTALLAS

```
[Login / Register]
       │
       ├── [Dashboard] ← KPIs, proximos eventos, eventos del mes
       │
       ├── [Categorias] ← CRUD (puede ser admin-only o seed data)
       │
       ├── [Tematicas] ← CRUD, asociadas a una categoria
       │
       ├── [Inventario] ← CRUD + autocomplete
       │       │
       │       └── items usados en: paquetes + adicionales de contrato
       │
       ├── [Paquetes] ← CRUD + 2 secciones (recursos basicos + obsequios)
       │       │
       │       └── GET /api/paquetes?categoriaId=X → usado al crear evento
       │
       ├── [Clientes] ← CRUD
       │
       ├── [★ Cronograma ★] ← calendario mensual + crear/editar eventos
       │       │
       │       │   Al crear evento:
       │       │   1. Elegir cliente
       │       │   2. Elegir categoria → cargar paquetes
       │       │   3. Elegir paquete → dropdown con precios
       │       │   4. Elegir tematica (opcional)
       │       │   5. Fecha, hora, direccion...
       │       │
       │       └── click en evento → [Evento detalle]
       │               │
       │               └── [Contrato] ← crear desde evento
       │                       │
       │                       ├── Items del paquete (copia automatica)
       │                       ├── Items adicionales (autocomplete inventario)
       │                       ├── [Pagos] ← registrar, verificar, subir voucher
       │                       └── [Generar PDF] ← descargar contrato
       │
       └── [Plantillas] ← CRUD HTML + reload-default
```

---

## 12. ERRORES

Todos los errores devuelven:
```json
{
  "timestamp": "2026-07-30T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Descripcion del error"
}
```

401 → token invalido/expirado → redirigir a login  
403 → sin permisos → mostrar mensaje  
400 → validacion fallida → mostrar errores del campo `errors`  
500 → error interno → mostrar `message`

---

## 13. PAGINACION

Todos los listados devuelven `Page<T>`:
```json
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 15,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}
```

Query params: `?page=0&size=10&sort=nombre,asc`
