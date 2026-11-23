import { redirect } from 'next/navigation';

// เปิดป็อปอัปล็อกอินบนหน้าแรกแทน
export default function Page() { redirect('/?auth=login'); }
