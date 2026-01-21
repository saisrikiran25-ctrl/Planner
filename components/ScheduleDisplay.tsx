
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScheduleData, Settings, Course, Schedule } from '../types';

interface ScheduleDisplayProps {
  scheduleData: ScheduleData | null;
  settings: Settings;
  courses: Course[];
  onScheduleUpdate: (newSchedule: Schedule) => void;
}

type TimelineItem = {
    type: 'CLASS';
    period: number;
    startTime: string;
    endTime: string;
} | {
    type: 'BREAK';
    name:string;
    startTime: string;
    endTime: string;
};

const calculateTimeline = (settings: Settings): TimelineItem[] => {
    const timeline: TimelineItem[] = [];
    if (!settings.startTime || !settings.startTime.includes(':') || settings.classesPerDay <= 0) {
        return [];
    }

    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    
    let currentTime = new Date(0);
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const toTimeString = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    for (let i = 1; i <= settings.classesPerDay; i++) {
        const classStartTime = new Date(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + settings.classDuration);
        const classEndTime = new Date(currentTime);
        timeline.push({ type: 'CLASS', period: i, startTime: toTimeString(classStartTime), endTime: toTimeString(classEndTime) });
        
        if (i === settings.classesPerDay) break;

        if (i === settings.shortBreakAfterClass && settings.shortBreakDuration > 0) {
            const breakStartTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + settings.shortBreakDuration);
            const breakEndTime = new Date(currentTime);
            timeline.push({ type: 'BREAK', name: 'Short Break', startTime: toTimeString(breakStartTime), endTime: toTimeString(breakEndTime) });
        } else if (i === settings.longBreakAfterClass && settings.longBreakDuration > 0) {
            const breakStartTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + settings.longBreakDuration);
            const breakEndTime = new Date(currentTime);
            timeline.push({ type: 'BREAK', name: 'Long Break', startTime: toTimeString(breakStartTime), endTime: toTimeString(breakEndTime) });
        } else if (settings.gapBetweenClasses > 0) {
             const gapStartTime = new Date(currentTime);
             currentTime.setMinutes(currentTime.getMinutes() + settings.gapBetweenClasses);
             const gapEndTime = new Date(currentTime);
             timeline.push({ type: 'BREAK', name: 'Gap', startTime: toTimeString(gapStartTime), endTime: toTimeString(gapEndTime) });
        }
    }
    return timeline;
};


