
import React, { useState } from 'react';
import { Course, Settings, ScheduleData, Schedule } from './types';
import { generateSchedule } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ScheduleDisplay from './components/ScheduleDisplay';
import Loader from './components/Loader';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: 'Mathematics', classesPerWeek: 5 },
    { id: 2, name: 'Science', classesPerWeek: 4 },
    { id: 3, name: 'History', classesPerWeek: 3 },
    { id: 4, name: 'English', classesPerWeek: 5 },
    { id: 5, name: 'Physical Education', classesPerWeek: 2 },
  ]);

  const [settings, setSettings] = useState<Settings>({
    classesPerDay: 6,
    classDuration: 50,
    holidays: ['Saturday', 'Sunday'],
    startTime: '09:00',
    gapBetweenClasses: 10,
    shortBreakAfterClass: 2,
    shortBreakDuration: 15,
    longBreakAfterClass: 4,
    longBreakDuration: 45,
  });

  const [additionalConstraints, setAdditionalConstraints] = useState<string>(
    '1. The Mathematics teacher is unavailable on Friday afternoons.\n2. Physical Education should not be the first class of the day.'
  );

  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    setError(null);
    setSchedule(null);

    try {
      const result = await generateSchedule(courses, settings, additionalConstraints);
      if (result) {
        setSchedule(result);
      } else {
        setError('The AI could not generate a schedule. Please try adjusting your constraints.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the schedule. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleUpdate = (newSchedule: Schedule) => {
    // Manually update schedule from drag-and-drop and re-calculate reasoning.
    setSchedule(prev => {
        if (!prev) return null;
        return {
            ...prev,
            schedule: newSchedule,
        }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <InputForm
              courses={courses}
              setCourses={setCourses}
              settings={settings}
              setSettings={setSettings}
              additionalConstraints={additionalConstraints}
              setAdditionalConstraints={setAdditionalConstraints}
              onGenerate={handleGenerateSchedule}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg p-6 min-h-full">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Loader />
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">AI is crafting your schedule...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full min-h-[400px] text-center">
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                  </div>
                </div>
              ) : (
                <ScheduleDisplay 
                    scheduleData={schedule} 
                    settings={settings} 
                    courses={courses}
                    onScheduleUpdate={handleScheduleUpdate}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
