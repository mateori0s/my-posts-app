# My Posts App

Una aplicación web moderna para crear posts y comentarios con autenticación mediante GitHub OAuth, construida con Next.js, React, TypeScript, Supabase y Tailwind CSS.

## 🚀 Características

- ✅ **Autenticación con GitHub OAuth**: Login, registro y logout mediante Supabase
- ✅ **Creación de Posts**: Los usuarios autenticados pueden crear posts con texto e imágenes
- ✅ **Visualización de Posts**: Todos los usuarios pueden ver posts (autenticados o no)
- ✅ **Sistema de Comentarios**: Los usuarios autenticados pueden comentar en posts con texto e imágenes
- ✅ **Visualización de Comentarios**: Todos los usuarios pueden ver comentarios
- ✅ **Diseño Responsive**: Optimizado para diferentes tamaños de pantalla
- ✅ **Almacenamiento de Imágenes**: Subida de imágenes a Supabase Storage
- ✅ **Arquitectura Limpia**: Patrones de diseño y separación de responsabilidades

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (GitHub OAuth)
- **Almacenamiento**: Supabase Storage
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Linting**: ESLint

## 📋 Prerrequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Cuenta de Supabase
- Aplicación OAuth de GitHub configurada

## 🔧 Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd my-posts-app
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Puedes encontrar estos valores en tu dashboard de Supabase:
- Ve a Settings > API
- Copia la URL y la anon/public key

### 4. Configurar Supabase

#### Base de Datos

Ejecuta estos SQL en el SQL Editor de Supabase:

```sql
-- Tabla de perfiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de comentarios
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  image_url TEXT,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para posts
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Políticas para comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);
```

#### Storage Buckets

1. Ve a Storage en el dashboard de Supabase
2. Crea dos buckets:
   - `post-images` (público)
   - `comment-images` (público)
3. Configura las políticas de acceso según necesites:
-New Policy -> Customization -> 
--SELECT--
((bucket_id = 'comment-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))

--DELETE--
((bucket_id = 'comment-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1]))

--INSERT--
((bucket_id = 'comment-images'::text) AND (auth.role() = 'authenticated'::text))

#### Autenticación OAuth

1. Ve a Authentication > Providers en Supabase
2. Habilita GitHub
3. Configura tu GitHub OAuth App:
   - Ve a GitHub Settings > Developer settings > OAuth Apps
   - Crea una nueva OAuth App
   - Authorization callback URL: `https://tu-proyecto.supabase.co/auth/v1/callback`
   - Copia Client ID y Client Secret a Supabase

### 5. Ejecutar el servidor de desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Rutas de autenticación
│   └── ...
├── components/            # Componentes React
│   ├── ui/               # Componentes UI (shadcn/ui)
│   └── ...
├── hooks/                 # Custom React Hooks
├── lib/                   # Utilidades y configuraciones
│   └── supabase/         # Clientes de Supabase
├── services/              # Capa de servicios (lógica de negocio)
└── types/                 # Definiciones de tipos TypeScript
```

Para más detalles sobre la arquitectura, consulta [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🎨 Características de Diseño

- **Responsive**: Diseño adaptativo para móviles, tablets y desktop
- **UI Moderna**: Componentes de shadcn/ui con Tailwind CSS
- **Accesible**: Componentes accesibles siguiendo las mejores prácticas
- **Performance**: Optimización de imágenes y carga lazy

## 🔐 Seguridad

- Row Level Security (RLS) en Supabase
- Validación en cliente y servidor
- Autenticación segura con OAuth
- Políticas de acceso configuradas

## 🧪 Testing

```bash
npm run lint
```

## 📦 Build para Producción

```bash
npm run build
npm start
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno
3. Deploy automático en cada push

### Otras plataformas

La aplicación puede desplegarse en cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- AWS Amplify
- etc.

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
