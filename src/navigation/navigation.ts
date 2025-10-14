export type RootStackParamList = {
  Onboarding: undefined;
  Register: undefined;
  Login: undefined;
  OTP: {
    //confirmation: any;
    phoneNumber: string;
    name?: string;
    password?: string;
    email?: string;
  };
  ProfileName: {
    uid: string,
    phoneNumber: string;
    name: string;
    password: string;
    email: string;
    // confirmation?: any; // Uncomment if you use confirmation
  };
  Gender: {
    uid: string;
    profile: {
      firstName: string;
      lastName: string;
      birthdate: string;
      avatar: string;
    };
  };
  Interests: {
    uid: string;
    profile: any; // or a more detailed type
  };
  Home: undefined;
};
