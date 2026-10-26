/**
 * User Profile Data Model Schema
 * Represents user accounts in the `users` collection.
 */
export const userModel = {
  uid: "",
  email: "",
  name: "",
  username: "",
  phone: "",
  profileImage: "",

  // Role & Authorization
  role: "USER", // USER | ADMIN | SUPERADMIN

  // Account State
  isActive: true,
  emailVerified: false,
  phoneVerified: false,

  // Address Book
  addresses: [
    // {
    //   addressId: "addr_1",
    //   fullName: "",
    //   phone: "",
    //   houseNo: "",
    //   street: "",
    //   city: "",
    //   district: "",
    //   state: "",
    //   pincode: "",
    //   landmark: "",
    //   type: "HOME", // HOME | WORK | OTHER
    //   isDefault: true
    // }
  ],
  defaultAddressId: null,

  // Statistics & Counters
  totalOrders: 0,
  totalSpent: 0,
  totalReviews: 0,

  // Timestamps
  createdAt: null,
  updatedAt: null,
  lastLogin: null,
};

export default userModel;