import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // The main dashboard overview can be the bookings page for a regular user.
  redirect('/dashboard/bookings');
}

    