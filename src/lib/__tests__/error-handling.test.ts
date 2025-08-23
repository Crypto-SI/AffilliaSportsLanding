import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAgeValidationError, isValidPlayerAge, calculatePlayerAge } from '../player-utils';

describe('Enhanced Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Date Validation Error Messages', () => {
    it('should provide specific error for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const error = getAgeValidationError(futureDateString);
      expect(error).toContain('5 days in the future');
    });

    it('should provide specific error for dates too far in the past', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 150);
      const oldDateString = oldDate.toISOString().split('T')[0];
      
      const error = getAgeValidationError(oldDateString);
      expect(error).toContain('within the last 100 years');
    });

    it('should provide specific error for players too young', () => {
      const youngDate = new Date();
      youngDate.setFullYear(youngDate.getFullYear() - 3);
      const youngDateString = youngDate.toISOString().split('T')[0];
      
      const error = getAgeValidationError(youngDateString);
      expect(error).toContain('3 years old');
      expect(error).toContain('must be at least 5 years old');
    });

    it('should provide specific error for players too old', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 70);
      const oldDateString = oldDate.toISOString().split('T')[0];
      
      const error = getAgeValidationError(oldDateString);
      expect(error).toContain('over 65 years old');
      expect(error).toContain('contact us directly');
    });

    it('should provide specific error for invalid dates', () => {
      const error = getAgeValidationError('invalid-date');
      expect(error).toContain('YYYY-MM-DD format');
      expect(error).toContain('1995-06-15');
    });

    it('should detect impossible dates like February 30th', () => {
      // February 30th doesn't exist
      const impossibleDate = '2023-02-30';
      const error = getAgeValidationError(impossibleDate);
      expect(error).toContain('valid calendar date');
      expect(error).toContain('does not exist');
    });

    it('should handle leap year dates correctly', () => {
      // February 29th in a leap year should be valid
      const leapYearDate = '2020-02-29';
      expect(isValidPlayerAge(leapYearDate)).toBe(true);
      
      // February 29th in a non-leap year should be invalid
      const nonLeapYearDate = '2021-02-29';
      const error = getAgeValidationError(nonLeapYearDate);
      expect(error).toContain('valid calendar date');
    });
  });

  describe('Age Calculation Edge Cases', () => {
    it('should handle birthday edge cases correctly', () => {
      const today = new Date();
      const birthdayToday = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const birthdayTomorrow = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
      const birthdayYesterday = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() - 1);
      
      const ageToday = calculatePlayerAge(birthdayToday);
      const ageTomorrow = calculatePlayerAge(birthdayTomorrow);
      const ageYesterday = calculatePlayerAge(birthdayYesterday);
      
      expect(ageToday.age).toBe(18);
      expect(ageToday.isYouth).toBe(false);
      
      expect(ageTomorrow.age).toBe(17);
      expect(ageTomorrow.isYouth).toBe(true);
      
      expect(ageYesterday.age).toBe(18);
      expect(ageYesterday.isYouth).toBe(false);
    });

    it('should handle month and day edge cases', () => {
      const today = new Date();
      
      // Birthday next month but same day
      const nextMonth = new Date(today.getFullYear() - 18, today.getMonth() + 1, today.getDate());
      const ageNextMonth = calculatePlayerAge(nextMonth);
      expect(ageNextMonth.age).toBe(17);
      
      // Birthday last month but same day
      const lastMonth = new Date(today.getFullYear() - 18, today.getMonth() - 1, today.getDate());
      const ageLastMonth = calculatePlayerAge(lastMonth);
      expect(ageLastMonth.age).toBe(18);
    });
  });

  describe('Error Message Quality', () => {
    it('should provide actionable error messages', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const error = getAgeValidationError(futureDateString);
      
      // Should be specific about the problem
      expect(error).toContain('cannot be');
      expect(error).toContain('future');
      
      // Should indicate the magnitude of the problem
      expect(error).toContain('1 day');
    });

    it('should handle plural vs singular correctly', () => {
      const futureDate1 = new Date();
      futureDate1.setDate(futureDate1.getDate() + 1);
      const error1 = getAgeValidationError(futureDate1.toISOString().split('T')[0]);
      expect(error1).toContain('1 day');
      expect(error1).not.toContain('days');
      
      const futureDate2 = new Date();
      futureDate2.setDate(futureDate2.getDate() + 2);
      const error2 = getAgeValidationError(futureDate2.toISOString().split('T')[0]);
      expect(error2).toContain('2 days');
    });

    it('should provide helpful guidance for young players', () => {
      const youngDate = new Date();
      youngDate.setFullYear(youngDate.getFullYear() - 3);
      const error = getAgeValidationError(youngDate.toISOString().split('T')[0]);
      
      expect(error).toContain('contact us directly');
      expect(error).toContain('3 years old');
    });

    it('should provide helpful guidance for older players', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 70);
      const error = getAgeValidationError(oldDate.toISOString().split('T')[0]);
      
      expect(error).toContain('contact us directly');
      expect(error).toContain('specialized registration assistance');
    });
  });

  describe('Boundary Testing', () => {
    it('should handle exactly 5 years old', () => {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      const dateString = fiveYearsAgo.toISOString().split('T')[0];
      
      expect(isValidPlayerAge(dateString)).toBe(true);
      const age = calculatePlayerAge(dateString);
      expect(age.age).toBe(5);
    });

    it('should handle exactly 65 years old', () => {
      const sixtyFiveYearsAgo = new Date();
      sixtyFiveYearsAgo.setFullYear(sixtyFiveYearsAgo.getFullYear() - 65);
      const dateString = sixtyFiveYearsAgo.toISOString().split('T')[0];
      
      expect(isValidPlayerAge(dateString)).toBe(true);
      const age = calculatePlayerAge(dateString);
      expect(age.age).toBe(65);
    });

    it('should handle exactly 18 years old (youth boundary)', () => {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      const dateString = eighteenYearsAgo.toISOString().split('T')[0];
      
      const age = calculatePlayerAge(dateString);
      expect(age.age).toBe(18);
      expect(age.isYouth).toBe(false);
    });

    it('should handle 17 years and 364 days old', () => {
      const today = new Date();
      const almostEighteen = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate() - 1);
      const dateString = almostEighteen.toISOString().split('T')[0];
      
      const age = calculatePlayerAge(dateString);
      expect(age.age).toBe(17);
      expect(age.isYouth).toBe(true);
    });
  });
});