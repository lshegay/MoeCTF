interface Secret {
  key: string;
  admin: {
    username: string;
    password: string;
    email: string;
  };
}

export default Secret;
