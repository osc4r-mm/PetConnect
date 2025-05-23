# PetConnect

¡Bienvenido a **PetConnect**!  
Esta es la plataforma de gestión, adopción y cuidado de mascotas desarrollada para el proyecto final.

---

## 📚 Manuales y Documentación

Toda la documentación necesaria para comprender, desplegar y utilizar la aplicación está disponible en los siguientes enlaces:

### 📖 Manual Técnico

- [Leer manual técnico en Google Docs](https://docs.google.com/document/d/19n3cdv8SIki5xUVnsCqqOttQ5ahIerpMn220yzWhJK8/edit?usp=drive_link)

### 👩‍💻 Manual de Usuario

- [Leer manual de usuario en Google Docs](https://docs.google.com/document/d/1H-5wtTwli7z2WAB2-HGhLEQ2BDdumL6ydvroxZvutQI/edit?usp=drive_link)

### 📝 Memoria

- [Leer memoria del proyecto en Google Docs](https://docs.google.com/document/d/1Wvyo040fV6GMq049A2P9pXVpwLJGsTdEqXpLLo4fLLI/edit?usp=drive_link)

---

## 🚀 Despliegue y Arquitectura

El despliegue de PetConnect está preparado para funcionar en un clúster de Kubernetes con contenedores Docker y servicios para frontend, backend y base de datos.

### Estructura de archivos de despliegue

```
petconnect/
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── nginx.conf
├── frontend/
│   ├── Dockerfile
│   └── nginx.conf
├── postgres-deployment.yaml
├── postgres-pc.yaml
├── backend-deployment.yaml
├── frontend-deployment.yaml
├── bdeploy.sh
├── fdeploy.sh
```

---

### Archivos de despliegue y scripts

Haz click en "ver más" para mostrar cada archivo entero.

<details>
<summary><strong>postgres-pc.yaml</strong> (PersistentVolumeClaim para la base de datos)</summary>

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```
</details>

<details>
<summary><strong>postgres-deployment.yaml</strong> (Deployment y Service de Postgres)</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        ports:
        - containerPort: 5432
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: POSTGRES_USER
          value: pet_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-pass
              key: password
        - name: POSTGRES_DB
          value: petconnectdb
        volumeMounts:
        - name: postgres-persistent-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-persistent-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  type: ClusterIP
  ports:
    - port: 5432
  selector:
    app: postgres
```
</details>

<details>
<summary><strong>backend-deployment.yaml</strong> (Deployment y Service de Backend)</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: petconnect-backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: petconnect-backend
  template:
    metadata:
      labels:
        app: petconnect-backend
    spec:
      imagePullSecrets:
        - name: credencials-kube0
      containers:
      - name: petconnect-backend
        image: kube0.lacetania.cat/grup7/petconnect-backend:latest
        ports:
        - containerPort: 9000
        env:
        - name: DB_CONNECTION
          value: "pgsql"
        - name: DB_HOST
          value: "postgres"
        - name: DB_PORT
          value: "5432"
        - name: DB_DATABASE
          value: "petconnectdb"
        - name: DB_USERNAME
          value: "pet_user"
        - name: DB_PASSWORD
          value: "MySecur3!"
        resources:
          requests:
            memory: "128Mi"
            cpu: "250m"
          limits:
            memory: "256Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: petconnect-backend
spec:
  selector:
    app: petconnect-backend
  ports:
    - protocol: TCP
      port: 9000
      targetPort: 80
  type: ClusterIP
```
</details>

<details>
<summary><strong>frontend-deployment.yaml</strong> (Deployment y Service de Frontend)</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: petconnect-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: petconnect-frontend
  template:
    metadata:
      labels:
        app: petconnect-frontend
    spec:
      imagePullSecrets:
        - name: credencials-kube0
      containers:
      - name: petconnect-frontend
        image: kube0.lacetania.cat/grup7/petconnect-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: petconnect-frontend
spec:
  selector:
    app: petconnect-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: NodePort
```
</details>

<details>
<summary><strong>backend/Dockerfile</strong></summary>

```Dockerfile
FROM php:8.3-fpm

# Instala dependencias del sistema, supervisor y extensiones PHP necesarias
RUN apt-get update && \
    apt-get install -y nginx libpq-dev libpng-dev libonig-dev libxml2-dev zip unzip git curl && \
    docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# Instala Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copia archivos del proyecto
COPY . .

# Instala dependencias de Laravel
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Permisos para storage y cache
RUN chown -R www-data:www-data /var/www && chmod -R 775 /var/www/storage

# Crea el symlink para /uploads
RUN ln -s /var/www/storage/app/public /var/www/public/uploads

RUN php artisan migrate --force

EXPOSE 80

# Copia el entrypoint
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Usa el entrypoint actualizado para arrancar php-fpm y nginx correctamente
CMD ["/entrypoint.sh"]
```
</details>

<details>
<summary><strong>backend/entrypoint.sh</strong></summary>

```sh
#!/bin/sh
set -e

# Arranca php-fpm en segundo plano
php-fpm &

# Arranca nginx en primer plano
nginx -g 'daemon off;'
```
</details>

<details>
<summary><strong>backend/nginx.conf</strong></summary>

```nginx
worker_processes 1;
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen 80;
        server_name _;

        root /var/www/public;
        index index.php index.html;

        # Sirve imágenes desde /uploads/
        location /uploads/ {
            alias /var/www/public/uploads/;
            access_log off;
            expires 30d;
            add_header Cache-Control "public";
        }

        # API y frontend Laravel
        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        location ~ \.php$ {
            try_files $uri =404;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include        fastcgi_params;
        }

        location ~ /\.ht {
            deny all;
        }
    }
}
```
</details>

<details>
<summary><strong>backend/bdeploy.sh</strong></summary>

```sh
#!/bin/sh

git pull
docker rmi petconnect-backend
docker rmi kube0.lacetania.cat/grup7/petconnect-backend
docker build -t kube0.lacetania.cat/grup7/petconnect-backend:latest ./backend
docker tag petconnect-backend:latest kube0.lacetania.cat/grup7/petconnect-backend:latest
docker push kube0.lacetania.cat/grup7/petconnect-backend:latest
kubectl rollout restart deployment petconnect-backend
```
</details>

<details>
<summary><strong>frontend/Dockerfile</strong></summary>

```Dockerfile
FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
</details>

<details>
<summary><strong>frontend/nginx.conf</strong></summary>

```nginx
worker_processes 1;
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        # Proxy /api al backend
        location /api/ {
            proxy_pass http://petconnect-backend:9000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Proxy /uploads al backend (para imágenes)
        location /uploads/ {
            proxy_pass http://petconnect-backend:9000/uploads/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # React SPA fallback
        location / {
            try_files $uri /index.html;
        }
    }
}
```
</details>

<details>
<summary><strong>frontend/fdeploy.sh</strong></summary>

```sh
#!/bin/sh

git pull
docker rmi petconnect-frontend
docker rmi kube0.lacetania.cat/grup7/petconnect-frontend
docker build -t kube0.lacetania.cat/grup7/petconnect-frontend:latest ./frontend
docker tag petconnect-frontend:latest kube0.lacetania.cat/grup7/petconnect-frontend:latest
docker push kube0.lacetania.cat/grup7/petconnect-frontend:latest
kubectl rollout restart deployment petconnect-frontend
```
</details>

---

### Ejemplo de despliegue (manual)

```bash
# Desplegar base de datos
kubectl apply -f postgres-pc.yaml
kubectl apply -f postgres-deployment.yaml

# Desplegar backend
./bdeploy.sh

# Desplegar frontend
./fdeploy.sh
```

---

## 📂 Estructura del repositorio

- `/frontend` — Código fuente del cliente React.
- `/backend` — Código fuente de la API Laravel.
- `README.md` — Este archivo.
- Archivos de despliegue y scripts: ver sección anterior.

---

## ✨ Créditos

Desarrollado por Oscar Martin Morales.

---

> Si tienes cualquier duda, consulta los manuales enlazados arriba.  
> ¡Gracias por usar PetConnect!
