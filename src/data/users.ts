export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'manager';
  name: string;
}

export const USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    name: 'Gerente'
  },
  {
    id: '3',
    username: 'stock',
    password: 'stock123',
    role: 'manager',
    name: 'Encargado de Stock'
  }
];

export const findUserByCredentials = (username: string, password: string): User | null => {
  return USERS.find(user => 
    user.username === username && user.password === password
  ) || null;
};