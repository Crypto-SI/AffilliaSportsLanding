import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatePlayerAge } from '../player-utils';
import type { PlayerApplication } from '../types';

// Mock data for testing admin interface functionality
const mockPlayerApplications: PlayerApplication[] = [
  {
    id: 'app-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    date_of_birth: '1995-06-15',
    position: 'midfielder',
    experience_level: 'professional',
    application_notes: 'Experienced midfielder looking for new opportunities',
    cv_file_path: 'applications/app-1-cv.pdf',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'app-2',
    name: 'Emma Johnson',
    email: 'parent@example.com',
    phone: '+1987654321',
    date_of_birth: '2010-03-22',
    position: 'forward',
    experience_level: 'youth',
    application_notes: 'Talented young player with great potential',
    cv_file_path: null,
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z'
  },
  {
    id: 'app-3',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: null,
    date_of_birth: '1988-11-08',
    position: 'goalkeeper',
    experience_level: 'semi-professional',
    application_notes: null,
    cv_file_path: 'applications/app-3-cv.docx',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  }
];

interface PlayerApplicationWithAge extends PlayerApplication {
  age: number;
  isYouth: boolean;
  contactType: string;
}

// Function to process applications with age information (simulating admin interface logic)
function processApplicationsWithAge(applications: PlayerApplication[]): PlayerApplicationWithAge[] {
  return applications.map(app => {
    const ageCalc = calculatePlayerAge(app.date_of_birth);
    return {
      ...app,
      age: ageCalc.age,
      isYouth: ageCalc.isYouth,
      contactType: ageCalc.isYouth ? 'Parent/Guardian' : 'Player'
    };
  });
}

// Function to filter applications by age group
function filterApplicationsByAgeGroup(
  applications: PlayerApplicationWithAge[], 
  filter: 'all' | 'youth' | 'adult'
): PlayerApplicationWithAge[] {
  switch (filter) {
    case 'youth':
      return applications.filter(app => app.isYouth);
    case 'adult':
      return applications.filter(app => !app.isYouth);
    default:
      return applications;
  }
}

// Function to get application statistics
function getApplicationStatistics(applications: PlayerApplicationWithAge[]) {
  return {
    total: applications.length,
    youth: applications.filter(app => app.isYouth).length,
    adult: applications.filter(app => !app.isYouth).length,
    professional: applications.filter(app => app.experience_level === 'professional').length,
    withCV: applications.filter(app => app.cv_file_path).length
  };
}

