import { redirect } from 'next/navigation';

// เปิดป็อปอัปสมัครสมาชิกบนหน้าแรกแทน
export default function Page() { redirect('/?auth=register'); }
