interface User {
  id: number;
  name: string;
  content?: string;
  email?: string;
  admin?: boolean;
  avatar?: string;
  points?: number;
}

export default User;
