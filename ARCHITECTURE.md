# Arquitectura del Proyecto

Este documento describe la arquitectura y los patrones de diseño utilizados en la aplicación.

## Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── posts/         # Endpoints para posts y comentarios
│   ├── auth/              # Rutas de autenticación
│   │   └── callback/      # Callback de OAuth
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes UI reutilizables (shadcn/ui)
│   ├── PostCard.tsx      # Componente para mostrar un post
│   ├── PostForm.tsx      # Formulario para crear posts
│   ├── CommentSection.tsx # Sección de comentarios
│   ├── Navbar.tsx        # Barra de navegación
│   └── SupabaseProvider.tsx # Provider de Supabase
├── hooks/                 # Custom React Hooks
│   └── useAuth.ts        # Hook para autenticación
├── lib/                   # Utilidades y configuraciones
│   ├── supabase/         # Clientes de Supabase
│   │   ├── client.ts     # Cliente para browser
│   │   ├── server.ts     # Cliente para servidor
│   │   └── index.ts      # Exportaciones centralizadas
│   └── utils.ts          # Utilidades generales
├── services/              # Capa de servicios (lógica de negocio)
│   ├── auth.service.ts   # Servicio de autenticación
│   ├── posts.service.ts  # Servicio de posts
│   ├── comments.service.ts # Servicio de comentarios
│   ├── storage.service.ts # Servicio de almacenamiento
│   └── profile.service.ts # Servicio de perfiles
└── types/                 # Definiciones de tipos TypeScript
    └── index.ts          # Tipos compartidos
```

## Patrones de Diseño Implementados

### 1. Service Layer Pattern
Separamos la lógica de negocio de los componentes y API routes en servicios dedicados:
- `AuthService`: Maneja toda la autenticación
- `PostsService`: Operaciones relacionadas con posts
- `CommentsService`: Operaciones relacionadas con comentarios
- `StorageService`: Manejo de archivos e imágenes
- `ProfileService`: Gestión de perfiles de usuario

**Beneficios:**
- Reutilización de código
- Fácil testing
- Separación de responsabilidades
- Mantenibilidad

### 2. Repository Pattern (implícito)
Los servicios actúan como repositorios que abstraen el acceso a datos.

### 3. Custom Hooks Pattern
- `useAuth`: Centraliza la lógica de autenticación y estado del usuario

### 4. Component Composition
Componentes pequeños y reutilizables:
- `PostCard`: Muestra un post individual
- `PostForm`: Formulario de creación de posts
- `CommentSection`: Sección de comentarios

## Flujo de Autenticación

1. Usuario hace clic en "Login with GitHub"
2. `AuthService.signInWithGitHub()` redirige a GitHub OAuth
3. GitHub redirige a `/auth/callback`
4. El callback handler (`app/auth/callback/route.ts`) intercambia el código por una sesión
5. El usuario es redirigido a la página principal
6. `useAuth` hook detecta el cambio de estado y actualiza la UI

## Flujo de Creación de Posts

1. Usuario completa el formulario en `PostForm`
2. Si hay imagen, `StorageService.uploadPostImage()` la sube a Supabase Storage
3. `PostsService.createPost()` llama a la API
4. API route valida y guarda en la base de datos
5. El componente padre (`PostsClient`) refresca la lista de posts

## Flujo de Comentarios

Similar al de posts, pero usando `CommentsService` y permitiendo imágenes opcionales.

## Manejo de Errores

- Validación en el cliente (servicios)
- Validación en el servidor (API routes)
- Mensajes de error claros para el usuario
- Logging de errores en consola para debugging

## Responsive Design

- Uso de Tailwind CSS con breakpoints (`sm:`, `md:`, `lg:`)
- Layout adaptativo en `Navbar` y componentes principales
- Imágenes responsivas con `max-h-*` y `object-contain`
- Espaciado adaptativo con padding/margin condicionales

## Base de Datos (Supabase)

### Tablas principales:
- `profiles`: Información de usuarios
- `posts`: Posts creados por usuarios
- `comments`: Comentarios en posts

### Storage Buckets:
- `post-images`: Imágenes de posts
- `comment-images`: Imágenes de comentarios

## Mejores Prácticas Aplicadas

1. **TypeScript**: Tipado estricto en toda la aplicación
2. **Separación de concerns**: Lógica separada de presentación
3. **Reutilización**: Componentes y servicios reutilizables
4. **Error handling**: Manejo robusto de errores
5. **Validación**: Validación tanto en cliente como servidor
6. **Performance**: Lazy loading de imágenes, optimización de queries
7. **Accesibilidad**: Uso de componentes accesibles (shadcn/ui)
8. **Código limpio**: Nombres descriptivos, funciones pequeñas, comentarios cuando es necesario

## Próximas Mejoras Posibles

1. Implementar paginación para posts
2. Agregar likes/reacciones
3. Sistema de notificaciones
4. Búsqueda y filtros
5. Edición y eliminación de posts/comentarios
6. Optimistic updates para mejor UX
7. Tests unitarios y de integración
