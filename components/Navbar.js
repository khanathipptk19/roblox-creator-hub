import NavLinks from './NavLinks';
import LogoutButton from './LogoutButton';
import OpenAuthButton from './OpenAuthButton';

export default function Navbar({ session }) {
  const isAdmin = session?.role === 'admin';

  return (
    <header className="nav">
      <div className="navInner">
        <span className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/images/icon.jpg"
            alt="Logo"
            style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }}
          />
          Creator Hub
        </span>

        {/* โชว์เมนูครบตลอดเวลา (ถ้ายังไม่ล็อกอิน isAdmin จะเป็น false) */}
        <NavLinks isAdmin={isAdmin} />

        {/* แยกเฉพาะปุ่มขวาสุดตามสถานะการล็อกอิน */}
        {!session ? (
          <div className="navUser guestActions">
            <OpenAuthButton mode="register" className="btn ghost small">สมัครสมาชิก</OpenAuthButton>
            <OpenAuthButton mode="login" className="btn small">เข้าสู่ระบบ</OpenAuthButton>
          </div>
        ) : (
          <div className="navUser">
            <span className={isAdmin ? 'role admin' : 'role'}>{isAdmin ? 'แอดมิน' : 'ผู้ใช้ '}</span>
            <span className="muted">{session?.name}</span>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}