describe('Admin Interface Data Processing - Task 12', () => {
  describe('Enhanced Data Structure Handling - Requirements 5.4, 5.5', () => {
    it('should correctly process applications with age information', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      
      expect(processedApplications).toHaveLength(3);
      
      // Check adult player (John Smith, born 1995)
      const adultPlayer = processedApplications.find(app => app.name === 'John Smith');
      expect(adultPlayer).toBeDefined();
      expect(adultPlayer!.age).toBeGreaterThanOrEqual(28); // Born in 1995
      expect(adultPlayer!.isYouth).toBe(false);
      expect(adultPlayer!.contactType).toBe('Player');
      
      // Check youth player (Emma Johnson, born 2010)
      const youthPlayer = processedApplications.find(app => app.name === 'Emma Johnson');
      expect(youthPlayer).toBeDefined();
      expect(youthPlayer!.age).toBeLessThan(18); // Born in 2010
      expect(youthPlayer!.isYouth).toBe(true);
      expect(youthPlayer!.contactType).toBe('Parent/Guardian');
      
      // Check another adult player (Michael Brown, born 1988)
      const anotherAdult = processedApplications.find(app => app.name === 'Michael Brown');
      expect(anotherAdult).toBeDefined();
      expect(anotherAdult!.age).toBeGreaterThanOrEqual(35); // Born in 1988
      expect(anotherAdult!.isYouth).toBe(false);
      expect(anotherAdult!.contactType).toBe('Player');
    });

    it('should maintain all original application data', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      
      processedApplications.forEach((processed, index) => {
        const original = mockPlayerApplications[index];
        
        // Check that all original fields are preserved
        expect(processed.id).toBe(original.id);
        expect(processed.name).toBe(original.name);
        expect(processed.email).toBe(original.email);
        expect(processed.phone).toBe(original.phone);
        expect(processed.date_of_birth).toBe(original.date_of_birth);
        expect(processed.position).toBe(original.position);
        expect(processed.experience_level).toBe(original.experience_level);
        expect(processed.application_notes).toBe(original.application_notes);
        expect(processed.cv_file_path).toBe(original.cv_file_path);
        expect(processed.created_at).toBe(original.created_at);
        expect(processed.updated_at).toBe(original.updated_at);
        
        // Check that new fields are added
        expect(typeof processed.age).toBe('number');
        expect(typeof processed.isYouth).toBe('boolean');
        expect(typeof processed.contactType).toBe('string');
      });
    });
  });

  describe('Age-Based Filtering - Requirements 2.3, 2.4', () => {
    let processedApplications: PlayerApplicationWithAge[];

    beforeEach(() => {
      processedApplications = processApplicationsWithAge(mockPlayerApplications);
    });

    it('should filter youth applications correctly', () => {
      const youthApplications = filterApplicationsByAgeGroup(processedApplications, 'youth');
      
      expect(youthApplications).toHaveLength(1);
      expect(youthApplications[0].name).toBe('Emma Johnson');
      expect(youthApplications[0].isYouth).toBe(true);
      expect(youthApplications[0].contactType).toBe('Parent/Guardian');
    });

    it('should filter adult applications correctly', () => {
      const adultApplications = filterApplicationsByAgeGroup(processedApplications, 'adult');
      
      expect(adultApplications).toHaveLength(2);
      expect(adultApplications.every(app => !app.isYouth)).toBe(true);
      expect(adultApplications.every(app => app.contactType === 'Player')).toBe(true);
      
      const names = adultApplications.map(app => app.name);
      expect(names).toContain('John Smith');
      expect(names).toContain('Michael Brown');
    });

    it('should return all applications when no filter is applied', () => {
      const allApplications = filterApplicationsByAgeGroup(processedApplications, 'all');
      
      expect(allApplications).toHaveLength(3);
      expect(allApplications).toEqual(processedApplications);
    });
  });

  describe('Application Statistics - Requirements 5.4, 5.5', () => {
    it('should calculate correct statistics for enhanced data structure', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      const stats = getApplicationStatistics(processedApplications);
      
      expect(stats.total).toBe(3);
      expect(stats.youth).toBe(1);
      expect(stats.adult).toBe(2);
      expect(stats.professional).toBe(1);
      expect(stats.withCV).toBe(2);
    });

    it('should handle empty application list', () => {
      const stats = getApplicationStatistics([]);
      
      expect(stats.total).toBe(0);
      expect(stats.youth).toBe(0);
      expect(stats.adult).toBe(0);
      expect(stats.professional).toBe(0);
      expect(stats.withCV).toBe(0);
    });
  });

  describe('CV Upload Compatibility - Requirements 2.3, 2.4', () => {
    it('should correctly identify applications with CV files', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      
      const applicationsWithCV = processedApplications.filter(app => app.cv_file_path);
      const applicationsWithoutCV = processedApplications.filter(app => !app.cv_file_path);
      
      expect(applicationsWithCV).toHaveLength(2);
      expect(applicationsWithoutCV).toHaveLength(1);
      
      // Check specific applications
      expect(applicationsWithCV.find(app => app.name === 'John Smith')?.cv_file_path).toBe('applications/app-1-cv.pdf');
      expect(applicationsWithCV.find(app => app.name === 'Michael Brown')?.cv_file_path).toBe('applications/app-3-cv.docx');
      expect(applicationsWithoutCV.find(app => app.name === 'Emma Johnson')?.cv_file_path).toBeNull();
    });

    it('should handle different CV file formats', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      
      const pdfCV = processedApplications.find(app => app.cv_file_path?.endsWith('.pdf'));
      const docxCV = processedApplications.find(app => app.cv_file_path?.endsWith('.docx'));
      
      expect(pdfCV).toBeDefined();
      expect(docxCV).toBeDefined();
      expect(pdfCV!.name).toBe('John Smith');
      expect(docxCV!.name).toBe('Michael Brown');
    });
  });

  describe('Contact Information Display - Requirements 3.1, 4.2, 4.3', () => {
    it('should correctly identify contact information type for youth players', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      const youthPlayer = processedApplications.find(app => app.isYouth);
      
      expect(youthPlayer).toBeDefined();
      expect(youthPlayer!.contactType).toBe('Parent/Guardian');
      expect(youthPlayer!.email).toBe('parent@example.com'); // Parent/guardian email
    });

    it('should correctly identify contact information type for adult players', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      const adultPlayers = processedApplications.filter(app => !app.isYouth);
      
      expect(adultPlayers).toHaveLength(2);
      adultPlayers.forEach(player => {
        expect(player.contactType).toBe('Player');
      });
    });

    it('should handle optional phone numbers correctly', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      
      const withPhone = processedApplications.filter(app => app.phone);
      const withoutPhone = processedApplications.filter(app => !app.phone);
      
      expect(withPhone).toHaveLength(2);
      expect(withoutPhone).toHaveLength(1);
      expect(withoutPhone[0].name).toBe('Michael Brown');
    });
  });

  describe('Date Formatting and Display - Requirements 5.4, 5.5', () => {
    it('should maintain proper date format for date_of_birth', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      
      processedApplications.forEach(app => {
        expect(app.date_of_birth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(new Date(app.date_of_birth).toString()).not.toBe('Invalid Date');
      });
    });

    it('should maintain proper timestamp format for created_at and updated_at', () => {
      const processedApplications = processApplicationsWithAge(mockPlayerApplications);
      
      processedApplications.forEach(app => {
        expect(app.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        expect(app.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        expect(new Date(app.created_at!).toString()).not.toBe('Invalid Date');
        expect(new Date(app.updated_at!).toString()).not.toBe('Invalid Date');
      });
    });
  });
});