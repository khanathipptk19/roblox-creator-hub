import NavLinks from './NavLinks';
import LogoutButton from './LogoutButton';

export default function Navbar({ session }) {
  const isAdmin = session?.role === 'admin';
  return (
    <header className="nav">
      <div className="navInner">
        <span className="brand">Creator Hub</span>
        <NavLinks isAdmin={isAdmin} />
        <div className="navUser">
          <span className={isAdmin ? 'role admin' : 'role'}>{isAdmin ? 'แอดมิน' : 'ผู้ใช้ (ดูอย่างเดียว)'}</span>
          <span className="muted">{session?.name}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
