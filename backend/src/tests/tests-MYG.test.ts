// backend/src/tests/tests-iniciales.test.ts

import axios from 'axios';
import { uploadCV, sendCandidateData } from '../../../frontend/src/services/candidateService';

// Mock axios to prevent actual API calls during tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Candidate Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CV Upload Tests', () => {
    /**
     * Test Case: Successful CV upload
     * Verifies that a valid PDF file can be uploaded successfully
     */
    test('should upload a valid PDF file successfully', async () => {
      // Arrange
      const mockFile = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          filePath: 'uploads/1234567890-resume.pdf',
          fileType: 'application/pdf'
        }
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await uploadCV(mockFile);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    /**
     * Test Case: Invalid file type upload
     * Verifies that the system rejects non-document file types
     * Criteria: Carga indebida de archivos donde deberían ir las imágenes del candidato
     */
    test('should reject invalid file types', async () => {
      // Arrange
      const mockFile = new File(['dummy content'], 'image.exe', { type: 'application/x-msdownload' });
      const mockError = {
        response: {
          data: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.'
        }
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(uploadCV(mockFile)).rejects.toThrow('Error al subir el archivo: Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
    });

    /**
     * Test Case: File size limit
     * Verifies that the system rejects files that exceed the size limit
     * Criteria: Carga indebida de archivos donde deberían ir las imágenes del candidato
     */
    test('should reject files exceeding size limit', async () => {
      // Arrange
      // Create a large mock file (11MB)
      const largeArray = new Array(11 * 1024 * 1024).fill('a');
      const mockFile = new File([largeArray.join('')], 'large_resume.pdf', { type: 'application/pdf' });
      const mockError = {
        response: {
          data: 'File size exceeds the 10MB limit.'
        }
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(uploadCV(mockFile)).rejects.toThrow('Error al subir el archivo: File size exceeds the 10MB limit.');
    });
  });

  describe('Candidate Data Submission Tests', () => {
    /**
     * Test Case: Successful candidate submission
     * Verifies that valid candidate data can be submitted successfully
     */
    test('should submit valid candidate data successfully', async () => {
      // Arrange
      const validCandidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: 'Calle Principal 123',
        educations: [
          {
            institution: 'Universidad XYZ',
            title: 'Computer Science',
            startDate: '2015-09-01',
            endDate: '2019-06-30'
          }
        ],
        workExperiences: [
          {
            company: 'Tech Corp',
            position: 'Software Developer',
            description: 'Developed web applications',
            startDate: '2019-07-01',
            endDate: '2022-12-31'
          }
        ],
        cv: {
          filePath: 'uploads/1234567890-resume.pdf',
          fileType: 'application/pdf'
        }
      };

      const mockResponse = {
        data: {
          id: '1',
          ...validCandidateData,
          createdAt: '2023-05-15T10:30:00Z'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await sendCandidateData(validCandidateData);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        validCandidateData
      );
      expect(result).toEqual(mockResponse.data);
    });

    /**
     * Test Case: Special characters validation
     * Verifies that the system properly handles special characters in input fields
     * Criteria: Validación de caracteres especiales en el formulario
     */
    test('should handle special characters in candidate data', async () => {
      // Arrange
      const candidateWithSpecialChars = {
        firstName: 'María-José',
        lastName: "O'Connor",
        email: 'maria.jose@example.com',
        phone: '+34 (123) 456-789',
        address: 'Calle 123 #45-67, 2º B',
        educations: [
          {
            institution: 'École Polytechnique',
            title: 'Ingénierie & Science',
            startDate: '2015-09-01',
            endDate: '2019-06-30'
          }
        ],
        workExperiences: [],
        cv: {
          filePath: 'uploads/1234567890-resume.pdf',
          fileType: 'application/pdf'
        }
      };

      const mockResponse = {
        data: {
          id: '2',
          ...candidateWithSpecialChars,
          createdAt: '2023-05-15T10:30:00Z'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await sendCandidateData(candidateWithSpecialChars);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        candidateWithSpecialChars
      );
      expect(result).toEqual(mockResponse.data);
    });

    /**
     * Test Case: Long text validation
     * Verifies that the system properly handles excessively long text inputs
     * Criteria: Ingreso de cadenas de texto demasiado largas donde deberían ir los datos puntuales del candidato
     */
    test('should handle excessively long text inputs', async () => {
      // Arrange
      const longText = 'a'.repeat(1001); // Assuming the limit is 1000 characters
      const candidateWithLongText = {
        firstName: longText,
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: 'Calle Principal 123',
        educations: [],
        workExperiences: [],
        cv: {
          filePath: 'uploads/1234567890-resume.pdf',
          fileType: 'application/pdf'
        }
      };

      const mockError = {
        response: {
          data: 'Input exceeds maximum length.'
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(sendCandidateData(candidateWithLongText)).rejects.toThrow('Error al enviar datos del candidato: Input exceeds maximum length.');
    });

    /**
     * Test Case: Data purging before storage
     * Verifies that the system purges unnecessary data before storing it in the database
     * Criteria: Purga de datos antes de almacenamiento de los mismos en la base de datos
     */
    test('should purge unnecessary data before storing in the database', async () => {
      // Arrange
      const candidateDataWithExtraFields = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: 'Calle Principal 123',
        extraField: 'This should be removed',
        educations: [],
        workExperiences: [],
        cv: {
          filePath: 'uploads/1234567890-resume.pdf',
          fileType: 'application/pdf'
        }
      };

      const expectedCandidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: 'Calle Principal 123',
        educations: [],
        workExperiences: [],
        cv: {
          filePath: 'uploads/1234567890-resume.pdf',
          fileType: 'application/pdf'
        }
      };

      const mockResponse = {
        data: {
          id: '3',
          ...expectedCandidateData,
          createdAt: '2023-05-15T10:30:00Z'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await sendCandidateData(candidateDataWithExtraFields);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        expectedCandidateData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
