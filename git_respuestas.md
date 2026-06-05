# Sección 7: Git y Control de Versiones

Respuestas del repositorio **DNA Music**. El historial de este proyecto sigue commits atómicos y mensajes [Conventional Commits](https://www.conventionalcommits.org/), no un único commit con todo el código.

---

## 1. Crear la rama `feature/filtro-por-sede` desde `main`

```bash
# Asegurarse de estar en main y tener la última versión
git checkout main
git pull origin main

# Crear y cambiar a la nueva rama
git checkout -b feature/filtro-por-sede
```

---

## 2. Hacer un commit con mensaje descriptivo (Conventional Commits)

Ejemplo coherente con el dominio del proyecto (filtro de estudiantes por sede en el frontend):

```bash
git add web/src/pages/StudentsPage.tsx web/src/components/crud/tableFilters.ts
git commit -m "feat(web): add headquarter filter to students table"
```

### Convención usada en este repositorio

| Prefijo    | Cuándo usarlo                           | Ejemplo real del proyecto                                   |
| ---------- | --------------------------------------- | ----------------------------------------------------------- |
| `feat`     | Nueva funcionalidad                     | `feat(web): add students CRUD module with role-based scope` |
| `fix`      | Corrección de bug                       | `fix: infinite loop requests`                               |
| `refactor` | Cambio interno sin nueva feature ni fix | `refactor(web): split API types by domain`                  |
| `docs`     | Solo documentación                      | `docs: update docs`                                         |
| `chore`    | Mantenimiento, dependencias, CI         | `chore(web): scaffold Vite React TypeScript`                |
| `test`     | Pruebas                                 | `test(api): add roles guard unit tests`                     |

Formato recomendado: `tipo(alcance): descripción en imperativo, minúsculas, sin punto final`.

---

## 3. Subir la rama al repositorio remoto

```bash
git push -u origin feature/filtro-por-sede
```

- `-u` (o `--set-upstream`) vincula la rama local con la remota; los siguientes `git push` y `git pull` en esa rama no necesitan especificar el nombre.
- La primera vez que subes la rama, GitHub/GitLab mostrará un enlace para abrir el Pull Request.

---

## 4. Proceso para crear un Pull Request (PR)

### Pasos

1. **Push de la rama** — `git push -u origin feature/filtro-por-sede`.
2. **Abrir el PR** — en GitHub: pestaña _Pull requests_ → _New pull request_ → base: `main`, compare: `feature/filtro-por-sede`. También suele aparecer un botón _Compare & pull request_ justo después del push.
3. **Completar título y descripción** — revisar el diff y los commits incluidos.
4. **Actions** - Esperar a que todos los jobs dentro de un workflow sean completados satisfactoriamente.
5. **Revisión** — esperar feedback o aprobación; corregir si hay comentarios (nuevos commits en la misma rama actualizan el PR automáticamente).
6. **Merge** — cuando CI pase y el revisor apruebe: _Squash and merge_ o _Merge commit_, según la política del equipo. En este proyecto se prefiere historial legible; los commits atómicos en la rama ya facilitan un merge directo.

### Qué incluir en la descripción del PR

| Sección                  | Contenido                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| **Resumen**              | 1–3 frases: qué problema resuelve y qué cambió.                                                    |
| **Motivación**           | Por qué era necesario (ej.: operadores necesitan filtrar estudiantes por sede).                    |
| **Cambios principales**  | Lista breve de archivos o módulos tocados.                                                         |
| **Cómo probar**          | Pasos manuales o comandos (`npm run test`, credenciales de prueba, URL de staging).                |
| **Capturas** (si aplica) | UI antes/después para cambios visuales.                                                            |
| **Checklist**            | Lint/build/test pasan; sin secretos en el diff; migraciones documentadas si hay cambios en Prisma. |

**Ejemplo de descripción:**

```markdown
## Resumen

Añade filtro por sede en el listado de estudiantes para usuarios ADMIN.

## Cambios

- Nuevo filtro en `StudentsPage` y `tableFilters.ts`
- Sin cambios en API (el listado ya devuelve `headquarter`)

## Cómo probar

1. Login como `admin@dnamusic.co` / `Admin123!`
2. Ir a Estudiantes → filtrar por sede Bogotá
3. `cd web && npm run lint && npm run build`
```

---

## 5. Resolver conflictos al traer cambios de `main`

Escenario: trabajas en `feature/filtro-por-sede` y `main` avanzó en remoto (otros merges o commits directos).

### Paso a paso

```bash
# 1. Guardar el trabajo actual (si hay cambios sin commitear)
git status
git add .
git commit -m "wip: filter by headquarter in progress"
# Alternativa sin commit: git stash -u

# 2. Traer lo último de main
git checkout main
git pull origin main

# 3. Volver a tu rama e integrar main
git checkout feature/filtro-por-sede
git merge main
# O, si el equipo prefiere historial lineal:
# git rebase main
```

**Si Git reporta conflictos:**

```bash
# 4. Ver archivos en conflicto
git status

# 5. Abrir cada archivo marcado como "both modified"
#    Buscar marcadores:
#    <<<<<<< HEAD        (tus cambios)
#    =======
#    >>>>>>> main        (cambios de main)
#    Editar manualmente dejando la versión correcta (o combinando ambas).

# 6. Marcar como resueltos y continuar
git add <archivo-resuelto>
git merge --continue
# Si usaste rebase: git rebase --continue

# 7. Probar que todo funciona
cd api && npm run lint && npm run build && npm run test
cd ../web && npm run lint && npm run build

# 8. Subir la rama actualizada
git push origin feature/filtro-por-sede
# Si hiciste rebase y ya habías pusheado antes:
# git push --force-with-lease origin feature/filtro-por-sede
```

### Buenas prácticas ante conflictos

- Resolver conflictos en **archivos concretos**, no reemplazar archivos enteros sin revisar.
- Ejecutar **lint y build** después de resolver; un merge limpio en Git no garantiza código que compile.
- Preferir **`--force-with-lease`** sobre `--force` si necesitas reescribir historia tras un rebase (evita pisar trabajo ajeno).
- Si el conflicto es complejo, pedir ayuda antes de mergear a `main`.

---

## Historial de commits en este repositorio

Este proyecto demuestra organización incremental. Ejemplos reales de `main`:

```text
feat(web): add students CRUD module with role-based scope
feat(web): add headquarters CRUD module with filters and pagination
refactor(web): add repository layer with interfaces
refactor(web): slim pages to composition-only
fix: infinite loop requests
docs: update docs
```

Cada commit agrupa **un cambio lógico** (un módulo, un refactor, una corrección o documentación), lo que facilita revisiones, `git bisect` ante regresiones y PRs acotados.
