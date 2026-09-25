// export interface OnboardingData {
//   id: number;
//   image: string;
//   heading: string;
//   subHeading: string;
//   buttonText: string;
// }

// const data: OnboardingData[] = [
//   {
//     id: 1,
//     image: require("/assets/onboarding/onboardsecond.png"),
//     heading: "Easy way to confirm your attendance",
//     subHeading:
//       "Confirm your attendance effortlessly with a simple click or reply to a meeting invitation.",
//     buttonText: "Next",
//   },
//   {
//     id: 2,
//     image: require("/assets/onboarding/onboardthird.png"),
//     heading: "Disciplinary in your hand",
//     subHeading:
//       "Handle disciplinary matters efficiently and fairly to maintain a productive work environment.",
//     buttonText: "Next",
//   },
//   {
//     id: 3,
//     image: require("/assets/onboarding/onboarding1.png"),
//     heading: "Reduce the workload of HR Management",
//     subHeading:
//       "Automate routine tasks and streamline processes to reduce HR Management workload.",
//     buttonText: "Login",
//   },
// ];

// export default data;
// data/data.ts
export interface OnboardingData {
  id: number;
  image: string;
  heading: string;
  subHeading: string;
  buttonText: string;
}

export interface OnboardingContent {
  en: OnboardingData[];
  hi: OnboardingData[];
}

const onboardingData: OnboardingContent = {
  en: [
    {
      id: 1,
      image: require("/assets/onboarding/onboarding1rst.png"),
     heading: "Easy Check-in Process",
subHeading:
  "Ensure your attendance with a single click on the check-in button.",

      buttonText: "Next",
    },
    {
      id: 2,
      image: require("/assets/onboarding/onboardthird.png"),
     heading: "Keep Your Face Stable",
subHeading:
  "Place your face inside the oval and remain still so the camera can detect your face accurately.",
      buttonText: "Next",
    },
   {
  id: 3,
  image: require("/assets/onboarding/onboardfive.png"),
  heading: "Attendance Recorded Successfully",
  subHeading:
    "Once your punch-in is verified, your attendance data is securely captured and updated in the system in real time.",
  buttonText: "Next",
}
,
    {
      id: 4,
      image: require("/assets/onboarding/onboarding2nd.png"),
    heading: "Check-Out Process",
subHeading:
  "Please tap the check-out button upon completion of your work period.",
      buttonText: "Log In",
    },
  ],
  hi: [
    {
      id: 1,
      image: require("/assets/onboarding/onboarding1rst.png"),
heading: "आसान चेक-इन प्रक्रिया",
subHeading:
  "चेक-इन बटन पर एक क्लिक के साथ अपनी उपस्थिति सुनिश्चित करें।",
      buttonText: "अगला",
    },
    {
      id: 2,
      image: require("/assets/onboarding/onboardthird.png"),
     heading: "अपना चेहरा स्थिर रखें",
subHeading:
  "अपने चेहरे को ओवल के अंदर रखें और कुछ क्षण स्थिर रहें ताकि कैमरा आपके चेहरे को सही तरीके से पहचान सके।",
      buttonText: "अगला",
    },
    
    {
  id: 3,
  image: require("/assets/onboarding/onboardfive.png"),
  heading: "उपस्थिति सफलतापूर्वक दर्ज की गई",
  subHeading:
    "पंच-इन सत्यापित होने के बाद, आपकी उपस्थिति की जानकारी सुरक्षित रूप से सिस्टम में दर्ज हो जाती है और तुरंत अपडेट हो जाती है।",
  buttonText: "आगे बढ़ें",
}

,
    {
      id: 4,
      image: require("/assets/onboarding/onboarding2nd.png"),
heading: "चेक-आउट प्रक्रिया",
subHeading:
  "कार्य अवधि पूर्ण होने पर कृपया चेक-आउट बटन पर टैप करें।",
      buttonText: "लॉगिन ",
    },
  ],
};

export default onboardingData;