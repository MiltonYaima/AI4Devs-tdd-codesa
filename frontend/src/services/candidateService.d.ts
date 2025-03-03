// frontend/src/services/candidateService.d.ts

export declare const uploadCV: (file: File) => Promise<{ filePath: string; fileType: string }>;
export declare const sendCandidateData: (candidateData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  educations: Array<{
    institution: string;
    title: string;
    startDate: string;
    endDate: string;
  }>;
  workExperiences: Array<{
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
  }>;
  cv: {
    filePath: string;
    fileType: string;
  };
}) => Promise<any>;
