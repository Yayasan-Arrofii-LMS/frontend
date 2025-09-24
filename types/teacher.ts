export interface Teacher {
  id: string;
  profilePhoto: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  subjects: string[];
  joinDate: string;
  status: "active" | "inactive";
}
