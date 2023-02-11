export enum Role {
  BUYER, //only able to vending-machine products
  SELLER, //could manage products he owns
  ADMIN, //could manage both: products belongs to any of user and users too
}
