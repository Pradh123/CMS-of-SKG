export const dashboardData = {
  stats: [],
  charts: {
    trips: { total: 0, regular: 0, pickup: 0 },
    vehicles: { total: 0, active: 0, inactive: 0 },
    latestTrip: 'No trips yet',
  },
  trips: {
    todayRegular: {
      title: "Today's Trip Regular",
      columns: ['Party Name', 'Trip No.', 'Time', 'Vehicle', 'Driver'],
      empty: 'No regular trips scheduled for today.',
      total: 'Total trips: 0',
    },
    upcoming: {
      title: 'Upcoming Trips',
      columns: ['Date', 'Party Name', 'Time', 'Vehicle', 'Driver'],
      empty: 'No upcoming regular trips.',
      total: 'Total upcoming trips: 0',
    },
    todayPickup: {
      title: "Today's Pick Up / Drop",
      columns: ['Time', 'Party Name', 'Type', 'Vehicle', 'Driver'],
      empty: 'No pick up / drop trips for today.',
      total: 'Total trips: 0',
    },
  },
  quickStats: [],
}
