interface Secret {
  secret: string;
  admin: {
    username: string;
    password: string;
    email: string;
  };
}

export default Secret;
