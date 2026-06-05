import { NavLink } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { logout } from '@/store/authSlice';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-dna-gold text-black'
      : 'text-dna-muted hover:bg-dna-border hover:text-white',
  ].join(' ');

export function Sidebar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-dna-border bg-dna-surface">
      <div className="border-b border-dna-border px-6 py-5">
        <img
          src="/logo-horizontal-negro.avif"
          alt="DNA Music"
          className="h-10 w-auto"
        />
        <p className="mt-3 text-xs uppercase tracking-wider text-dna-muted">
          Panel interno
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        <NavLink to="/" end className={linkClass}>
          <i className="pi pi-home" />
          Dashboard
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={linkClass}>
            <i className="pi pi-users" />
            Usuarios
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/headquarters" className={linkClass}>
            <i className="pi pi-building" />
            Sedes
          </NavLink>
        )}
        <NavLink to="/students" className={linkClass}>
          <i className="pi pi-id-card" />
          Estudiantes
        </NavLink>
      </nav>

      <div className="border-t border-dna-border p-4">
        <div className="mb-3 rounded-lg bg-dna-bg px-3 py-2">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-dna-muted">{user?.email}</p>
          <p className="mt-1 text-xs text-dna-gold">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dna-border px-4 py-2 text-sm text-dna-muted transition-colors hover:border-dna-gold hover:text-dna-gold"
        >
          <i className="pi pi-sign-out" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
