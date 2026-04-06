export function getDefaultRouteByRole(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'employee':
      return '/employee'
    case 'customer':
      return '/customer'
    default:
      return '/'
  }
}
