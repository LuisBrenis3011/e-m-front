# Flujo de Creacion de Evento — Para Frontend React

> **Backend:** `http://localhost:8080` · Auth: JWT Bearer · GETs publicos, POST/PUT/DELETE requieren token

---

## 1. Modelo de datos del Evento

```
EVENTO
├── clienteId         (FK a Cliente, OBLIGATORIO)
├── categoriaId       (FK a Categoria, OBLIGATORIO)
├── tematicaId        (FK a Tematica, OPCIONAL)
├── tipoEvento        (String libre, max 100, OPCIONAL)  ← NO es un selector ni enum
├── nombreCumpleanero (String, max 150, OPCIONAL)
├── edadCumpleanero   (Integer, OPCIONAL)
├── fechaEvento       (LocalDate, OBLIGATORIO)
├── horaInicio        (LocalTime, OBLIGATORIO)
├── horaFinEstimada   (LocalTime, OPCIONAL)
├── direccion         (String, max 255, OBLIGATORIO)
├── referencia        (String, max 255, OPCIONAL)
├── aforoEstimado     (Integer, OPCIONAL)
├── colorCalendario   (String, default "#3B82F6", OPCIONAL)
├── notasInternas     (String, Text, OPCIONAL)
└── estado            (EstadoEvento enum, default "PROGRAMADO")
```

> `tipoEvento` es un campo String libre. NO existe tabla "tipo_evento", no hay CRUD, no hay relacion FK.

---

## 2. APIs disponibles

### 2.1 Clientes

| Metodo | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/clientes` | JWT |
| `GET` | `/api/clientes?q=Maria` | JWT |
| `GET` | `/api/clientes?dni=12345678` | JWT |
| `POST` | `/api/clientes` | JWT |
| `PUT` | `/api/clientes/{id}` | JWT |
| `DELETE` | `/api/clientes/{id}` | JWT |

Body POST/PUT:
```json
{
  "nombreCompleto": "Iris Giovanna Reyes Herrada",
  "dni": "07257839",
  "telefono": "993405103",
  "direccion": "Pasaje 1 Mz D lote 16 - Urb. Los Girasoles",
  "referencia": "Frente al parque",
  "email": "iris@gmail.com"
}
```

---

### 2.2 Categorias

| Metodo | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/categorias` | Publico |
| `GET` | `/api/categorias/{id}` | Publico |
| `GET` | `/api/categorias/{id}/tematicas` | Publico |
| `POST` | `/api/categorias` | JWT |
| `PUT` | `/api/categorias/{id}` | JWT |
| `DELETE` | `/api/categorias/{id}` | JWT |

Body POST/PUT:
```json
{
  "nombre": "Show Infantil",
  "descripcion": "Fiestas de cumpleanos para ninos"
}
```

Response:
```json
{
  "id": 1,
  "nombre": "Show Infantil",
  "descripcion": "Fiestas de cumpleanos para ninos"
}
```

---

### 2.3 Tematicas

| Metodo | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/tematicas` | Publico |
| `GET` | `/api/tematicas?categoriaId=1` | Publico |
| `GET` | `/api/tematicas/{id}` | Publico |
| `POST` | `/api/tematicas?categoriaId=1` | JWT |
| `PUT` | `/api/tematicas/{id}?categoriaId=1` | JWT |
| `DELETE` | `/api/tematicas/{id}` | JWT |

Body POST/PUT:
```json
{
  "nombre": "Mario Bross",
  "imagenReferencial": null
}
```

Response:
```json
{
  "id": 5,
  "nombre": "Mario Bross",
  "imagenReferencial": null
}
```

> **Nota:** La respuesta NO incluye el objeto `categoria` anidado. La relacion categoria_id se pasa por query param `?categoriaId=`. Si necesitas saber la categoria de una tematica, guarda el ID al momento de crearla/obtenerla.

---

### 2.4 Eventos

| Metodo | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/api/eventos` | JWT |
| `PUT` | `/api/eventos/{id}` | JWT |
| `GET` | `/api/eventos/{id}` | JWT |
| `GET` | `/api/eventos/calendario?inicio=&fin=` | JWT |
| `GET` | `/api/eventos/cliente/{clienteId}` | JWT |
| `PATCH` | `/api/eventos/{id}/estado?estado=CONFIRMADO` | JWT |
| `DELETE` | `/api/eventos/{id}` | JWT |

**POST /api/eventos — Request:**
```json
{
  "clienteId": 1,
  "categoriaId": 2,
  "tematicaId": 5,
  "tipoEvento": "Cumpleanos con show de magia",
  "nombreCumpleanero": "Lucca Matias",
  "edadCumpleanero": 4,
  "fechaEvento": "2026-08-15",
  "horaInicio": "17:00:00",
  "horaFinEstimada": "19:00:00",
  "direccion": "Pasaje 1 Mz D lote 16 - Urb. Los Girasoles",
  "referencia": "Frente al parque",
  "aforoEstimado": 30,
  "colorCalendario": "#3B82F6",
  "notasInternas": "Cliente pidio tematica Mario Bross"
}
```

