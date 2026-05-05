export type Driver = {
  name: string;
  email: string;
  phone: string;
};

// Fill in real driver details — these feed dispatch emails and the assignment dropdown.
export const drivers: Driver[] = [
  { name: "Driver 1", email: "", phone: "" },
  { name: "Driver 2", email: "", phone: "" },
];

export const dispatchRecipients = [
  { name: "Toby", email: "silvercreeklogistic@gmail.com" },
  { name: "Trent", email: "trentsargent@hotmail.com" },
];
