
export interface Course {
  id: number;
  name: string;
  classesPerWeek: number;
}

export interface Settings {
  classesPerDay: number;
  classDuration: number;
  holidays: string[];
  startTime: string;
  gapBetweenClasses: number;
  shortBreakAfterClass: number;
  shortBreakDuration: number;
  longBreakAfterClass: number;
  longBreakDuration: number;
}

export type Schedule = {
  [day: string]: string[];
};

export interface ScheduleData {
    schedule: Schedule;
    reasoning: string;
}