**Response:**
```json
{
  "id": 20,
  "clienteId": 1,
  "clienteNombre": "Iris Giovanna Reyes Herrada",
  "categoriaId": 2,
  "categoriaNombre": "Show Infantil",
  "tematicaId": 5,
  "tematicaNombre": "Mario Bross",
  "tipoEvento": "Cumpleanos con show de magia",
  "nombreCumpleanero": "Lucca Matias",
  "edadCumpleanero": 4,
  "fechaEvento": "2026-08-15",
  "horaInicio": "17:00:00",
  "horaFinEstimada": "19:00:00",
  "direccion": "Pasaje 1 Mz D lote 16 - Urb. Los Girasoles",
  "referencia": "Frente al parque",
  "aforoEstimado": 30,
  "colorCalendario": "#3B82F6",
  "notasInternas": null,
  "estado": "PROGRAMADO"
}
```

**Cambiar estado:**
```
PATCH /api/eventos/{id}/estado?estado=CONFIRMADO
Valores: PROGRAMADO | CONFIRMADO | COMPLETADO | CANCELADO
```

**Calendario (paginado):**
```
GET /api/eventos/calendario?inicio=2026-08-01&fin=2026-08-31&page=0&size=50
```
Devuelve `Page<EventoResponse>` con metadata `totalElements`, `totalPages`, etc.

---

## 3. Flujo correcto del formulario

### Paso 1: Seleccionar cliente (OBLIGATORIO)
- Dropdown con busqueda: `GET /api/clientes?q=texto`
- Busqueda por DNI: `GET /api/clientes?dni=12345678`
- Si el cliente no existe, el usuario debe poder crearlo desde un modal o navegar a la pantalla de Clientes

### Paso 2: Seleccionar categoria (OBLIGATORIO)
- Dropdown alimentado de `GET /api/categorias`
- Al seleccionar categoria, cargar el Paso 3

### Paso 3: Seleccionar tematica (OPCIONAL)
- Dropdown que depende de la categoria del Paso 2
- `GET /api/tematicas?categoriaId={id}` o `GET /api/categorias/{id}/tematicas`
- Debe tener opcion "Sin tematica" (valor null / no enviar `tematicaId`)

### Paso 4: Tipo de evento — CAMPO DE TEXTO LIBRE
- **NO es un dropdown ni un selector**
- `<input type="text">` simple, maximo 100 caracteres
- OPCIONAL
- Placeholder: "Ej: Cumpleanos con show de magia, Cena de gala..."

### Paso 5: Datos del cumpleanero (OPCIONALES)
- `nombreCumpleanero` → input text, max 150 chars
- `edadCumpleanero` → input number

### Paso 6: Fecha y hora
- `fechaEvento` → date picker, OBLIGATORIO
- `horaInicio` → time picker, OBLIGATORIO
- `horaFinEstimada` → time picker, OPCIONAL

### Paso 7: Ubicacion
- `direccion` → input text, OBLIGATORIO
- `referencia` → input text, OPCIONAL

### Paso 8: Detalles adicionales (OPCIONALES)
- `aforoEstimado` → input number
- `colorCalendario` → color picker (default `#3B82F6`)
- `notasInternas` → textarea

---

## 4. Resumen de lo que hay que construir

| Pantalla | Prioridad | Endpoints |
|---|---|---|
| Login/Register | Alta | `POST /api/auth/login`, `/register` |
| **Cronograma (calendario)** | **Alta** | `GET /api/eventos/calendario`, `POST /api/eventos`, `PATCH /api/eventos/{id}/estado` |
| Clientes (CRUD) | Alta | `/api/clientes` |
| Categorias (CRUD) | Media | `/api/categorias` |
| Tematicas (CRUD) | Media | `/api/tematicas?categoriaId=` |
| Formulario Nuevo Evento | Alta | `POST /api/eventos` |

---

## 5. Notas tecnicas

- **Auth:** Todos los endpoints excepto login, register, categorias GET y tematicas GET requieren `Authorization: Bearer <token>`
- **Paginacion:** Los listados devuelven `Page<T>` → `?page=0&size=10&sort=nombre,asc`
- **Fechas:** `LocalDate` = `"2026-08-15"`, `LocalTime` = `"17:00:00"`
- **Estados de evento:** `PROGRAMADO` (default al crear) → `CONFIRMADO` → `COMPLETADO` o `CANCELADO`
- **El estado se asigna automaticamente** como `PROGRAMADO` al crear. El cambio de estado es via `PATCH`
- **Categorias/Tematicas GET son publicas** (no necesitan token). POST/PUT/DELETE si requieren JWT
