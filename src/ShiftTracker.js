import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';

const ShiftTracker = () => {
  const [shifts, setShifts] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [type, setType] = useState('Regular Work');
  const [hours, setHours] = useState('');
  const [toDo, setToDo] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("loggedIn") === "true");
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");

  const shiftColors = {
    "Regular Work": "#3498db",
    "Training": "#f1c40f",
    "Sick Leave": "#e74c3c",
    "Holiday": "#2ecc71",
    "Overtime": "#9b59b6",
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setIsAdmin(false);
    localStorage.setItem("loggedIn", "false");
    localStorage.setItem("isAdmin", "false");
  };

  const addShift = () => {
    if (!selectedDays.length || !hours) return;
    const newShifts = selectedDays.map((day) => ({
      date: day,
      title: type,
      hours,
      toDo,
      color: shiftColors[type]
    }));
    setShifts([...shifts, ...newShifts]);
    setSelectedDays([]);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Shift Tracker Report', 10, 10);
    
    const tableColumn = ["Date", "Shift Type", "Hours Worked", "To-Do"];
    const tableRows = [];
    
    shifts.forEach((shift) => {
      const shiftData = [format(shift.date, 'dd/MM/yyyy'), shift.title, shift.hours, shift.toDo || "-"];
      tableRows.push(shiftData);
    });
    
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'shifts.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-black">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <Button onClick={() => {
          setLoggedIn(true);
          localStorage.setItem("loggedIn", "true");
        }}>
          Mock Login
        </Button>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'bg-gray-900 text-white min-h-screen p-4' : 'bg-gray-100 text-black min-h-screen p-4'}>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Shift Tracker</h1>
        <div>
          <Switch checked={darkMode} onCheckedChange={() => setDarkMode(!darkMode)}>Dark Mode</Switch>
          <Button onClick={handleLogout} className="ml-4">Logout</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Select Your Shift Dates</h2>
          <DayPicker
            mode="multiple"
            selected={selectedDays}
            onSelect={setSelectedDays}
            className="text-black p-2"
            numberOfMonths={1}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border">
            <option>Regular Work</option>
            <option>Training</option>
            <option>Sick Leave</option>
            <option>Holiday</option>
            <option>Overtime</option>
          </select>
          <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours Worked" />
          <Input value={toDo} onChange={(e) => setToDo(e.target.value)} placeholder="To-do for Shift" />
          <Button onClick={addShift}>Add Shift</Button>
        </CardContent>
      </Card>
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Your Scheduled Shifts</h2>
        {shifts.length === 0 ? (
          <p>No shifts added yet.</p>
        ) : (
          shifts.map((shift, index) => (
            <div
              key={index}
              className="p-2 mb-2 rounded-md text-white"
              style={{ backgroundColor: shift.color }}
            >
              {format(shift.date, 'dd/MM/yyyy')} - {shift.title} - {shift.hours} hrs
            </div>
          ))
        )}
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Export Data</h2>
        <Button onClick={exportToPDF} className="mt-2">Export as PDF</Button>
      </div>
    </div>
  );
};

export default ShiftTracker;
