export const dashboardData = {
  stats: [
    { label: 'Total Vehicles', value: '5', detail: 'in the fleet', icon: 'car', tone: 'blue' },
    { label: 'Total Drivers', value: '4', detail: 'on the roster', icon: 'driver', tone: 'blue' },
    { label: 'Total Trips', value: '37', detail: '32 regular · 5 pick up/drop', icon: 'route', tone: 'green' },
    { label: 'Fuel Entries', value: '2,231', detail: 'logged to date', icon: 'fuel', tone: 'amber' },
    { label: 'Invoiced Value', value: '₹ 1,98,737', detail: 'across 35 invoice(s)', icon: 'rupee', tone: 'green' },
  ],
  charts: {
    trips: { total: 37, regular: 32, pickup: 5 },
    vehicles: { total: 5, active: 5, inactive: 0 },
    latestTrip: '26 Jun 2022',
  },
  trips: {
    todayRegular: { title: "Today's Trip Regular", columns: ['Party Name', 'Trip No.', 'Time', 'Vehicle', 'Driver'], empty: 'No regular trips scheduled for today.', total: 'Total trips: 0' },
    upcoming: { title: 'Upcoming Trips', columns: ['Date', 'Party Name', 'Time', 'Vehicle', 'Driver'], empty: 'No upcoming regular trips.', total: 'Total upcoming trips: 0' },
    todayPickup: { title: "Today's Pick Up / Drop", columns: ['Time', 'Party Name', 'Type', 'Vehicle', 'Driver'], empty: 'No pick up / drop trips for today.', total: 'Total trips: 0' },
  },
  quickStats: [
    { label: 'Inquiries', value: '3,165', icon: 'message' },
    { label: 'Parties', value: '2', icon: 'users' },
    { label: 'Vendors', value: '2', icon: 'vendor' },
    { label: 'Issues', value: '0', icon: 'alert' },
    { label: 'Invoices', value: '35', icon: 'invoice' },
    { label: 'Users', value: '3', icon: 'user' },
  ],
}
