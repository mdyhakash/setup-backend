export interface IAuth {
  name: string;
  email: string;
  password: string;
  role?: "member" | "admin";
}
