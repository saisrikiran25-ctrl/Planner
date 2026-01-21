
import React from 'react';
import { Course, Settings } from '../types';

interface InputFormProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  additionalConstraints: string;
  setAdditionalConstraints: React.Dispatch<React.SetStateAction<string>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; info?: string }> = ({ title, children, info }) => (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-[1.01]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>{title}</span>
            {info && (
                <div className="relative group flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-help" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        {info}
                    </div>
                </div>
            )}
        </h2>
        {children}
    </div>
);


const InputForm: React.FC<InputFormProps> = ({
  courses,
  setCourses,
  settings,
  setSettings,
  additionalConstraints,
  setAdditionalConstraints,
  onGenerate,
  isLoading,
}) => {

  const handleCourseChange = (index: number, field: keyof Course, value: string | number) => {
    const newCourses = [...courses];
    (newCourses[index] as any)[field] = value;
    setCourses(newCourses);
  };
  
  const handleSettingsChange = (field: keyof Settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  }

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), name: '', classesPerWeek: 3 }]);
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };
  
  const handleHolidayChange = (day: string) => {
    setSettings(prev => ({
      ...prev,
      holidays: prev.holidays.includes(day)
        ? prev.holidays.filter(d => d !== day)
        : [...prev.holidays, day],
    }));
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <SectionCard title="Courses & Subjects" info="Add subjects and specify the number of classes per week for each.">
        <div className="space-y-3">
          {courses.map((course, index) => (
            <div key={course.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
              <input
                type="text"
                placeholder="Course Name"
                value={course.name}
                onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                className="flex-grow bg-transparent focus:outline-none"
              />
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-md p-1">
                 <button onClick={() => handleCourseChange(index, 'classesPerWeek', Math.max(1, course.classesPerWeek - 1))} className="px-1 text-gray-500 hover:text-indigo-500 rounded-md transition-colors">-</button>
                 <input
                  type="number"
                  min="1"
                  value={course.classesPerWeek}
                  onChange={(e) => handleCourseChange(index, 'classesPerWeek', parseInt(e.target.value, 10) || 1)}
                  className="w-10 bg-transparent text-center focus:outline-none"
                />
                <button onClick={() => handleCourseChange(index, 'classesPerWeek', course.classesPerWeek + 1)} className="px-1 text-gray-500 hover:text-indigo-500 rounded-md transition-colors">+</button>
              </div>
              <button onClick={() => removeCourse(index)} className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-100 dark:hover:bg-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={addCourse} className="mt-4 w-full text-indigo-600 dark:text-indigo-400 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
            <span>Add Course</span>
        </button>
      </SectionCard>

      <SectionCard title="Settings" info="Set a value to 0 to disable a specific break or gap.">
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-gray-700 dark:text-gray-300 font-medium">School Start Time</label>
                <input type="time" value={settings.startTime} onChange={(e) => handleSettingsChange('startTime', e.target.value)} className="w-32 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          <div className="flex items-center justify-between">
            <label className="text-gray-700 dark:text-gray-300 font-medium">Classes per Day</label>
            <input type="number" min="1" value={settings.classesPerDay} onChange={(e) => handleSettingsChange('classesPerDay', parseInt(e.target.value))} className="w-32 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-gray-700 dark:text-gray-300 font-medium">Class Duration (mins)</label>
            <input type="number" min="0" value={settings.classDuration} onChange={(e) => handleSettingsChange('classDuration', parseInt(e.target.value))} className="w-32 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
           <div className="flex items-center justify-between">
            <label className="text-gray-700 dark:text-gray-300 font-medium">Gap Between Classes (mins)</label>
            <input type="number" min="0" value={settings.gapBetweenClasses} onChange={(e) => handleSettingsChange('gapBetweenClasses', parseInt(e.target.value))} className="w-32 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 !my-6"></div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <h4 className="font-medium text-center text-gray-800 dark:text-gray-200">Short Break</h4>
                <div className="flex items-center justify-between text-sm">
                    <label className="text-gray-600 dark:text-gray-400">After Class</label>
                    <input type="number" min="0" value={settings.shortBreakAfterClass} onChange={(e) => handleSettingsChange('shortBreakAfterClass', parseInt(e.target.value))} className="w-20 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                    <label className="text-gray-600 dark:text-gray-400">Duration (mins)</label>
                    <input type="number" min="0" value={settings.shortBreakDuration} onChange={(e) => handleSettingsChange('shortBreakDuration', parseInt(e.target.value))} className="w-20 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
             </div>
             <div className="space-y-2">
                <h4 className="font-medium text-center text-gray-800 dark:text-gray-200">Long Break</h4>
                <div className="flex items-center justify-between text-sm">
                    <label className="text-gray-600 dark:text-gray-400">After Class</label>
                    <input type="number" min="0" value={settings.longBreakAfterClass} onChange={(e) => handleSettingsChange('longBreakAfterClass', parseInt(e.target.value))} className="w-20 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                    <label className="text-gray-600 dark:text-gray-400">Duration (mins)</label>
                    <input type="number" min="0" value={settings.longBreakDuration} onChange={(e) => handleSettingsChange('longBreakDuration', parseInt(e.target.value))} className="w-20 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-center focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
             </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 !my-6"></div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Holidays</label>
            <div className="grid grid-cols-4 gap-2">
              {daysOfWeek.map(day => (
                <button key={day} onClick={() => handleHolidayChange(day)} className={`px-2 py-1 text-sm rounded-lg border-2 transition-all duration-200 ${settings.holidays.includes(day) ? 'bg-indigo-500 border-indigo-500 text-white font-semibold shadow-md' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'}`}>
                  {day.substring(0,3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
      
      <SectionCard title="Additional Constraints">
        <textarea
          rows={5}
          value={additionalConstraints}
          onChange={(e) => setAdditionalConstraints(e.target.value)}
          placeholder="e.g., Teacher availability, specific class timings..."
          className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </SectionCard>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : "Generate Schedule"}
      </button>
    </div>
  );
};

export default InputForm;