const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ scheduleData, settings, courses, onScheduleUpdate }) => {
  const [dragOverInfo, setDragOverInfo] = useState<{ day: string; index: number } | null>(null);

  if (!scheduleData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <svg className="w-24 h-24 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
        </svg>

        <h3 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Your Schedule Awaits</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Fill in the details and click "Generate Schedule" to create your masterpiece.
        </p>
      </div>
    );
  }
  
  const { schedule, reasoning } = scheduleData;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeline = React.useMemo(() => calculateTimeline(settings), [settings]);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, day: string, classIndex: number) => {
    const course = schedule[day]?.[classIndex];
    if (course && course !== '-') {
        e.dataTransfer.setData('application/json', JSON.stringify({ sourceDay: day, sourceIndex: classIndex, course }));
        e.currentTarget.style.opacity = '0.5';
    } else {
        e.preventDefault();
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDragOverInfo(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableCellElement>, day: string, index: number) => {
    e.preventDefault();
    setDragOverInfo({ day, index });
  };
  
  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, targetDay: string, targetIndex: number) => {
    e.preventDefault();
    setDragOverInfo(null);
    try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        const { sourceDay, sourceIndex } = data;

        if (sourceDay === targetDay && sourceIndex === targetIndex) return;

        const newSchedule = JSON.parse(JSON.stringify(schedule));

        const sourceCourse = newSchedule[sourceDay][sourceIndex];
        const targetCourse = newSchedule[targetDay][targetIndex];

        newSchedule[targetDay][targetIndex] = sourceCourse;
        newSchedule[sourceDay][sourceIndex] = targetCourse;

        onScheduleUpdate(newSchedule);
    } catch (error) {
        console.error("Failed to parse drag data:", error);
    }
  };


  const colorMap = React.useMemo(() => {
    const colors = [
      'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
      'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
      'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
      'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
      'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
      'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700',
      'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
      'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700',
    ];
    const map = new Map<string, string>();
    let colorIndex = 0;
    Object.values(schedule).flat().forEach(course => {
      if (course && course !== '-' && !map.has(course)) {
        map.set(course, colors[colorIndex % colors.length]);
        colorIndex++;
      }
    });
    return map;
  }, [schedule]);
  
  const scheduledCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    Object.values(schedule).flat().forEach(courseName => {
        if (courseName && courseName !== '-') {
            counts.set(courseName, (counts.get(courseName) || 0) + 1);
        }
    });
    return counts;
  }, [schedule]);
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Weekly Class Schedule", 14, 16);

    const head = [['Time', ...daysOfWeek]];
    const body: any[][] = [];
    const middlePeriod = Math.ceil(settings.classesPerDay / 2);

    timeline.forEach(item => {
        if (item.type === 'CLASS') {
            const row = [
                `${item.startTime} - ${item.endTime}`,
                ...daysOfWeek.map(day => {
                    if (settings.holidays.includes(day)) {
                        return item.period === middlePeriod ? 'HOLIDAY' : '';
                    }
                    return schedule[day]?.[item.period - 1] || '-';
                })
            ];
            body.push(row);
        } else { // type === 'BREAK'
            const breakRow = [{ 
                content: `${item.name} (${item.startTime} - ${item.endTime})`, 
                colSpan: daysOfWeek.length + 1,
                styles: { halign: 'center', fillColor: [240, 240, 240], textColor: [100, 100, 100] }
            }];
            body.push(breakRow);
        }
    });

    autoTable(doc, {
        head: head,
        body: body,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo color
        didDrawCell: (data) => {
            const headerText = data.table.head[0].cells[data.column.index]?.text;
            const day = Array.isArray(headerText) ? headerText[0] : headerText;

            if (data.section === 'body' && day && settings.holidays.includes(day)) {
                doc.setFillColor(245, 245, 245); // light grey
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                doc.setTextColor(150);
                doc.text(String(data.cell.text), data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
            }
        },
    });

    doc.save('academic-schedule.pdf');
  };


  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Class Schedule</h2>
            <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export to PDF
            </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Time</th>
                    {daysOfWeek.map(day => (
                        <th key={day} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{day}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700">
                {timeline.map((item, index) => {
                    if (item.type === 'CLASS') {
                        return (
                             <tr key={`class-${item.period}`}>
                                <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-700 dark:text-gray-300 text-center text-sm align-top">
                                   {item.startTime} - {item.endTime}
                                </td>
                                {daysOfWeek.map(day => {
                                    if(settings.holidays.includes(day)) {
                                        const middlePeriod = Math.ceil(settings.classesPerDay / 2);
                                        return (
                                            <td key={day} className="px-0 py-2 align-middle text-center bg-gray-50 dark:bg-gray-800/20">
                                                {item.period === middlePeriod && (
                                                    <div className="flex items-center justify-center h-full">
                                                        <span className="transform -rotate-90 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                            Holiday
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    }
                                    const isDragOver = dragOverInfo?.day === day && dragOverInfo?.index === item.period - 1;
                                    const courseName = schedule[day]?.[item.period - 1];
                                    const hasCourse = courseName && courseName !== '-';
                                    return (
                                        <td 
                                            key={`${day}-${item.period}`} 
                                            className={`px-2 py-2 whitespace-nowrap align-top transition-colors ${isDragOver ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDragEnter={(e) => handleDragEnter(e, day, item.period - 1)}
                                            onDrop={(e) => handleDrop(e, day, item.period - 1)}
                                        >
                                            <div 
                                                draggable={hasCourse}
                                                onDragStart={(e) => handleDragStart(e, day, item.period - 1)}
                                                onDragEnd={handleDragEnd}
                                                className={`h-full p-3 rounded-md text-sm font-semibold border-l-4 transition-all duration-300 ${hasCourse ? 'cursor-grab' : 'cursor-default'} ${colorMap.get(courseName) || 'bg-gray-100 dark:bg-gray-700/50 border-transparent text-gray-400'}`}>
                                                {courseName || '-'}
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        );
                    } else { // type === 'BREAK'
                        return (
                            <tr key={`break-${index}`} className="bg-gray-50 dark:bg-gray-900/30">
                                <td colSpan={daysOfWeek.length + 1} className="text-center py-2 px-4 text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                                    {item.name} ({item.startTime} - {item.endTime})
                                </td>
                            </tr>
                        );
                    }
                })}
                </tbody>
            </table>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    AI Reasoning
                </h3>
                <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{reasoning}</p>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Course Allocation Summary
                </h3>
                <div className="space-y-3 mt-4 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                    {courses.map(course => {
                        const scheduled = scheduledCounts.get(course.name) || 0;
                        const required = course.classesPerWeek;
                        const percentage = required > 0 ? Math.min((scheduled / required) * 100, 100) : 0;
                        const isComplete = scheduled >= required;
                        
                        return (
                            <div key={course.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-200">{course.name}</span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{scheduled} / {required} classes</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ScheduleDisplay;
